import React from 'react';
import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';

const ChatStoryGenerationLoading = () => {
  return (
    <div className="flex flex-col w-full h-full p-6 gap-4 bg-[#0F0F0F]">
      {/* Top Section: Typing Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-[#4b4b4b] animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-[#4b4b4b] animate-pulse delay-150"></div>
        <div className="w-3 h-3 rounded-full bg-[#4b4b4b] animate-pulse delay-300"></div>
      </div>

      {/* Chat Message Skeletons */}
      <div className="flex flex-col gap-5 overflow-y-auto">
        {/* Left (AI message) */}
        <div className="flex items-start gap-3">
          <SkeletonComponent type="avatar" width={10} height={10} />
          <div className="flex flex-col gap-2 w-3/4">
            <SkeletonComponent type="text" />
            <SkeletonComponent type="paragraph" lineCount={3} />
          </div>
        </div>

        {/* Right (User message) */}
        <div className="flex items-start justify-end gap-3">
          <div className="flex flex-col gap-2 w-2/3 items-end">
            <SkeletonComponent type="text" />
            <SkeletonComponent type="paragraph" lineCount={2} />
          </div>
          <SkeletonComponent type="avatar" width={10} height={10} />
        </div>

        {/* Left (AI message continuing) */}
        <div className="flex items-start gap-3">
          <SkeletonComponent type="avatar" width={10} height={10} />
          <div className="flex flex-col gap-2 w-3/4">
            <SkeletonComponent type="title" />
            <SkeletonComponent type="paragraph" lineCount={4} />
            <SkeletonComponent type="paragraph" lineCount={2} />
          </div>
        </div>
      </div>

      {/* Bottom Typing Bar */}
      <div className="mt-auto flex items-center gap-2 pt-4 border-t border-[#262626]">
        <SkeletonComponent type="input" />
        <SkeletonComponent type="button" />
      </div>
    </div>
  );
};

export default ChatStoryGenerationLoading;
