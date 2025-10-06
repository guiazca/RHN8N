import axios from 'axios';
import { CVUploadResponse, JobPostResponse, Job } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCV = async (file: File): Promise<CVUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<CVUploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const postJob = async (jobData: Job): Promise<JobPostResponse> => {
  const response = await api.post<JobPostResponse>('/jobs', jobData);
  return response.data;
};

export default api;