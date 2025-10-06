'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadCV } from '@/lib/api';
import { CVUploadResponse } from '@/types';
import Button from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

interface CVUploadProps {
  onUploadComplete?: (response: CVUploadResponse) => void;
}

export default function CVUpload({ onUploadComplete }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<CVUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const response = await uploadCV(file);
      setUploadResult(response);
      onUploadComplete?.(response);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload CV
        </CardTitle>
        <CardDescription>
          Upload a PDF file to extract and analyze candidate information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file && !uploadResult && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label htmlFor="cv-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Choose a PDF file
              </span>
              <span className="text-gray-500"> or drag and drop</span>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              PDF files up to 10MB
            </p>
          </div>
        )}

        {file && !uploadResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={uploading}
              >
                Remove
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!file}
                className="flex-1"
              >
                {uploading ? 'Processing...' : 'Upload & Process'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {uploadResult.message}
                </p>
                {uploadResult.resume_id && uploadResult.candidate_id && (
                  <div className="mt-1 text-xs text-green-600">
                    <p>Resume ID: {uploadResult.resume_id}</p>
                    <p>Candidate ID: {uploadResult.candidate_id}</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              Upload Another CV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}