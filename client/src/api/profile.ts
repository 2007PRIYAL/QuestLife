import { apiClient } from './client';
import type { ApiEnvelope, Profile } from '@/types';

// GET /api/profile
export const fetchProfile = async () => {
  const res = await apiClient.get<ApiEnvelope<Profile>>('/profile');
  return res.data.data;
};

export interface UpdateProfilePayload {
  avatar_url?: string;
  equipped_frame?: string;
  timezone?: string;
}

// PATCH /api/profile
export const updateProfileRequest = async (payload: UpdateProfilePayload) => {
  const res = await apiClient.patch<ApiEnvelope<Profile>>('/profile', payload);
  return res.data.data;
};
