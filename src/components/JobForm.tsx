'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { postJob } from '@/lib/api';
import { Job, JobPostResponse } from '@/types';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

// Form input schema (strings that get transformed)
const jobFormSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  seniority: z.string().min(1, 'Seniority is required'),
  location: z.string().min(1, 'Location is required'),
  workMode: z.string().min(1, 'Work mode is required'),
  contractType: z.string().min(1, 'Contract type is required'),
  languages: z.string(),
  mustHave: z.string(),
  niceToHave: z.string(),
  salaryMin: z.string(),
  salaryMax: z.string(),
  currency: z.string().min(1, 'Currency is required'),
  keywords: z.string(),
  rawText: z.string().min(1, 'Job description is required'),
  webhookUrl: z.string().optional(),
  executionMode: z.string().optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  onJobPosted?: (response: JobPostResponse) => void;
}

export default function JobForm({ onJobPosted }: JobFormProps) {
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<JobPostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      currency: 'EUR',
      workMode: 'Remote',
      contractType: 'Full-time',
    },
  });

  const onSubmit = async (data: JobFormData) => {
    setPosting(true);
    setError(null);

    try {
      // Transform form data to job data format
      const jobData: Job = {
        ...data,
        languages: data.languages.split(',').map(s => s.trim()).filter(Boolean),
        mustHave: data.mustHave.split(',').map(s => s.trim()).filter(Boolean),
        niceToHave: data.niceToHave.split(',').map(s => s.trim()).filter(Boolean),
        salaryMin: parseFloat(data.salaryMin) || 0,
        salaryMax: parseFloat(data.salaryMax) || 0,
        keywords: data.keywords.split(',').map(s => s.trim()).filter(Boolean),
      };

      const response = await postJob(jobData);
      setPostResult(response);
      onJobPosted?.(response);
    } catch (err) {
      setError('Failed to post job. Please try again.');
      console.error('Job posting error:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleReset = () => {
    reset();
    setPostResult(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          Create Job Opening
        </CardTitle>
        <CardDescription className="text-gray-600 text-base">
          Post a job position and automatically find matching candidates from your database
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {!postResult ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Frontend Developer"
                  {...register('title')}
                  error={errors.title?.message}
                  className="text-gray-900"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Seniority Level
                  </label>
                  <select
                    {...register('seniority')}
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select seniority level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                  </select>
                  {errors.seniority && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.seniority.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="relative">
                  <div className="absolute left-3 top-9">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="ml-8">
                    <Input
                      label="Location"
                      placeholder="e.g. Lisbon, Portugal"
                      {...register('location')}
                      error={errors.location?.message}
                      className="text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Work Mode
                  </label>
                  <select
                    {...register('workMode')}
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Remote">🏠 Remote</option>
                    <option value="Hybrid">🏢 Hybrid</option>
                    <option value="On-site">🏬 On-site</option>
                  </select>
                  {errors.workMode && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.workMode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Contract Type
                  </label>
                  <select
                    {...register('contractType')}
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Full-time">🤝 Full-time</option>
                    <option value="Part-time">⏰ Part-time</option>
                    <option value="Contract">📋 Contract</option>
                    <option value="Freelance">💼 Freelance</option>
                  </select>
                  {errors.contractType && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.contractType.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Compensation Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Compensation</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <Input
                    label="Languages Required"
                    placeholder="e.g. English, Portuguese, Spanish"
                    {...register('languages')}
                    error={errors.languages?.message}
                    className="text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Currency
                  </label>
                  <select
                    {...register('currency')}
                    className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                  {errors.currency && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.currency.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Min Salary"
                    type="number"
                    placeholder="30,000"
                    {...register('salaryMin')}
                    error={errors.salaryMin?.message}
                    className="text-gray-900"
                  />
                  <Input
                    label="Max Salary"
                    type="number"
                    placeholder="60,000"
                    {...register('salaryMax')}
                    error={errors.salaryMax?.message}
                    className="text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Requirements Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Skills & Requirements</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Must-Have Skills *
                  </label>
                  <Input
                    placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                    {...register('mustHave')}
                    error={errors.mustHave?.message}
                    className="text-gray-900"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple skills with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Nice-to-Have Skills
                  </label>
                  <Input
                    placeholder="e.g. Docker, AWS, GraphQL (comma-separated)"
                    {...register('niceToHave')}
                    error={errors.niceToHave?.message}
                    className="text-gray-900"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple skills with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Keywords
                  </label>
                  <Input
                    placeholder="e.g. frontend, react, javascript (comma-separated)"
                    {...register('keywords')}
                    error={errors.keywords?.message}
                    className="text-gray-900"
                  />
                  <p className="mt-1 text-xs text-gray-500">Keywords for better matching</p>
                </div>
              </div>
            </div>

            {/* Job Description Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
              </div>

              <div>
                <Textarea
                  label="Detailed Description *"
                  placeholder="Provide a detailed description of the role, responsibilities, team, company culture, and requirements..."
                  rows={8}
                  {...register('rawText')}
                  error={errors.rawText?.message}
                  className="text-gray-900"
                />
                <p className="mt-2 text-xs text-gray-500">
                  The more detailed your description, the better we can match candidates
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                loading={posting}
                disabled={posting}
                className="flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {posting ? 'Creating Job Opening...' : '🚀 Post Job & Find Matches'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={posting}
                className="h-12 px-6 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear Form
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-green-800">
                  ✅ {postResult.message}
                </p>
                {postResult.job_id && (
                  <p className="text-sm text-green-600 mt-1">
                    Job Reference ID: <span className="font-mono font-medium">{postResult.job_id}</span>
                  </p>
                )}
              </div>
            </div>

            {postResult.top_resume && (
              <Card className="border-2 border-green-200 bg-green-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">🎯</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Best Match Found</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Match Score:</span>
                        <div className="mt-1">
                          <span className="text-2xl font-bold text-green-600">
                            {postResult.top_resume.score}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Resume ID:</span>
                        <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {postResult.top_resume.resume_id}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Candidate ID:</span>
                      <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {postResult.top_resume.candidate_id}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block mb-2">Why This Match:</span>
                      <div className="bg-white p-3 rounded-lg border">
                        <ul className="space-y-1">
                          {postResult.top_resume.reasons.map((reason, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {postResult.total_matches && postResult.total_matches > 1 && (
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Found <span className="font-bold text-blue-900">{postResult.total_matches}</span> total matches
                  {postResult.total_matches > 10 && '. Showing top 10 results.'}
                </p>
              </div>
            )}

            <Button
              onClick={handleReset}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              📝 Create Another Job Opening
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}