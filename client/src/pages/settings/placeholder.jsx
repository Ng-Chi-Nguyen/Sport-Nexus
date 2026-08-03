const ProfilePlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="text-slate-400 text-2xl font-bold">...</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        Tính năng đang phát triển
      </h3>
      <p className="text-sm text-slate-500">Trang này sẽ sớm được cập nhật.</p>
    </div>
  );
};

export default ProfilePlaceholder;
