import React from 'react';
import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';

const ProjectsStoryGenerationLoading = () => {
  return (
    <div className="flex flex-col w-full h-full p-6 gap-6 bg-[#0F0F0F]">
      {/* Title Skeleton */}
      <div className="w-full">
        <SkeletonComponent type="title" />
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="p-4 bg-[#1C1C1C] rounded-xl shadow-sm border border-[#2C2C2C]"
          >
            <SkeletonComponent type="card" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsStoryGenerationLoading;
