'use client';

import { useState } from 'react';
import { Users, Briefcase, BarChart3 } from 'lucide-react';
import CVUpload from '@/components/CVUpload';
import JobForm from '@/components/JobForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { CVUploadResponse, JobPostResponse } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'jobs' | 'results'>('upload');
  const [lastCVUpload, setLastCVUpload] = useState<CVUploadResponse | null>(null);
  const [lastJobResult, setLastJobResult] = useState<JobPostResponse | null>(null);

  const handleCVUploadComplete = (response: CVUploadResponse) => {
    setLastCVUpload(response);
  };

  const handleJobPosted = (response: JobPostResponse) => {
    setLastJobResult(response);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                RH — CVs & Vagas
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered CV processing and job matching platform
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Upload CV
              </div>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Post Job
              </div>
            </button>
            {lastJobResult && (
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Results
                </div>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to RH — CVs & Vagas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload CVs to extract candidate information using AI, post job openings,
              and find the best matches automatically.
            </p>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Candidate CVs
                  </h3>
                  <p className="text-gray-600">
                    Submit PDF resumes to automatically extract and structure candidate information
                  </p>
                </div>
                <CVUpload onUploadComplete={handleCVUploadComplete} />

                {lastCVUpload && (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      Want to post a job and find matches?{' '}
                      <button
                        onClick={() => setActiveTab('jobs')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Post a Job →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Create Job Opening
                  </h3>
                  <p className="text-gray-600">
                    Define job requirements to find matching candidates from the database
                  </p>
                </div>
                <JobForm onJobPosted={handleJobPosted} />
              </div>
            )}

            {activeTab === 'results' && lastJobResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Matching Results
                  </h3>
                  <p className="text-gray-600">
                    Best candidate matches for your job opening
                  </p>
                </div>
                <ResultsDisplay results={lastJobResult} />

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Upload More CVs
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Post Another Job →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 RH — CVs & Vagas. Built with Next.js and powered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
