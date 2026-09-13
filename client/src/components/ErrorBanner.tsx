import { AlertTriangle } from 'lucide-react';

export const ErrorBanner = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 bg-[#2A0F0F] border-2 border-red rounded-pixel px-3 py-2.5 text-[#FFD5D5] text-sm"
    >
      <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
