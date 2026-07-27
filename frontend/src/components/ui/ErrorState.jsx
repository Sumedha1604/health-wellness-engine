import { AlertCircle } from "lucide-react";

export default function ErrorState({
  title = "Unable to load this page",
  message = "Please check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="flex min-h-52 items-center justify-center py-12">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white px-8 py-8 text-center shadow-card sm:px-12 sm:py-10">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </span>
        <div>
          <p className="text-lg font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
