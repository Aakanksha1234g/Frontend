import React, { useEffect, useState, useMemo, useCallback } from 'react';
import cineScribe from '@assets/icons/CineScribe_White.svg';
import SortDropDown from './project-file-sort-drop-down';
import FilterDropDown from './project-file-filter-drop-down';
import SearchBar from '@shared/ui/searchbar';
import { useParams, useLocation, useNavigate } from 'react-router';
import Button from '@shared/ui/button';
import { PlusIcon, MagicToolIcon, DownloadIcon } from './icons';
import { useUser } from '@shared/context/user-context';
import DownloadDropdown from './download-drop-down';
import StoryDocxDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/chat/DownloadStoryDocx';
import BeatSheetDocxDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/beats/DownloadStoryBeatsDocx';
import OneLinersDocxDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/one-liners/DownalodStoryOnelinersDocs';
import ScenesDocxDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/script/DownloadStoryScriptDocx';
import StoryPdfDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/chat/DownloadStoryPdf';
import BeatSheetPdfDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/beats/DownloadStoryBeatsPdf';
import OneLinersPdfDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/one-liners/DownloadStoryOneLinerPdf';
import ScenesPdfDownloadButton from '@products/cine-scribe/pages/story-generation/pages/[id]/script/DownloadStoryScriptPdf';
import SkeletonComponent from '@shared/components/Skeleton/SkeletonComponent';
import AnalysisPdfDownloadButton from '@products/cine-scribe/pages/script-writing/pages/[id]/act-analysis/DownloadPdf';
import ScriptInfoPdfDownloadButton from '@products/cine-scribe/pages/script-writing/pages/[id]/script-details/DownloadPdf';
import BeatsPdfDownloadButton from '@products/cine-scribe/pages/script-writing/pages/[id]/beat-sheet/DownloadPdf';
import CharacterArcPdfDownloadButton from '@products/cine-scribe/pages/script-writing/pages/[id]/character-arc/DownloadPdf';
import FinalAnalysisPdfDownloadButton from '@products/cine-scribe/pages/script-writing/pages/[id]/script-report/DownloadPdf';


