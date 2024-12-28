export default function LoadingSpinner({ size = 'medium', message = null }) {
  const sizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500`} />
      {message && (
        <p className="mt-4 text-gray-300 text-sm">{message}</p>
      )}
    </div>
  );
}
