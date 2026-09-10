export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      <span className="ml-3 text-lg font-medium">Loading levels...</span>
    </div>
  );
}
