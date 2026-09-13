import { apiClient } from './client';
import type { ApiEnvelope, CurrentUser, RegisterLoginResult } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// POST /api/auth/register
export const registerRequest = async (payload: RegisterPayload) => {
  const res = await apiClient.post<ApiEnvelope<RegisterLoginResult>>(
    '/auth/register',
    payload,
  );
  return res.data.data;
};

// POST /api/auth/login
export const loginRequest = async (payload: LoginPayload) => {
  const res = await apiClient.post<ApiEnvelope<RegisterLoginResult>>(
    '/auth/login',
    payload,
  );
  return res.data.data;
};

// GET /api/auth/me
export const fetchCurrentUser = async () => {
  const res = await apiClient.get<ApiEnvelope<CurrentUser>>('/auth/me');
  return res.data.data;
};
