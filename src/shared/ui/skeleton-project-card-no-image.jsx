export default function ProjectCardNoImageSkeleton({ className = '' }) {
  return (
    <div
      className={`w-full max-w-[320px] overflow-hidden bg-white rounded-2xl shadow-lg border border-primary-gray-100 p-5 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
        {/* Edit/Delete Icons Skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      {/* Genres Skeleton */}
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2 animate-pulse" />
      {/* Date Skeleton */}
      <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
      {/* Highlight Text Skeleton (optional) */}
      <div className="absolute bottom-2 right-2 h-5 w-16 bg-gray-200 rounded-md animate-pulse" />
    </div>
  );
}
