import React from 'react';

export default function ErrorMessage({ message, type = 'error' }) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-800';
      case 'error':
        return 'bg-red-800';
      default:
        return 'bg-red-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-200';
      case 'error':
        return 'text-red-200';
      default:
        return 'text-red-200';
    }
  };

  if (!message) return null;

  return (
    <div className={`${getBackgroundColor()} ${getTextColor()} p-4 rounded-lg mb-4`}>
      {message}
    </div>
  );
}
