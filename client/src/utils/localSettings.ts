// The backend's `profiles` table has no column for notification
// preferences (see server/migrations/001_initial_schema.sql — only
// avatar_url, equipped_frame and timezone are user-editable, per
// profile.schema.ts's `.strict()` schema). Rather than inventing a fake
// backend field, this preference is stored per-device in localStorage.

const NOTIFICATIONS_KEY_PREFIX = 'questlife_notifications_';

export const getNotificationsPref = (userId: string): boolean => {
  try {
    const raw = localStorage.getItem(`${NOTIFICATIONS_KEY_PREFIX}${userId}`);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
};

export const setNotificationsPref = (userId: string, enabled: boolean): void => {
  try {
    localStorage.setItem(`${NOTIFICATIONS_KEY_PREFIX}${userId}`, String(enabled));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently,
    // this is a non-critical cosmetic preference.
  }
};