// --- Header Controls ---
const HeaderControls = React.memo(
  ({
    showSearch,
    showFilter,
    showSGFilter,
    showSort,
    showButton,
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    selectedSortOrder,
    onSortOrderChange,
    alphabeticalOrder,
    onAlphabeticalOrderChange,
    dateOrder,
    onDateOrderChange,
    buttonText,
    createProjectSize,
    buttonSize,
    onButtonClick,
    disableButton,
    showDownload,
    PdfButtonComponent,
    DocButtonComponent,
  }) => (
    <div className="flex items-center gap-2 z-30 relative pr-2">
      {showSearch && <SearchBar query={query} setQuery={onQueryChange} />}
      {showFilter && (
        <FilterDropDown
          buttonSize={buttonSize}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          showSGFilter={showSGFilter}
        />
      )}
      {showSort && (
        <SortDropDown
          buttonSize={buttonSize}
          selectedSortOrder={selectedSortOrder}
          onSortOrderChange={onSortOrderChange}
          alphabeticalOrder={alphabeticalOrder}
          onAlphabeticalOrderChange={onAlphabeticalOrderChange}
          dateOrder={dateOrder}
          onDateOrderChange={onDateOrderChange}
        />
      )}

      {showDownload && (
        <DownloadDropdown
          DocButton={DocButtonComponent}
          PdfButton={PdfButtonComponent}
        />
      )}

      {showButton && (
        <Button
          size={createProjectSize}
          className={`bg-[#171717] text-[#FCFCFC] border-2 border-[#3B82F6] ${
            disableButton ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={disableButton ? null : onButtonClick}
        >
          {buttonText === 'New Project' ? (
            <PlusIcon color="#FCFCFC" />
          ) : (
            <MagicToolIcon color="#FCFCFC" />
          )}
          {buttonText}
        </Button>
      )}
    </div>
  )
);

const ProductHeader = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  selectedSortOrder,
  onSortOrderChange,
  alphabeticalOrder,
  onAlphabeticalOrderChange,
  dateOrder,
  onDateOrderChange,
  storyStatusBarDetails,
  scriptStatusBarDetails,
  showSearch = false,
  showFilter = false,
  showSGFilter = false,
  showSort = false,
  showButton = false,
  showSGStatus = false,
  showSWStatus = false,
  buttonText = 'New Project',
  onButtonClick,
  disableButton,
  showDownload = false,
  pdfData, // <- pass pdfData here
}) => {
  const [buttonSize, setButtonSize] = useState('sm');
  const [statusSize, setStatusSize] = useState('sm');
  const [createProjectSize, setCreateProjectSize] = useState('md');
  const [productHeaderHeight, setProductHeaderHeight] = useState(64);
  const location = useLocation();
  const { id: projectId } = useParams();
  const { state } = useUser();
  const username = state?.username;
  const projectName = storyStatusBarDetails?.story_title?.toUpperCase() || '';
  const scriptTitle = scriptStatusBarDetails?.script_title?.toUpperCase() || '';

  // --- Handle window resize ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setButtonSize(width > 1440 ? 'md' : 'sm');
      setProductHeaderHeight(width >= 1920 ? 70 : 64);
      setStatusSize(width > 1440 ? 'md' : 'sm');

      if (width < 1440) {
        setCreateProjectSize('sm');
      } else if (width > 1920) {
        setCreateProjectSize('lg');
      } else {
        setCreateProjectSize('md');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // --- SG Status List ---
  const sgStatusList = useMemo(
    () => [
      {
        name: 'Story Details',
        statusKey: 'story_id',
        url: `/cine-scribe/story-generation/${projectId}/story-details`,
      },
      {
        name: 'Web Articles',
        statusKey: 'web_articles_status',
        url: `/cine-scribe/story-generation/${projectId}/web-articles`,
      },
      {
        name: 'Story Arena',
        statusKey: 'story_chat_status',
        url: `/cine-scribe/story-generation/${projectId}/story-arena`,
      },
      {
        name: 'Beat Sheet',
        statusKey: 'beat_sheet_status',
        url: `/cine-scribe/story-generation/${projectId}/beat-sheet`,
      },
      {
        name: 'Oneliners',
        statusKey: 'oneliners_status',
        url: `/cine-scribe/story-generation/${projectId}/one-liners`,
      },
      {
        name: 'Scenes',
        statusKey: 'scene_synopsis_status',
        url: `/cine-scribe/story-generation/${projectId}/scenes`,
      },
    ],
    [projectId]
  );

  const swStatusList = useMemo(
    () => [
      {
        name: 'Input',
        statusKey: 'script_id',
        url: `/cine-scribe/script-writing/${projectId}/input`,
      },
      {
        name: 'Details',
        statusKey: 'script_info',
        url: `/cine-scribe/script-writing/${projectId}/script-details`,
      },
      {
        name: 'Analysis',
        statusKey: 'script_analysis_data',
        url: `/cine-scribe/script-writing/${projectId}/analysis`,
      },
      {
        name: 'Beats',
        statusKey: 'script_analysis_data',
        url: `/cine-scribe/script-writing/${projectId}/beats`,
      },
      {
        name: 'Character Arc',
        statusKey: 'script_analysis_data',
        url: `/cine-scribe/script-writing/${projectId}/character-arc`,
      },
      {
        name: 'Report',
        statusKey: 'script_analysis_data',
        url: `/cine-scribe/script-writing/${projectId}/report`,
      },
      {
        name: 'Scene Analysis',
        statusKey: 'script_analysis_data',
        url: `/cine-scribe/script-writing/${projectId}/evaluation`,
      },
    ],
    [projectId]
  );

  // --- Button class ---
  const getButtonClass = useCallback(
  
    (listName, statusKey, url) => {
      if (location.pathname.includes(url.split('/').pop())) {
        // Active tab
        return 'bg-[#FFFFFF]/16 text-[#FCFCFC] rounded-full cursor-pointer';
      } else if (listName?.[statusKey]) {
        // Completed step (clickable)
        return 'text-[#FCFCFC] border-b border-b-[#FCFCFC] rounded-none cursor-pointer';
      } else {
        // Locked / not completed (disabled)
        return 'text-[#A3A3A3] rounded-none cursor-not-allowed opacity-60';
      }
    },
    [location.pathname, storyStatusBarDetails]
  );

  // --- Determine PDF Button Component ---

  let PdfButtonComponent = null;
  if (pdfData) {
    if (location.pathname.includes('story-arena')) {
      PdfButtonComponent = (
        <StoryPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('beat-sheet')) {
      PdfButtonComponent = (
        <BeatSheetPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('one-liners')) {
      PdfButtonComponent = (
        <OneLinersPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('scenes')) {
      PdfButtonComponent = (
        <ScenesPdfDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('script-details')) {
      PdfButtonComponent = (
        <ScriptInfoPdfDownloadButton
          data={pdfData}
          projectName={scriptTitle}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('analysis')) {
      PdfButtonComponent = (
        <AnalysisPdfDownloadButton
          data={pdfData}
          projectName={scriptTitle}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('beats')) {
      PdfButtonComponent = (
        <BeatsPdfDownloadButton
          data={pdfData}
          projectName={scriptTitle}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('character-arc')) {
      PdfButtonComponent = (
        <CharacterArcPdfDownloadButton
          data={pdfData}
          projectName={scriptTitle}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('report')) {


      PdfButtonComponent = (
        <FinalAnalysisPdfDownloadButton
          data={pdfData[0]}
          projectName={scriptTitle}
          createdBy={username}
          criticismLevel={'General'}
        />
      );
    }
  }

  let DocButtonComponent = null;

  // DOCX Buttons
  if (pdfData) {
    if (location.pathname.includes('story-arena')) {
      DocButtonComponent = (
        <StoryDocxDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('beat-sheet')) {
      DocButtonComponent = (
        <BeatSheetDocxDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('one-liners')) {
      DocButtonComponent = (
        <OneLinersDocxDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    } else if (location.pathname.includes('scenes')) {
      DocButtonComponent = (
        <ScenesDocxDownloadButton
          data={pdfData}
          projectName={projectName}
          createdBy={username}
        />
      );
    }
  }


  const navigate = useNavigate();

  return (
    <header
      className="rounded-b-xl z-20  mx-1 bg-[#171717] flex items-center justify-between pl-2 pr-4 border-b border-default-200 relative"
      style={{ height: `${productHeaderHeight}px` }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/cine-scribe')}
        style={{ cursor: 'pointer' }}
        className="relative z-50 inline-flex items-center justify-center p-1"
        aria-label="Go to CineScribe"
      >
        <img
          src={cineScribe}
          alt="CineScribe"
          className="h-[45px] w-[45px] object-fill block"
          style={{ pointerEvents: 'auto' }}
        />
      </div>

      {/* SG Status Buttons */}
      {showSGStatus &&
      storyStatusBarDetails &&
      Object.keys(storyStatusBarDetails).length > 0 ? (
        <div
          className=" flex items-center w-full
      sm:ml-[10px] lg:ml-0
      lg:absolute lg:left-1/2 lg:-translate-x-1/2
      justify-center
      gap-0 z-10"
        >
          {sgStatusList.map(({ name, statusKey, url }) => {
            const isDisabled = !storyStatusBarDetails?.[statusKey];
            const buttonClass = getButtonClass(
              storyStatusBarDetails,
              statusKey,
              url
            );

            return (
              <Button
                key={name}
                size={statusSize}
                className={buttonClass}
                onClick={() => {
                  if (!isDisabled) navigate(url);
                }}
                disabled={isDisabled}
              >
                {name}
              </Button>
            );
          })}
        </div>
      ) : showSGStatus ? (
        <div className="s flex items-center w-full sm:ml-[10px]  lg:absolute lg:left-1/2 lg:-translate-x-1/2 justify-start lg:justify-center gap-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="p-4 bg-[#1C1C1C] rounded-xl shadow-sm border border-[#2C2C2C]"
            >
              <SkeletonComponent type="button" height={2} />
            </div>
          ))}
        </div>
      ) : null}

      {/* SG Status Buttons */}
      {showSWStatus &&
      scriptStatusBarDetails &&
      Object.keys(scriptStatusBarDetails).length > 0 ? (
        <div
          className="
      flex items-center w-full
      sm:ml-[10px]
      lg:absolute lg:left-1/2 lg:-translate-x-1/2
      justify-center
      gap-0
    "
        >
          {swStatusList.map(({ name, statusKey, url }) => {
            const isDisabled = !scriptStatusBarDetails?.[statusKey];
            const buttonClass = getButtonClass(
              scriptStatusBarDetails,
              statusKey,
              url
            );

            return (
              <Button
                key={name}
                size={statusSize}
                className={buttonClass}
                onClick={() => {
                  if (!isDisabled) navigate(url);
                }}
                disabled={isDisabled}
              >
                {name}
              </Button>
            );
          })}
        </div>
      ) : showSWStatus ? (
        <div
          className="
      flex items-center w-full
      sm:ml-[10px]
      md:justify-start lg:justify-center
      md:absolute md:left-1/2 md:-translate-x-1/2
      text-gray-400 text-sm
      gap-0
    "
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="p-4 bg-[#1C1C1C] rounded-xl shadow-sm border border-[#2C2C2C]"
            >
              <SkeletonComponent type="button" height={2} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Right Controls */}
      <HeaderControls
        showSearch={showSearch}
        showFilter={showFilter}
        showSGFilter={showSGFilter}
        showSort={showSort}
        showButton={showButton}
        query={query}
        onQueryChange={onQueryChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        selectedSortOrder={selectedSortOrder}
        onSortOrderChange={onSortOrderChange}
        alphabeticalOrder={alphabeticalOrder}
        onAlphabeticalOrderChange={onAlphabeticalOrderChange}
        dateOrder={dateOrder}
        onDateOrderChange={onDateOrderChange}
        buttonText={buttonText}
        createProjectSize={createProjectSize}
        buttonSize={buttonSize}
        onButtonClick={onButtonClick}
        disableButton={disableButton}
        showDownload={showDownload}
        PdfButtonComponent={PdfButtonComponent} // Pass it here
        DocButtonComponent={DocButtonComponent}
      />
    </header>
  );
};

export default React.memo(ProductHeader);
