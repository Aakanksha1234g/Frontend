import React from 'react';
import { LeftArrow, RightArrow, PlayArrowIcon } from '@shared/layout/icons';

const CustomPagination = ({ pagination, onPageChange, text="Total Projects:" }) => {
  const { currentPage, totalPages, totalCount } = pagination;


  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  // Show up to 5 pages in the middle
  const getVisiblePages = () => {
    const delta = 2;
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="w-full flex items-center justify-between pb-4 bg-transparent pt-4 ">
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`lg:w-[32px] lg:h-[32px] w-[24px] h-[24px] flex items-center justify-center lg:rounded-xl md:rounded-md transition-all duration-200 border-2 border-white/10 ${
              currentPage === 1
                ? 'bg-[#2B2B2B] opacity-40 cursor-not-allowed'
                : 'bg-[#1E1E1E] hover:bg-[#2B2B2B]'
            }`}
          >
            <PlayArrowIcon direction="right" />
          </button>

          {/* Pages */}
          <div className="flex gap-2">
            {getVisiblePages().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`lg:w-10 lg:h-10 w-[25px] h-[28px] flex items-center justify-center lg:rounded-xl sm:rounded-md font-medium text-sm transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-[#FAFAFA] text-[#1B1B1B]'
                    : 'bg-[#262626] text-[#FAFAFA] hover:bg-[#2B2B2B]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`lg:w-[30px] lg:h-[30px] w-[24px] h-[24px] flex items-center justify-center lg:rounded-xl sm:rounded-md transition-all duration-200 border-2 border-white/10 ${
              currentPage === totalPages
                ? 'bg-[#2B2B2B] opacity-40 cursor-not-allowed'
                : 'bg-[#1E1E1E] hover:bg-[#2B2B2B]'
            }`}
          >
            <PlayArrowIcon direction="left" />
          </button>
        </div>
      ) : (
        // if totalPages = 1, render an empty placeholder to keep layout aligned
        <div></div>
      )}

      {/* Always show total project count */}
      <span className="text-sm text-[#FCFCFC]">
       {text} {totalCount}
      </span>
    </div>
  );
};

export default CustomPagination;
