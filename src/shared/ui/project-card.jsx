import { useEffect, useState } from 'react';
import { Card, CardHeader } from './card';
import TrashBin from '@assets/icons/TrashBin.svg';
import timeIcon from '@assets/icons/time-icon.svg';
import { relativeTime } from '@shared/utils/relative-time';

// Camera fallback icon (for missing images)
const CameraIcon = () => (
  <svg
    className="w-6 h-6 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

function ImageWithFallback({ src, alt }) {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!src) {
      setIsValid(false);
      return;
    }

    const img = new Image();
    img.onload = () => setIsValid(true);
    img.onerror = () => setIsValid(false);
    img.src = src;
  }, [src]);

  if (isValid) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-t-md"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <CameraIcon />
      <span className="text-sm mt-1">No preview available</span>
    </div>
  );
}

export function ProjectCard({
  title,
  date,
  imageSrc,
  onClick,
  onDelete,
  className,
}) {
  return (
    <Card
      className={`group relative w-full bg-white overflow-hidden max-w-sm ${className}`}
    >
      {/* Image Section */}
      <CardHeader className="p-0 m-0">
        <div className="h-[200px] overflow-hidden flex items-center justify-center bg-gray-100">
          <ImageWithFallback src={imageSrc} alt={title} />
        </div>
      </CardHeader>

      {/* Content Section */}
      <div className="flex flex-col p-3 pt-4">
        <h1 className="text-md font-semibold text-gray-700 my-2 line-clamp-1">
          {title.slice(0, 1).toUpperCase() + title.slice(1)}
        </h1>

        <div className="flex items-center justify-between">
          <button
            onClick={onClick}
            className="px-4 py-2 text-sm font-bold cursor-pointer text-white bg-primary-blue-100 rounded-md hover:bg-sky-600"
          >
            Open
          </button>

          <div className="flex items-center gap-2">
            <img src={timeIcon} alt="time icon" className="h-5 w-4" />
            <RelativeDate date={date} />
            <button
              className="text-error-300 hover:opacity-75 cursor-pointer"
              aria-label="Delete project"
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <img src={TrashBin} alt="delete icon" className="h-5 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RelativeDate({ date }) {
  const [relative, setRelative] = useState('');

  useEffect(() => {
    relativeTime.format(date).then(formatted => {
      setRelative(formatted);
    });
  }, [date]);

  return <p className="text-sm text-gray-600 truncate">{relative}</p>;
}
