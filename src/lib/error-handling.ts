export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode);
  }
}

export const handleAsyncError = (fn: (req: unknown, res: unknown, next: (err?: unknown) => void) => Promise<void>) => {
  return (req: unknown, res: unknown, next: (err?: unknown) => void) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error && error.name === 'ValidationError') {
    return {
      success: false,
      message: 'Validation failed',
      errors: 'errors' in error ? (error as Record<string, unknown>).errors : undefined,
      statusCode: 400,
    };
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return {
    success: false,
    message: 'Internal server error',
    statusCode: 500,
  };
};