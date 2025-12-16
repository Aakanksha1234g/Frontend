import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import CategoryBarChart from '@products/cine-scribe/pages/BarPlot';

export function MovieCard({
  id,
  title,
  genres,
  rating,
  image,
  bar_data,
  date,
  summary,
}) {
  const [popupData, setPopupData] = useState(null);
  const closePopup = () => setPopupData(null);
  return (
    <>
      <Card
        className="group relative cursor-pointer overflow-hidden border-none shadow-shadow-chat-button transition-all hover:shadow-lg rounded-lg w-[150px]"
        onClick={() => setPopupData(id)}
      >
        <CardHeader className="p-4">
          <div className="aspect-[11/12] overflow-hidden">
            <img
              src={image || '/placeholder.svg'}
              alt={title}
              height={200}
              width={200}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className=" p-2">
          <p className="absolute top-1 left-1 flex items-center gap-1 text-xs bg-white p-1 rounded-xl text-muted-foreground text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-yellow-600"
            >
              <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.402 8.172L12 18.896l-7.336 3.857 1.402-8.172L.132 9.211l8.2-1.193z" />
            </svg>
            {rating}
          </p>

          <CardTitle className="text-[11px] text-center overflow-hidden text-ellipsis whitespace-nowrap">
            {title.toUpperCase()}
          </CardTitle>
        </CardContent>
      </Card>

      {popupData && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 bg-opacity-50 backdrop-blur-md"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-2xl px-8 py-8 flex flex-col items-center justify-start w-[calc(100vw-50px)] max-w-full h-[80vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Title */}
            <h2 className="text-2xl font-semibold text-center mb-4 text-black dark:text-white">
              Summary for {title}
            </h2>

            {/* Movie Details & Critic Review in One Row */}
            <div className="flex flex-row items-start w-full gap-6">
              {/* Movie Poster */}
              <div className="relative w-[200px] h-[300px] rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={image || '/placeholder.svg'}
                  alt="movie-image"
                  className="w-full h-full object-cover rounded-xl"
                />
                {/* Rating Badge */}
                <p className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-white bg-opacity-80 px-2 py-1 rounded-lg shadow text-black font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-yellow-600"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.402 8.172L12 18.896l-7.336 3.857 1.402-8.172L.132 9.211l8.2-1.193z" />
                  </svg>
                  {rating}
                </p>
              </div>

              {/* Movie Info + Critic Review (Stacked in a Column) */}
              <div className="flex flex-col w-full gap-4">
                {/* Movie Details */}
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{genres}</p>
                  <p className="text-sm text-muted-foreground">{date}</p>
                </div>

                {/* Critic Review */}
                <div className="w-full">
                  <h6 className="text-black dark:text-white font-bold text-lg mb-2">
                    Summary
                  </h6>
                  <p className="text-sm text-muted-foreground h-auto max-h-[200px] overflow-y-auto">
                    {summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Bar Chart Section (Separate Row) */}
            <div className="w-full flex flex-col  items-start mt-2">
              <h6 className="w-full text-black dark:text-white font-bold text-lg mb-2">
                Audience Feedback
              </h6>
              <div className="w-full h-[400px] flex justify-center items-center">
                <CategoryBarChart bar_data={bar_data} />
              </div>
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-6 cursor-pointer p-2 text-black dark:text-white text-xl shadow-lg shadow-shadow-chat-button"
              onClick={closePopup}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
