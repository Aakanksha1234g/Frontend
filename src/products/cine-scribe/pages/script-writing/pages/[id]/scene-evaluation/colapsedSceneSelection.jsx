import React from 'react';
import LeftIcon from '@assets/icons/Alt Arrow Left.svg';
import ClipBoardWhiteIcon from '@assets/icons/ClipBoardWhite.svg';
import SceneFilters from './SceneFilter';
import { Link } from 'react-router';
import { formatDuration } from './timeFormatFunctions';
import { StatusCircle, SortIcon } from '@shared/layout/icons';
export default function SceneDisplayCollapse({
  filteredScenes,
  selectedSceneId,
    searchQuery,
    isCollapsed,
    setIsCollapsed,
}) {
 
  return (
    <div
      className={`relative transition-[width] duration-300 ease-in-out responsive-feature-side shadow-md ${
        isCollapsed ? 'w-[15px]' : 'w-[312px]  '
      }`}
    >
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        className={`  absolute    gap-0.5 flex items-center justify-center top-[5px] ${isCollapsed ? 'left-0 w-[25px]' : 'w-[24px] -right-6'}  cursor-pointer z-30`}
      >
        <div className="h-6 w-6 bg-white/10 rounded-r-2xl flex items-center justify-center ">
          <img
            src={LeftIcon}
            alt="Toggle Panel"
            className={`w-3 h-3  ${
              isCollapsed ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out transform
          ${isCollapsed ? 'opacity-0 translate-x-[-10px]' : 'opacity-100 translate-x-0'}
          flex flex-col h-full border-r border-[#222222]`}
      >
        {!isCollapsed && (
          <div
            className="flex flex-col  h-full border-r-1 border-[#222222]"
          >
            <div className='pr-3'><SceneFilters searchParams={searchQuery} /></div>
            
            <div className="space-y-2 overflow-y-auto scrollbar-gray  mt-2 text-pretty">
              {filteredScenes?.map((data, dIndex) => {
                const queryParams = new URLSearchParams(searchQuery);
                queryParams.set('scene', data.scene_data_id);

                return (
                  <Link
                    key={data.scene_data_id}
                    to={{
                      pathname: window.location.pathname,
                      search: queryParams.toString(),
                    }}
                  >
                    <b>
                      Scene{' '}
                      {data?.scene_sequence_no < 10
                        ? `0${data?.scene_sequence_no}`
                        : data.scene_sequence_no}
                    </b>
                    <div
                      className={`${selectedSceneId == data.scene_data_id && 'bg-[#3c3c3c]'} border border-[#222222] text-[#A3A3A3] rounded-2xl py-2 px-3 mt-1`}
                    >
                      <span
                        className={`${selectedSceneId == data.scene_data_id ? ' font-semibold' : 'font-medium'}`}
                      >
                        {!data?.scene_title
                          ? 'Untitled Scene'
                          : data?.scene_title}
                      </span>
                      <br />
                      <span className=" line-clamp-2 text-ellipsis  ">
                        {data?.scene_summary}
                      </span>
                      <span className="font-medium  block text-right">
                        {formatDuration(data?.scene_duration)}
                      </span>
                    </div>
                    <h3 className="text-pretty"></h3>
                    <div className="w-full mt-1 flex items-center justify-end"></div>
                    <p className="mt-1.5 text-justify capitalize">
                      {data?.scene_location}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
