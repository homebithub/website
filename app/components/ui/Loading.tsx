import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center py-6">
      <div
        role="status"
        aria-label="Loading"
        className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-primary"
      />
    </div>
  );
};

export default Loading;
