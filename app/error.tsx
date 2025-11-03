'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}



