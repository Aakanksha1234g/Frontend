import React, { useEffect, useState, useRef, useMemo } from 'react';
import share from '@assets/icons/Scale.svg';
import search from '@assets/icons/SearchIcon.svg';
import StoryPdfDownloadButton from '../pages/[id]/chat/DownloadStoryPdf';
import BeatSheetPdfDownloadButton from '../pages/[id]/beats/DownloadStoryBeatsPdf';
import OneLinersPdfDownloadButton from '../pages/[id]/one-liners/DownloadStoryOneLinerPdf';
import ScenesPdfDownloadButton from '../pages/[id]/script/DownloadStoryScriptPdf';
import Input from '@shared/ui/input';
import ViewStatus from '@shared/ui/view-status';
import { useParams, useLocation } from 'react-router';
import { useUser } from '@shared/context/user-context';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@api/apiMethods';

const FeatureHeader = ({
  storyDetails,
  setStoryDetails,
  data,
  disableButton = false, // to disable generate button or any other condition then isDisabled

  handleGenerate = () => {},
  query,
  setQuery,
  placeholder = 'Search',
  filterType = [],
  setFilterType = () => {},
  filterOptions = [],
}) => {
  const { id: projectId } = useParams();
  const location = useLocation();
  const { state } = useUser();
  const isSearchEnabled =
    typeof query === 'string' && typeof setQuery === 'function';

  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    data: storyStatusBarDetails = {},
    error,
    isPending,
  } = useQuery({
    queryKey: ['storyStatusBarDetails', projectId],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_story_status?story_id=${projectId}`,
        method: 'GET',
      });
      return response.data.response; // return whole response object
    },
    enabled: !!projectId, // prevent premature call
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true, // Refetch when remounting
    refetchOnWindowFocus: false, // Optional: disable focus refetch
  });



  useEffect(() => {
    setStoryDetails(storyStatusBarDetails);
  }, [storyStatusBarDetails]);

  const searchRef = useRef(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  // Determine current step and appropriate PDF button
  const { buttonText, isDisabled, PdfButtonComponent } = useMemo(() => {
    if (!data || !storyDetails?.story_title) {
      return {
        buttonText: '',
        isDisabled: true,
        PdfButtonComponent: null,
      };
    }

    const projectName = storyDetails.story_title.toUpperCase();
    const username = state?.username;
    const pdfData = data || ' ';
    let buttonText = '';
    let isDisabled = true;
    let PdfButtonComponent = null;

    if (location.pathname.includes('chat')) {
      buttonText = 'Generate Beats';
      isDisabled = storyDetails?.beat_sheet_status;
      PdfButtonComponent = (
        <StoryPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('beat-sheet')) {
      buttonText = 'Generate Oneliners';
      isDisabled = storyDetails?.oneliners_status;
      PdfButtonComponent = (
        <BeatSheetPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('one-liners')) {
      buttonText = 'Generate Script';
      isDisabled = storyDetails?.scene_synopsis_status;
      PdfButtonComponent = (
        <OneLinersPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('script')) {

      isDisabled = false;
      PdfButtonComponent = (
        <ScenesPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('story-details')) {
      isDisabled = storyDetails?.story_chat_status;
    }

    return { buttonText, isDisabled, PdfButtonComponent };
  }, [location.pathname, storyDetails, state?.username, data]);

  return (
    <div className="w-full py-2 container mx-auto max-w-5xl flex flex-col items-center justify-center gap-2">
      <div className="w-full flex lg:flex-row flex-col items-center justify-between gap-2 px-4">
        <div className="flex items-center justify-center">
          <div className="bg-white flex items-center gap-2 font-bold px-4 py-2 shadow-chat-button shadow-shadow-chat-button rounded-2xl text-sm z-10">
            {/* <img src={star} className="w-5 h-5" alt="Star" /> */}
            {storyDetails?.story_title?.toUpperCase()}
          </div>
          <div ref={searchRef} className="relative flex items-center gap-2">
            {showFilterOptions && showSearch && (
              <div className="bg-white absolute -bottom-12 right-0 shadow-2xl p-2 rounded-md flex justify-end gap-2 z-20">
                {filterOptions.map(type => (
                  <label
                    key={type}
                    className="flex text-sm items-center gap-2 p-2 cursor-pointer"
                  >
                    <Input
                      type="checkbox"
                      checked={filterType.includes(type)}
                      onChange={() =>
                        setFilterType(prev =>
                          prev.includes(type)
                            ? prev.filter(t => t !== type)
                            : [...prev, type]
                        )
                      }
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            )}

            {isSearchEnabled && (
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  setShowFilterOptions(false);
                }}
                className="iconButton"
              >
                <img src={search} alt="search" className="w-5 h-5" />
              </button>
            )}
            {showSearch && isSearchEnabled && (
              <>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="border px-2 py-1 rounded-md w-[200px]"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                      className="absolute right-[10px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      &#10005;
                    </button>
                  )}
                </div>
                {filterOptions.length > 0 && (
                  <button
                    className="iconButton"
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                  >
                    <img src={share} alt="filter" className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {PdfButtonComponent}
          <ViewStatus
            position={'-left-16 -translate-x-1/2'}
            webArticlesStatus={storyDetails?.web_articles_status}
            beatSheetStatus={storyDetails?.beat_sheet_status}
            onelinersStatus={storyDetails?.oneliners_status}
            sceneSynopsisStatus={storyDetails?.scene_synopsis_status}
            storyChatStatus={storyDetails?.story_chat_status}
            inputStatus={true}
          />
          {/* 
          <button className="iconButton">
            <img src={share} alt="share" className="w-5 h-5" />
          </button> */}

          {buttonText && (
            <button
              className="button-primary"
              disabled={disableButton || isDisabled}
              onClick={handleGenerate}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureHeader;
