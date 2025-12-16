import React from 'react';
import CategoryBarChart from './BarPlot';
import GenrePieChart from './PieChart';
import { fetchData } from '@api/apiMethods';
import { useQuery } from '@tanstack/react-query';

// Simple skeleton loader component
function Skeleton({ height = 24, width = '100%', className = '' }) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      style={{ height, width }}
    />
  );
}

export default function Trends() {
  const COLORS = [
    '#48A6A7', // light indigo
    '#1B56FD', // light green
    '#FCB454', // light yellow
    '#FCA5A5', // light red
  ];

  const {
    data: trendsData,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ['trendsData'],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/dashboard/overall_analysis`,
        method: 'GET',
      });
      return response.data.response;
    },
    refetchOnWindowFocus: false,
  });

  // Skeletons for loading state
  const BarChartSkeleton = (
    <div className="w-full h-[400px] flex flex-col gap-4 justify-center">
      <Skeleton height={32} width="40%" className="mb-2" />
      <Skeleton height={24} width="60%" />
      <Skeleton height={24} width="80%" />
      <Skeleton height={24} width="70%" />
      <Skeleton height={24} width="50%" />
      <Skeleton height={300} width="100%" className="mt-4" />
    </div>
  );

  const PieChartSkeleton = (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Skeleton height={200} width={200} className="mx-auto" />
    </div>
  );

  const GenreSummarySkeleton = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-300 p-4 bg-white shadow-md rounded-2xl"
        >
          <Skeleton height={20} width="60%" className="mb-2" />
          <Skeleton height={16} width="80%" className="mb-1" />
          <Skeleton height={16} width="70%" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Audience Reviews Categorization Section */}
      <div className="hidden md:block w-full h-auto px-10 py-6 mb-10 container mx-auto">
        <h2 className="text-lg font-semibold mb-4">
          Audience Reviews Categorization
        </h2>
        <p className="text-sm text-black text-left mb-6">
          These categories reflect how audiences have responded to various
          aspects of storytelling over the past two years, including story,
          music, visuals, characters, and more.
        </p>

        {isPending || isFetching ? (
          BarChartSkeleton
        ) : isError ? (
          <div className="text-red-500">
            Error loading data: {error?.message || 'Unknown error'}
            <button
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : trendsData?.overallAnalysisBarData ? (
          <CategoryBarChart bar_data={trendsData.overallAnalysisBarData} />
        ) : (
          <div className="text-red-500">No data available.</div>
        )}
      </div>

      {/* Top Trending Genres Section */}
      <div className="container mx-auto px-10 mb-10">
        <h2 className="text-lg font-semibold mb-2">Top 4 Trending Genres</h2>
        <p className="text-sm text-black text-left mb-6">
          Discover the most popular and impactful genre combinations that have
          resonated with audiences over the past two years. These pairings
          showcase powerful storytelling blends—balancing emotion, excitement,
          and depth—that keep viewers engaged and highlight what they’re truly
          drawn to.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Pie Chart */}
          <div className="w-full md:max-w-[500px]">
            {isPending || isFetching ? (
              PieChartSkeleton
            ) : isError ? (
              <div className="text-red-500">
                Error loading data: {error?.message || 'Unknown error'}
                <button
                  className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => refetch()}
                >
                  Retry
                </button>
              </div>
            ) : trendsData?.overallGenresPieChartData ? (
              <GenrePieChart
                genres={trendsData.overallGenresPieChartData.genres}
              />
            ) : (
              <div className="text-red-500">No data available.</div>
            )}
          </div>

          {/* Genre Combination Summary */}
          <div className="w-full h-full overflow-y-auto max-h-[500px]">
            {isPending || isFetching ? (
              GenreSummarySkeleton
            ) : isError ? (
              <div className="text-red-500">
                Error loading data: {error?.message || 'Unknown error'}
                <button
                  className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => refetch()}
                >
                  Retry
                </button>
              </div>
            ) : trendsData?.overallGenresPieChartData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendsData.overallGenresPieChartData.genres.map(
                  (genre, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 p-4 bg-white shadow-md shadow-shadow-chat-button rounded-2xl"
                    >
                      <h3
                        className="font-bold text-sm mb-2"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {genre.type} ({genre.count})
                      </h3>
                      <ul className="list-disc ml-5 text-sm text-gray-700">
                        {genre.combinations.map((combo, i) => (
                          <li key={i}>{combo.join(', ')}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
