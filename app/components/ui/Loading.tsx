const Loading = () => {
  return (
    <div className="flex items-center justify-center py-6">
      <div
        role="status"
        aria-label="Loading"
        className="h-7 w-7 animate-spin rounded-full border-2 border-purple-300/30 border-t-purple-500"
      />
    </div>
  );
};

export default Loading;
