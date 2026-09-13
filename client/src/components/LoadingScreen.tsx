export const LoadingScreen = ({ label = 'Loading your quest log...' }: { label?: string }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-bg px-6 py-20 text-center">
      <div
        className="w-10 h-10 border-4 border-blue border-t-gold rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
      <p className="font-pixel text-[10px] text-[#8CA6C4] leading-relaxed">{label}</p>
    </div>
  );
};
