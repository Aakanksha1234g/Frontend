import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';
import React from 'react';

const OnelinerStoryGenerationLoading = () => {
  return (
    <div className="flex flex-col w-full  h-full p-4 gap-4">
      {/* <SkeletonComponent type="text" /> */}
      {/* <hr className="border-gray-400 " /> */}
      <SkeletonComponent preset="cardList" />
    </div>
  );
};

export default OnelinerStoryGenerationLoading;