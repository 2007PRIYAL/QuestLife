import { apiClient } from './client';
import type { ApiEnvelope, CreateQuestInput, Quest, QuestRewardResult } from '@/types';

// GET /api/quests
export const fetchQuests = async () => {
  const res = await apiClient.get<ApiEnvelope<Quest[]>>('/quests');
  return res.data.data;
};

// GET /api/quests/:id
export const fetchQuest = async (id: string) => {
  const res = await apiClient.get<ApiEnvelope<Quest>>(`/quests/${id}`);
  return res.data.data;
};

// POST /api/quests
export const createQuestRequest = async (payload: CreateQuestInput) => {
  const res = await apiClient.post<ApiEnvelope<Quest>>('/quests', payload);
  return res.data.data;
};

// PATCH /api/quests/:id
export const updateQuestRequest = async (id: string, payload: Partial<CreateQuestInput>) => {
  const res = await apiClient.patch<ApiEnvelope<Quest>>(`/quests/${id}`, payload);
  return res.data.data;
};

// DELETE /api/quests/:id
export const deleteQuestRequest = async (id: string) => {
  const res = await apiClient.delete<ApiEnvelope<{ id: string }>>(`/quests/${id}`);
  return res.data.data;
};

// POST /api/quests/:id/complete
export const completeQuestRequest = async (questOrId: Quest | string): Promise<QuestRewardResult> => {
  const id = typeof questOrId === 'string' ? questOrId : questOrId.id;
  const res = await apiClient.post<ApiEnvelope<QuestRewardResult>>(
    `/quests/${id}/complete`,
  );
  return res.data.data;
};

/**
 * Calculates remaining seconds until midnight in the specified timezone.
 */
export const getSecondsUntilMidnight = (timeZone: string = 'UTC'): number => {
  try {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    const parts = dtf.formatToParts(now);
    const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
    const hour = getPart('hour') % 24;
    const minute = getPart('minute');
    const second = getPart('second');

    const secondsPassed = hour * 3600 + minute * 60 + second;
    const remaining = 86400 - secondsPassed;
    return remaining > 0 ? remaining : 0;
  } catch {
    const now = new Date();
    const utcSec = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
    return Math.max(0, 86400 - utcSec);
  }
};

/**
 * Formats seconds into HH:MM:SS.
 */
export const formatCountdown = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

