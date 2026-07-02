import React from 'react';
import ModalPortal from '../ui/ModalPortal';

const SavingIndicator = ({ isSaving }) => {
  if (!isSaving) return null;

  return (
    <ModalPortal lockScroll={false}>
      <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span>Saving progress...</span>
      </div>
    </ModalPortal>
  );
};

export default SavingIndicator;
