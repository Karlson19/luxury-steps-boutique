export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#1C0A0E] via-[#2A0F15] to-[#1C0A0E] pt-20 lg:pt-28 pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-3 w-32 bg-white/10 rounded-full mb-4 animate-pulse" />
          <div className="h-16 sm:h-24 w-3/4 bg-white/10 rounded-2xl mb-6 animate-pulse" />
          <div className="h-4 w-1/2 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="h-9 w-40 sm:w-56 bg-gray-100 rounded-full animate-pulse" />
          <div className="hidden lg:flex gap-2 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse ml-auto" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 skeleton" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-2 w-1/3 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
