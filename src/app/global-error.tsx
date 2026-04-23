"use client";

// Sentry has been removed
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console as fallback
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
            <p className="mb-4 text-gray-700">
              We apologize for the inconvenience. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-full bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}