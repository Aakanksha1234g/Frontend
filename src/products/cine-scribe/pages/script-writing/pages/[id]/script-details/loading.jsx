import React from 'react';
import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';

const DetailsScriptGenerationLoading = () => {
  return (
    <div className="flex flex-col w-full gap-6 p-4">
      {/* Title */}
      <SkeletonComponent type="title" width="50%" height={10} />
      <div className="flex gap-4 w-full">
        {Array(4)
          .fill(0)
          .map((_, idx) => (
            <SkeletonComponent key={idx} type="input" />
          ))}
      </div>

      {/* Two stacked inputs */}
      <div className="flex flex-col gap-4 w-full">
        <SkeletonComponent type="input" height={10} />
        <SkeletonComponent type="input" height={10} />
        <SkeletonComponent type="input" height={10} />
        <SkeletonComponent type="input" height={10} />
        <SkeletonComponent type="input" height={10} />
        <SkeletonComponent type="input" height={10} />
      </div>
    </div>
  );
};

export default DetailsScriptGenerationLoading;
