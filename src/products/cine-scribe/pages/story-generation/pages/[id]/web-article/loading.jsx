import React from 'react';
import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';

const WebarticleStoryGenerationLoading = () => {
  return (
    <div className="flex flex-col w-full h-full p-6 gap-6 bg-[#0F0F0F]">
      {/* Title Skeleton */}
      <div className="w-full">
        <SkeletonComponent type="title" />
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="p-4 bg-[#1C1C1C] rounded-xl shadow-sm border border-[#2C2C2C]"
          >
            <SkeletonComponent type="title" />
            <div className="mt-2">
              <SkeletonComponent type="paragraph" lineCount={3} />
            </div>
          </div>
        ))}
      </div>

      {/* Input Box Section */}
      <div className="mt-auto pt-6 border-t border-[#2C2C2C] flex items-center gap-3">
        <SkeletonComponent type="input" />
        <SkeletonComponent type="button" />
      </div>
    </div>
  );
};

export default WebarticleStoryGenerationLoading;
