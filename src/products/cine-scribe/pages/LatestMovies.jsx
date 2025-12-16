// Name of the developer : Bhavya
// Start Date : 28/1/2025
// Modified Date : 28/1/2025
// Overview : This file contains movie cards component.

import React, { useRef } from 'react';
import { MovieCard } from '@shared/ui/movie-card';
import left from '@assets/icons/left.svg';
import right from '@assets/icons/right.svg';
import { fetchData } from '@api/apiMethods';
import { useQuery } from '@tanstack/react-query';

export default function LatestMovies() {
  // const [moviesData, setMoviesData] = useState([]);
  const scrollRef = useRef(null);

  const {
    data: moviesData = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ['latestMovies'],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/dashboard/latest_movies`,
      });
      return response.data.response;
    },
  });

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section className="w-full grid gap-4 mb-2  container mx-auto  px-4">
      <div className="w-full  flex items-center justify-between">
        <div className="text-base text-black font-semibold">
          Trending Movies
        </div>
        <div className=" flex gap-2 items-center justify-center">
          <button onClick={scrollLeft} className="iconButton">
            <img src={left} alt="left" />
          </button>
          <button onClick={scrollRight} className="iconButton">
            <img src={right} alt="right" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="w-full flex justify-center items-center py-8">
          <div className="text-gray-500">Loading latest movies...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full flex justify-center items-center py-8">
          <div className="text-red-500">
            Failed to load movies. Please try again later.
          </div>
        </div>
      )}

      {/* Movies List */}
      {!isPending && !error && (
        <div
          ref={scrollRef}
          className="w-full col-div-10  flex overflow-x-auto scroll-smooth  gap-4  scrollbar-hide"
        >
          {moviesData.map((movie, index) => (
            <div key={index} className="flex-shrink-0 ">
              <MovieCard id={index + 1} {...movie} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
