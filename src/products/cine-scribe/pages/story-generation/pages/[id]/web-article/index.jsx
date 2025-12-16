import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import { useParams, useNavigate, useBlocker } from 'react-router';
import Spinner from '@shared/ui/spinner';
import UnsavedChangesModal from '@shared/unSavedChangesModal';
import WebArticle from '/Web_Article.png';
import WebNovel from '/Web_Novel.png';
import WebMovie from '/Web_Movie.png';
import Button from '@shared/ui/button';
import WebarticleStoryGenerationLoading from './loading';
import { FreezeIcon } from '@shared/layout/icons';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';

// --- Helper Components ---
const ArticleCard = React.memo(
  ({ item, index, isDisabled, chatLocked, onSelect }) => {
    let type = '';
    let displayType = '';
    let imageSrc = '';

    if (index < 2) {
      type = 'Article';
      displayType = `Article ${index + 1}`;
      imageSrc = WebArticle;
    } else if (index < 4) {
      type = 'Literature';
      displayType = `Literature ${index - 1}`; // (index 2 → Novel 1, index 3 → Novel 2)
      imageSrc = WebNovel;
    } else {
      type = 'Movie';
      displayType = `Movie ${index - 3}`; // (index 4 → Movie 1, index 5 → Movie 2)
      imageSrc = WebMovie;
    }

    return (
      <div
        key={index}
        className={`grid place-items-center p-4 transition-colors ${
          isDisabled ? 'opacity-50' : ''
        }`}
        aria-disabled={isDisabled}
      >
        <div className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={item.is_selected}
            disabled={chatLocked || isDisabled}
            onChange={() => onSelect(index)}
            className={`h-4 w-4 rounded-full cursor-pointer ${
              item.is_selected
                ? 'bg-black accent-[#E5E5E5] border-none'
                : 'bg-[#171717] border-2 border-[#E5E5E5] accent-[#171717]'
            }`}
            aria-label={`Select ${displayType}: ${item.title}`}
          />

          <div className="flex items-center border-2 border-white/10 rounded-[16px] space-x-3 p-2">
            <img
              src={imageSrc}
              alt={`${displayType} thumbnail`}
              className="w-[100px] h-[100px] object-cover rounded-md flex-shrink-0"
            />
            <div className="flex flex-col">
              <p className="text-[12px] text-[#FCFCFC] font-medium">
                {displayType}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FCFCFC] text-[16px] hover:underline font-medium"
              >
                <div className="title">
                  {item.title.length > 25
                    ? item.title.slice(0, 25) + '...'
                    : item.title}
                </div>
              </a>
              <p className="text-[#A3A3A3] text-sm mt-1 line-clamp-2">
                {item.short_summary.length > 25
                  ? item.short_summary.slice(0, 25) + '...'
                  : item.short_summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const SelectedTabContent = React.memo(({ item }) => {
  const type = item.id < 2 ? 'Article' : item.id < 4 ? 'Literature' : 'Movie';

  const renderWhyChosen = useCallback(text => {
    if (!text) return null;

    const points = text.split(/\d+\.\s+/).filter(Boolean);

    return (
      <ul className="list-decimal list-inside space-y-2">
        {points.map((point, index) => {
          const html = point
            .trim()
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // convert markdown bold
            .replace(/\n/g, '<br/>'); // preserve line breaks
          return (
            <li
              key={index}
              className="text-[#B0B0B0] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </ul>
    );
  }, []);

  return (
    <div className="space-y-3 rounded-xl bg-[#1A1A1A] p-4 shadow-md border border-[#2A2A2A]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-[#F5F5F5] leading-snug">
          {type}: {item.title}
        </h3>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium whitespace-nowrap"
        >
          View Source →
        </a>
      </div>
      <div className="space-y-2">
        <p className="text-[#B0B0B0] text-justify leading-relaxed">
          <span className="font-semibold text-[#FCFCFC]">
            Detailed Summary:{' '}
          </span>
          {item.detailed_summary}
        </p>
        <div className="text-[#B0B0B0] leading-relaxed text-justify space-y-2">
          <span className="font-semibold text-[#FCFCFC]">Why Chosen: </span>
          {renderWhyChosen(item.why_chosen)}
        </div>
      </div>
    </div>
  );
});

// --- Main Page ---
const WebArticlePage = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [initialState, setInitialState] = useState(false);
  const [initialSelections, setInitialSelections] = useState([]);
  const { setHeaderProps } = useProductHeader();

  const { id } = useParams();
  const navigate = useNavigate();
  const blocker = useBlocker(initialState);

  const {
    data: webArticlesData = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ['webArticles', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_web_articles?story_id=${id}`,
        method: 'GET',
        responseMessage: 'Story Details Fetched Successfully',
      });
      return response.data.response;
    },
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setInitialSelections(
      webArticlesData.filter(a => a.is_selected).map(a => a.id)
    );
  }, [webArticlesData]);

  const { data: storyStatusBarDetails = {} } = useQuery({
    queryKey: ['storyStatusBarDetails', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_story_status?story_id=${id}`,
        method: 'GET',
      });
      return response.data.response;
    },
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const [selectedArticles, setSelectedArticles] = useState([]);

  useEffect(() => {
    const initial = webArticlesData.filter(a => a.is_selected);
    setSelectedArticles(initial); // << controlled state
    setInitialSelections(initial.map(a => a.id));
  }, [webArticlesData]);

  const selectedCount = useMemo(
    () => selectedArticles.length,
    [selectedArticles]
  );

  const handleCheckboxChange = useCallback(
    index => {
      queryClient.setQueryData(['webArticles', id], oldData => {
        if (!oldData) return oldData;

        const alreadySelected = oldData[index].is_selected;
        if (!alreadySelected && selectedArticles.length >= 3) return oldData;

        const newData = oldData.map((a, i) =>
          i === index ? { ...a, is_selected: !a.is_selected } : a
        );
        setTabIndex(
          newData.length < selectedArticles.length ? tabIndex - 1 : tabIndex
        );
        // Update controlled selectedArticles immediately
        const updatedSelected = newData.filter(a => a.is_selected);
        setSelectedArticles(updatedSelected);

        // Compare selection sets
        const currentIds = updatedSelected.map(a => a.id).sort();
        const initialIds = initialSelections.slice().sort();

        const areSame =
          currentIds.length === initialIds.length &&
          currentIds.every((id, i) => id === initialIds[i]);

        setInitialState(!areSame);

        return newData;
      });
    },
    [queryClient, id, selectedArticles.length, initialSelections]
  );

  const getCurrentSelections = useCallback(
    () => selectedArticles.map(a => a.id),
    [selectedArticles]
  );

  // --- Save Selection ---
  const { mutateAsync: saveSelectionMutation, isPending: isSaving } =
    useMutation({
      mutationKey: ['saveSelection'],
      mutationFn: async () => {
        const selectedIds = getCurrentSelections();
        return await sendData({
          endpoint: `/story_idea_generation/save_selected_web_articles`,
          method: 'POST',
          body: { story_id: id, selected_ids: selectedIds },
          responseMessage: 'Selected web articles saved successfully',
        });
      },
      onSuccess: () => {
        setInitialState(false);
        setInitialSelections(getCurrentSelections());
      },
      onSettled: () => setLoading(false),
    });

  const handleSaveSelection = useCallback(async () => {
    setLoading(true);
    setLoadingText('Saving web articles');
    await saveSelectionMutation();
  }, [saveSelectionMutation]);

  // --- Generate Story ---
  const { mutateAsync: generateStoryMutation, isPending: isGenerating } =
    useMutation({
      mutationKey: ['generateStory'],
      mutationFn: async () => {
        return await sendData({
          endpoint: '/story_idea_generation/create_chat',
          method: 'POST',
          body: JSON.stringify({
            story_id: id,
            selected_ids: getCurrentSelections(),
          }),
          responseMessage: 'Story Project created',
        });
      },
      onSuccess: response =>
        navigate(
          `/cine-scribe/story-generation/${response?.data?.response?.story_id}/story-arena/`
        ),
      onSettled: () => setLoading(false),
    });

  const handleGenerateStory = useCallback(async () => {
    setLoading(true);
    setInitialState(false);
    setLoadingText(
      'Generating your story - your story is coming to life within 30-45 seconds'
    );
    await generateStoryMutation();
  }, [generateStoryMutation]);

  useEffect(() => {
    setHeaderProps({
      showButton: storyStatusBarDetails?.story_chat_status === false,
      buttonText: 'Generate Story',
      onButtonClick: handleGenerateStory,
      showSGStatus: true,
      storyStatusBarDetails,
      disableButton: initialState,
    });
  }, [
    storyStatusBarDetails?.story_chat_status,
    handleGenerateStory,
    initialState,
  ]);

  return (
    <div className="flex flex-col  w-full h-full bg-primary-gray-50 scrollbar-gray">
      {loading && <Spinner text={loadingText} />}

      {isPending ? (
        <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto py-4">
          <WebarticleStoryGenerationLoading />
        </div>
      ) : error ? (
        <div className="w-full flex-1 mx-auto flex flex-col gap-10 items-center justify-center bg-primary-gray-100">
          <p className="text-red-500">Failed to load story details.</p>
        </div>
      ) : (
        <div className="mt-[10px]  h-full flex flex-1 flex-col w-full responsive-container mx-auto py-4">
          {/* Selection Cards */}
          <section className="w-full h-full  flex flex-col gap-4">
            <div className="rounded-[16px] w-full flex flex-col gap-1 justify-center items-center bg-[#171717] py-3 px-6">
              <h4 className="text-[#FCFCFC] text-[16px] font-medium">
                Select any three options for your project
              </h4>
              <p className="text-[#A3A3A3] text-center text-[14px]">
                Transform your story concept to real-world events, literature,
                and cinema giving you a richer foundation for crafting a
                compelling and realistic story.
              </p>
            </div>
            <div className="h-full">
              <div className="w-full hidden xl:block">
                <div className=" grid xl:grid-cols-3 grid-cols-2 place-items-center gap-3 p-3 ">
                  <p> Article</p>
                  <p> Literature</p>
                  <p> Movie</p>
                </div>
              </div>

              <div className="grid xl:grid-cols-3 grid-cols-2 gap-3 py-3 border-y border-y-[#262626]">
                {webArticlesData.slice(0, 6).map((item, index) => (
                  <div
                    key={index}
                    className={`w-full relative 
                      ${index === 0 ? 'xl:order-1' : ''}
                      ${index === 2 ? 'xl:order-2' : ''}
                      ${index === 4 ? 'xl:order-3' : ''}
                      ${index === 1 ? 'xl:order-4' : ''}
                      ${index === 3 ? 'xl:order-5' : ''}
                      ${index === 5 ? 'xl:order-6' : ''}
                    `}
                  >
                    <ArticleCard
                      item={item}
                      index={index}
                      isDisabled={selectedCount >= 3 && !item.is_selected}
                      chatLocked={storyStatusBarDetails?.story_chat_status}
                      onSelect={handleCheckboxChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tabs for Selected Items */}
          {selectedArticles.length > 0 && (
            <>
              <div className="w-full flex items-cenetr justify-evenly">
                {selectedArticles.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-[#171717] w-full flex rounded-md mt-4"
                  >
                    <button
                      onClick={() => setTabIndex(index)}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md text-[#FCFCFC] whitespace-nowrap text-center
        ${tabIndex === index ? 'bg-default-400' : 'hover:bg-[#3f3f46]/40'}
      `}
                    >
                      {item.id <= 2
                        ? `Article ${item.id}`
                        : item.id <= 4
                          ? `Literature ${item.id - 2}`
                          : `Movie ${item.id - 4}`}
                    </button>
                  </div>
                ))}
              </div>

              <div className="py-4  text-sm text-[#FCFCFC] space-y-1">
                <SelectedTabContent item={selectedArticles[tabIndex]} />
              </div>
            </>
          )}

          {/* Save & Generate */}
          {storyStatusBarDetails?.story_chat_status === false && (
            <div className="w-full flex items-center justify-center py-2 bg-[#0A0A0A] border-t border-white/10 sticky bottom-0">
              <div className="flex gap-2  w-full items-center justify-center">
                <Button
                  size="md"
                  onClick={handleSaveSelection}
                  disabled={isSaving || !initialState}
                  className={`px-4 py-2  font-medium transition-colors bg-default-400 hover:bg-[#52525b] text-[#FCFCFC] rounded-[12px] ${
                    isSaving || !initialState
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <FreezeIcon color="white" />
                  {isSaving ? 'Freezing...' : 'Freeze'}
                </Button>
              </div>
            </div>
          )}

          <UnsavedChangesModal
            isOpen={blocker.state === 'blocked'}
            blocker={blocker}
            onSave={handleSaveSelection}
          />
        </div>
      )}
    </div>
  );
};

export default WebArticlePage;
