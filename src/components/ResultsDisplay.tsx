'use client';

import { JobPostResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { CheckCircle, User, Target } from 'lucide-react';

interface ResultsDisplayProps {
  results: JobPostResponse;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results.top_resume) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Job Posted Successfully</CardTitle>
          <CardDescription>
            No matching candidates found in the database yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-blue-700">
              Job ID: {results.job_id} has been posted successfully.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { top_resume } = results;
  const scoreColor = top_resume.score >= 80 ? 'green' : top_resume.score >= 60 ? 'yellow' : 'red';

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Best Match Found
        </CardTitle>
        <CardDescription>
          Top candidate match based on skills, experience, and requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl font-bold text-gray-900">
              {top_resume.score}%
            </span>
            <Badge variant={scoreColor === 'green' ? 'success' : scoreColor === 'yellow' ? 'warning' : 'danger'}>
              {scoreColor === 'green' ? 'Excellent Match' : scoreColor === 'yellow' ? 'Good Match' : 'Fair Match'}
            </Badge>
          </div>
          <Progress value={top_resume.score} className="w-full max-w-md mx-auto" />
        </div>

        {/* Candidate Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Candidate Details</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Resume ID:</span>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                    {top_resume.resume_id}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Candidate ID:</span>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                    {top_resume.candidate_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-sm">Match Reasons</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {top_resume.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            View Full Profile
          </button>
          <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Contact Candidate
          </button>
        </div>
      </CardContent>
    </Card>
  );
}