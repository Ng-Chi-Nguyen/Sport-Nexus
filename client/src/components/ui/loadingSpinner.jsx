// src/components/ui/LoadingSpinner.jsx
const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner với màu chủ đạo #4facf3 */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#323232] border-t-[#4facf3]"></div>
        <p className="font-bold text-[#323232] animate-pulse uppercase tracking-widest">
          Đang tải Sport Nexus...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
