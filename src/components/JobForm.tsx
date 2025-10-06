'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, MapPin, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { postJob } from '@/lib/api';
import { Job, JobPostResponse } from '@/types';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  seniority: z.string().min(1, 'Seniority is required'),
  location: z.string().min(1, 'Location is required'),
  workMode: z.string().min(1, 'Work mode is required'),
  contractType: z.string().min(1, 'Contract type is required'),
  languages: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  mustHave: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  niceToHave: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  salaryMin: z.string().transform((val) => parseFloat(val) || 0),
  salaryMax: z.string().transform((val) => parseFloat(val) || 0),
  currency: z.string().min(1, 'Currency is required'),
  keywords: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  rawText: z.string().min(1, 'Job description is required'),
});

type JobFormData = z.infer<typeof jobSchema>;

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
    resolver: zodResolver(jobSchema),
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
      const jobData: Job = {
        ...data,
        languages: data.languages,
        mustHave: data.mustHave,
        niceToHave: data.niceToHave,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        keywords: data.keywords,
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Post Job Opening
        </CardTitle>
        <CardDescription>
          Create a job posting to find matching candidates from the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!postResult ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                placeholder="e.g. Senior Frontend Developer"
                {...register('title')}
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seniority Level
                </label>
                <select
                  {...register('seniority')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select seniority</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                </select>
                {errors.seniority && (
                  <p className="mt-1 text-sm text-red-600">{errors.seniority.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <Input
                  label="Location"
                  placeholder="e.g. Lisbon, Portugal"
                  {...register('location')}
                  error={errors.location?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Mode
                </label>
                <select
                  {...register('workMode')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
                {errors.workMode && (
                  <p className="mt-1 text-sm text-red-600">{errors.workMode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Type
                </label>
                <select
                  {...register('contractType')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
                {errors.contractType && (
                  <p className="mt-1 text-sm text-red-600">{errors.contractType.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Languages (comma-separated)"
                placeholder="e.g. English, Portuguese"
                {...register('languages')}
                error={errors.languages?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Min Salary"
                  type="number"
                  placeholder="30000"
                  {...register('salaryMin')}
                  error={errors.salaryMin?.message}
                />
                <Input
                  label="Max Salary"
                  type="number"
                  placeholder="60000"
                  {...register('salaryMax')}
                  error={errors.salaryMax?.message}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Must-Have Skills (comma-separated)
                </label>
                <Input
                  placeholder="e.g. React, TypeScript, Node.js"
                  {...register('mustHave')}
                  error={errors.mustHave?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nice-to-Have Skills (comma-separated)
                </label>
                <Input
                  placeholder="e.g. Docker, AWS, GraphQL"
                  {...register('niceToHave')}
                  error={errors.niceToHave?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <Input
                  placeholder="e.g. frontend, react, javascript"
                  {...register('keywords')}
                  error={errors.keywords?.message}
                />
              </div>
            </div>

            <div>
              <Textarea
                label="Job Description"
                placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
                rows={6}
                {...register('rawText')}
                error={errors.rawText?.message}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                loading={posting}
                disabled={posting}
                className="flex-1"
              >
                {posting ? 'Posting Job...' : 'Post Job & Find Matches'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={posting}
              >
                Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {postResult.message}
                </p>
                {postResult.job_id && (
                  <p className="text-xs text-green-600 mt-1">
                    Job ID: {postResult.job_id}
                  </p>
                )}
              </div>
            </div>

            {postResult.top_resume && (
              <Card variant="outlined">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Best Match Found:</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Match Score:</span>{' '}
                      <span className="text-green-600 font-bold">
                        {postResult.top_resume.score}%
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Resume ID:</span>{' '}
                      {postResult.top_resume.resume_id}
                    </p>
                    <p>
                      <span className="font-medium">Candidate ID:</span>{' '}
                      {postResult.top_resume.candidate_id}
                    </p>
                    <div>
                      <span className="font-medium">Match Reasons:</span>
                      <ul className="mt-1 ml-4 list-disc text-xs text-gray-600">
                        {postResult.top_resume.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              Post Another Job
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}