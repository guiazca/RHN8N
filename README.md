# RH — CVs & Vagas

AI-powered CV processing and job matching platform built with Next.js. This MVP allows you to upload PDF resumes, extract candidate information using AI, post job openings, and automatically find the best matches between candidates and positions.

## Features

- **CV Upload & Processing**: Upload PDF resumes and automatically extract candidate information using AI
- **Job Posting**: Create detailed job openings with requirements, skills, and preferences
- **AI Matching**: Intelligent matching between candidates and job openings using AI scoring
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **API Integration**: Ready to integrate with n8n workflows and external services

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks (useState)
- **HTTP Client**: Axios for API calls
- **Build Tools**: ESLint, Prettier for code quality

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── upload/        # CV upload endpoint
│   │   └── jobs/          # Job posting endpoint
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Progress.tsx
│   ├── CVUpload.tsx      # CV upload component
│   ├── JobForm.tsx       # Job posting form
│   └── ResultsDisplay.tsx # Results display component
├── lib/                  # Utility functions
│   ├── api.ts           # API client configuration
│   ├── utils.ts         # Utility functions
│   └── error-handling.ts # Error handling utilities
└── types/               # TypeScript type definitions
    └── index.ts         # Application types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/guiazca/RHN8N.git
cd rhn8n-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your configuration:
```env

# Firebase Configuration
FIREBASE_PROJECT_ID=iacv-710e4
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"

# API Endpoints (n8n webhooks)
CV_UPLOAD_WEBHOOK=https://your-n8n-instance.com/webhook/upload
JOB_POST_WEBHOOK=https://your-n8n-instance.com/webhook/jobs

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="RH — CVs & Vagas"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Upload CVs

1. Navigate to the "Upload CV" tab
2. Drag and drop or select a PDF file (max 10MB)
3. The system will process the CV and extract candidate information
4. You'll receive a confirmation with resume and candidate IDs

### Post Jobs

1. Navigate to the "Post Job" tab
2. Fill in the job details including:
   - Title and seniority level
   - Location and work mode
   - Required skills (must-have and nice-to-have)
   - Salary range and currency
   - Job description
3. Submit to create the job posting
4. The system will automatically find and score matching candidates

### View Results

1. After posting a job, view the "Results" tab
2. See the top candidate match with:
   - Match score percentage
   - Match reasons and explanations
   - Candidate details and contact information

## API Integration

The application is designed to work with n8n workflows:

- **CV Upload**: Forwards uploaded PDFs to the n8n CV processing workflow
- **Job Posting**: Sends job data to the n8n job matching workflow
- **Demo Mode**: Works without external APIs using mock responses

## Development

### Code Quality

The project includes comprehensive tooling:

- **ESLint**: Code linting with Next.js and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Full type safety and IntelliSense support

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform supporting Node.js:

- Docker containers
- AWS Amplify
- Netlify (with serverless functions)
- Traditional VPS/Cloud servers

## Configuration

### Environment Variables

- `FIREBASE_PROJECT_ID`: Firebase project ID for data storage
- `FIREBASE_CLIENT_EMAIL`: Service account email for Firebase admin
- `FIREBASE_PRIVATE_KEY`: Private key for Firebase authentication
- `CV_UPLOAD_WEBHOOK`: n8n webhook URL for CV processing
- `JOB_POST_WEBHOOK`: n8n webhook URL for job posting

### Demo Mode

Without external API keys, the application runs in demo mode:
- CV uploads return mock responses
- Job postings simulate matching with fake candidates
- Full UI functionality for testing and demonstration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Review the documentation and code comments
- Check the n8n workflow configuration guide

## Roadmap

- [ ] User authentication and authorization
- [ ] Advanced filtering and search
- [ ] Candidate profile management
- [ ] Email notifications for matches
- [ ] Analytics and reporting dashboard
- [ ] Multi-language support
- [ ] Mobile app version
