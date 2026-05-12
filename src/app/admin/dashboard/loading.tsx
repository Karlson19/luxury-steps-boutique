export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-200 to-rose-300 rounded-xl animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-2 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-3 w-48 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gradient-to-br from-rose-100 via-rose-200 to-rose-100 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
