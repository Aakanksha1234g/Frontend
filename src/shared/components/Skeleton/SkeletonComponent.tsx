import React from 'react';

interface SkeletonProps {
  type?:
    | 'box' // Default box skeleton
    | 'text' // Text skeleton
    | 'paragraph'
    | 'circle'
    | 'avatar'
    | 'title'
    | 'card'
    | 'media'
    | 'button'
    | 'input'
    | 'list';
  width?: number | string;
  height?: number | string;
  lineCount?: number;
  shape?: 'rounded' | 'square';
  theme?: 'light' | 'dark';
  preset?: 'profile' | 'form' | 'article' | 'cardList';
}

const SkeletonComponent: React.FC<SkeletonProps> = ({
  type = 'box',
  width = 8,
  height = 8,
  lineCount = 3,
  shape = 'square',
  theme = 'light',
  preset,
}) => {
    const resolveSize = (val: number | string, dimension: 'w' | 'h') => {
    if (typeof val === 'number') return `${dimension}-${val}`;
    return `${dimension}-[${val}]`;
  };

  // Soft gray base color
  const color =
    theme === 'light' ? 'bg-[#b0b0b0]/40' : 'bg-[#2b2b2b]/70';
  const shapeClass =
    shape === 'rounded' || type === 'circle' || type === 'avatar'
      ? 'rounded-full'
      : 'rounded-sm';

  // Custom shimmer animation
  const baseClass = `relative overflow-hidden ${color} ${shapeClass}`;

  const sizeClass = `${resolveSize(width, 'w')} ${resolveSize(height, 'h')}`;

  // Preset layouts
  if (preset === 'profile') {
    return (
      <div className="space-y-2">
        <SkeletonComponent type="avatar" width={16} height={16} />
        <SkeletonComponent type="title" />
        <SkeletonComponent type="paragraph" lineCount={2} />
      </div>
    );
  }

  if (preset === 'form') {
    return (
      <div className="space-y-2">
        <SkeletonComponent type="title" />
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <SkeletonComponent key={i} type="input" />
          ))}
        <SkeletonComponent type="button" />
      </div>
    );
  }

  if (preset === 'article') {
    return (
      <div className="space-y-1">
        <SkeletonComponent type="title" />
        <SkeletonComponent type="paragraph" lineCount={4} />
        <SkeletonComponent type="media" width="100%" height={64} />
      </div>
    );
  }

  if (preset === 'cardList') {
    return (
      <div className="space-y-1  ">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <SkeletonComponent key={i} type="card" />
          ))}
      </div>
    );
  }

  // Type definitions
  switch (type) {
    case 'box':
      return <div className={`${baseClass} ${sizeClass}`} />;

    case 'circle':
    case 'avatar':
      return (
        <div
          className={`${baseClass} ${resolveSize(width, 'w')} ${resolveSize(height, 'h')} rounded-full`}
        />
      );

    case 'text':
      return <div className={`w-full h-2 ${baseClass}`} />;

    case 'title':
      return <div className={`w-3/4 h-2 ${baseClass}`} />;

    case 'paragraph':
    case 'list':
      return (
        <>
          {Array.from({ length: lineCount }).map((_, i) => (
            <SkeletonComponent key={i} type="text" />
          ))}
        </>
      );

    case 'media':
      return (
        <div className={`${baseClass} w-full ${resolveSize(height, 'h')}`} />
      );

    case 'button':
      return <div className={`w-[26px] h-[6px] ${baseClass} rounded-md`} />;

    case 'input':
      return <div className={`w-full h-10 ${baseClass} rounded-md`} />;

    case 'card':
      return (
        <div className="p-4 border-white/10 border shadow-shadow-pop-up rounded-md space-y-2">
          {/* <SkeletonComponent type="media" height={24} /> */}
          <SkeletonComponent type="title" />
          <SkeletonComponent type="paragraph" lineCount={2} />
        </div>
      );

    default:
      return <div className={`${baseClass} ${sizeClass}`} />;
  }
};

export default SkeletonComponent;
