import React from 'react';

const SavingIndicator = ({ isSaving }) => {
  if (!isSaving) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
      <span>Saving progress...</span>
    </div>
  );
};

export default SavingIndicator;
