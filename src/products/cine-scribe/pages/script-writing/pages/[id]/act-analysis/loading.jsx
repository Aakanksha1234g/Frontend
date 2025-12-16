import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';
import React from 'react';

const ActAnalysisScriptGenerationLoading = () => {
  return (
    <div className="flex flex-col w-full  h-full p-4 gap-4">
      {/* <SkeletonComponent type="text" /> */}
      {/* <hr className="border-gray-400 " /> */}
      <div className="flex gap-4 w-full">
        {Array(4)
          .fill(0)
          .map((_, idx) => (
            <SkeletonComponent key={idx} type="input" />
          ))}
      </div>
      <SkeletonComponent preset="cardList" />
    </div>
  );
};

export default ActAnalysisScriptGenerationLoading;
