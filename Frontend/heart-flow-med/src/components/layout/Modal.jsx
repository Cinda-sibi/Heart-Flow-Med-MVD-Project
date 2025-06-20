import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Background overlay - closes modal on click */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Close modal background"
      />
      {/* Modal content - stop click propagation */}
      <div
        className="bg-white rounded-lg shadow-lg p-6 relative min-w-[300px] max-w-2xl w-full sm:w-[600px] max-h-[90vh] overflow-y-auto z-50"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 