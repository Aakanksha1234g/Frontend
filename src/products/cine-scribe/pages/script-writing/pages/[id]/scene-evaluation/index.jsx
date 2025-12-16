import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import SceneEvaluationLoading from './loading';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import {
  sceneShotTimeOptionList,
  sceneIntExtOptionList,
} from '../../../../../constants/ScriptConstant';
import HistoryModal from '@shared/History/historyView';
import { useUser } from '@shared/context/user-context';

import { Card, Divider } from '@heroui/react';
import { SceneTitleIcon, SceneTypeIcon, SceneRelevancyIcon, GenerateSuggestionIcon } from '@shared/layout/icons';
import DurationEditComponent from './DurationEditComponent';
import SceneDisplayCollapse from './colapsedSceneSelection';
const DisplaySceneEvaluation = () => {
  const { setHeaderProps } = useProductHeader();
  const [historyModalState, setHistoryModalState] = useState({
    isOpen: false,
    sceneId: null,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { id } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const selectedSceneId = searchParams.get('scene');
  const searchQuery = searchParams.toString();
  const { state: profileState } = useUser();
  const queryClient = useQueryClient();

  // Use TanStack Query to fetch data
  const {
    data: sceneEvaluations,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sceneEvaluations', id],
    queryFn: () =>
      fetchData({
        endpoint: `/scene_data/display_scene_evaluation/${id}`,
      }).then(response => {

        if (!response.data.response.scene_evaluations) {
          throw new Error('No Scene Analysis found');
        }
        return response.data.response.scene_evaluations;
      }),
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });


  useEffect(() => {
    setHeaderProps({
      showSWStatus: true,
      scriptStatusBarDetails: {
        script_id: true,
        script_info: true,
        script_analysis_data: true,
      },
    });
  }, [sceneEvaluations]);

  if (isLoading) {
    return (
      <div className=" mt-[10px] flex flex-1 flex-col w-full h-full responsive-container mx-auto pt-4 ">

        <SceneEvaluationLoading />
      </div>
    );
  }

  if (isError) {
    return (

      <div className="p-4 text-center text-red-600">
        Error: {error.message}
      </div>

    );
  }

  const getSceneType = interiorExteriorId => {
    return (
      sceneIntExtOptionList.find(opt => opt.id === interiorExteriorId)?.value ||
      'Unknown'
    );
  };

  const getSceneTime = shotTimeId => {
    return (
      sceneShotTimeOptionList.find(opt => opt.id === shotTimeId)?.value ||
      'Unknown'
    );
  };

  const selectedScene =
    sceneEvaluations?.find(
      scene => scene?.scene_data_id === Number(selectedSceneId)
    ) || sceneEvaluations?.[0];

  console.log("sceneevalutions", sceneEvaluations)


  const filteredScenes = sceneEvaluations
  ?.filter(scene => {
    const searchTerm = (searchParams.get('search') || '').toLowerCase();
    const selectedRelevances = searchParams.getAll('relevance_to_story_synopsis');

const sceneRelevanceText = scene?.scene_generated_data?.relevance_to_story_synopsis?.toLowerCase() || '';

const matchesRelevance = selectedRelevances.length === 0
  ? true
  : selectedRelevances.some(selected => {
      if (selected === 'strong') return sceneRelevanceText.includes('strong');
      if (selected === 'moderate') return sceneRelevanceText.includes('moderate');
      if (selected === 'low') return sceneRelevanceText.includes('irrelevant'); // ← now catches "Low relevance", "low relevance", etc.
      return false;
    });
    const matchesSearch = !searchTerm || 
      scene?.scene_title?.toLowerCase().includes(searchTerm) ||
      scene?.scene_summary?.toLowerCase().includes(searchTerm);
    const matchesShotTime = searchParams.get('shot_time')
      ? scene?.scene_shot_time === Number(searchParams.get('shot_time'))
      : true;

    const matchesInteriorExterior = searchParams.get('interior_exterior')
      ? scene?.scene_interior_exterior === Number(searchParams.get('interior_exterior'))
      : true;

    const matchesDuration = searchParams.get('duration')
      ? Math.abs(
          convertTimeToSeconds(scene?.scene_duration) -
          convertTimeToSeconds(searchParams.get('duration'))
        ) <= 10
      : true;

    return (
      matchesSearch &&
      matchesRelevance &&
      matchesShotTime &&
      matchesInteriorExterior &&
      matchesDuration
    );
  })
  .sort((a, b) => {
    if (searchParams.get('duration')) {
      const filterDuration = convertTimeToSeconds(searchParams.get('duration'));
      const aDiff = Math.abs(convertTimeToSeconds(a.scene_duration) - filterDuration);
      const bDiff = Math.abs(convertTimeToSeconds(b.scene_duration) - filterDuration);
      return aDiff - bDiff;
    } else if (searchParams.get('sort') === 'sequence_desc') {
      return b.scene_sequence_no - a.scene_sequence_no;
    }
    return a.scene_sequence_no - b.scene_sequence_no;
  });

  function getTotalSceneDuration() {
    if (!sceneEvaluations || sceneEvaluations.length === 0) return '0 sec';

    let totalSeconds = sceneEvaluations.reduce((sum, scene) => {
      if (!scene?.scene_duration) return sum;

      const timeParts = scene.scene_duration.split(':').map(Number);
      let hours = 0,
        minutes = 0,
        seconds = 0;

      if (timeParts.length === 3) {
        [hours, minutes, seconds] = timeParts;
      } else if (timeParts.length === 2) {
        [minutes, seconds] = timeParts;
      }

      return sum + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0)
      parts.push(`${seconds} sec${seconds > 1 ? 's' : ''}`);

    return parts.join(' ');
  }




  const generateSuggestion = async () => {
    try {
      setIsGenerating(true); // disable button and show "Generating..."
      const response = await sendData({
        endpoint: `scene_evaluation_processing/generate_scene_suggestion/${selectedScene.scene_data_id}`,
        method: 'PUT',
        body: {
          script_id: id,
          scene_generated_data: {
            oneliner: selectedScene.scene_generated_data?.oneliner,
            relevance_to_story_synopsis:
              selectedScene.scene_generated_data.relevance_to_story_synopsis,
            scene_type: selectedScene.scene_generated_data?.scene_type,
          },
          scene_sequence_no: selectedScene.scene_sequence_no,
          scene_summary: selectedScene.scene_summary,
          scene_title: selectedScene.scene_title,
        },
      });

      if (response.status === 200) {
        queryClient.invalidateQueries(['sceneEvaluations', id]);
      } else {
        console.error(
          'Failed to generate suggestion:',
          response.data.response.message
        );
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setIsGenerating(false); // re-enable button
    }
  };


  return (
    <div className="w-full flex justify-end  h-full p-4 scrollbar-gray overflow-y-auto">
      <HistoryModal
        isOpen={historyModalState.isOpen}
        onClose={() => setHistoryModalState({ isOpen: false, sceneId: null })}
        target_row_id={selectedScene?.scene_data_id}
        table_name="scene_data_hist"
        currentData={selectedScene}
        keysToCompare={[]}
        title="History Comparison"
      />
      {/* <DisplayScriptLayout statusList={StatusList(id, true, true)}> */}
      <div className="flex-grow w-full flex overflow-hidden">
        <SceneDisplayCollapse
          filteredScenes={filteredScenes}
          selectedSceneId={selectedSceneId}
          searchQuery={searchQuery}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          sceneEvaluations
        />
        <div
          className="flex-grow transition-[width] duration-300 ease-in-out relative justify-center flex overflow-y-auto h-full  "
          style={{
            width: isCollapsed ? 'calc(100% - 15px)' : 'calc(100% - 312px)',
          }}
        >
          <div className=" flex flex-col items-center gap-2 w-4/5 ">
            <div className="text-center">
              <h4 className="font-bold mb-2 text-medium">
                Every Scene, Every Insight
              </h4>
              <p className="text-[#A3A3A3] text-center text-[14px]">
                Step into each scene to see how it holds up. Explore its
                purpose, tone, duration, and relevance — so your rewrites focus
                on what really elevates the story.
              </p>

            </div>
            <Divider className="mt-2" />
            <div className="flex items-center bg-[#171717] rounded-[13px] p-0.5 w-fit">
              <div className="rounded-xl bg-[#3c3c3c] py-1.5 px-3  text-center">
                Total Duration: {getTotalSceneDuration()}
              </div>
              {/* <div className="rounded-xl bg-transparent py-1.5 px-3 w-42 text-center">
                {getTotalSceneDuration()}
              </div> */}
            </div>
            <div className="self-start text-[16px] font-bold">
              Scene Meta Data
            </div>
            <Divider />

            <div
              className="
    flex flex-col xl:flex-row
    items-stretch
    bg-[#171717]
    rounded-[13px]
    p-2.5
    text-center
    w-full
    gap-4 xl:gap-0
  "
            >
              {/* Scene Title */}
              <div className="flex-1 px-3.5 py-2 space-y-3 flex flex-col items-center justify-center border border-white/10">
                <div className="flex items-center gap-2 font-semibold text-[16px]">
                  <SceneTitleIcon size={24} />
                  {/* <img
                    src={SceneTitleIcon}
                    alt="Scene Title"
                    className="w-6 h-6"
                  /> */}
                  <span>Scene Title</span>
                </div>
                <div className="uppercase font-bold text-sm">
                  {!selectedScene?.scene_title
                    ? 'Untitled Scene'
                    : selectedScene?.scene_title}
                </div>
              </div>

              {/* Scene Type */}
              <div className="flex-1 px-3.5 py-2 space-y-3 flex flex-col items-center justify-center border border-white/10">
                <div className="flex items-center gap-2 font-semibold text-[16px] text-[#FCFCFC]">
                  <SceneTypeIcon size={24} />
                  {/* <img
                    src={SceneTypeIcon}
                    alt="Scene Type"
                    className="w-6 h-6"
                  /> */}
                  <span>Scene Type</span>
                </div>
                <div className="text-sm text-[#E5E5E5]">
                  {selectedScene?.scene_generated_data?.scene_type}
                </div>
              </div>

              {/* Scene Relevancy */}
              <div
                className={`flex-1 border-3 px-3.5 py-2 space-y-3 flex flex-col items-center justify-center rounded-xl capitalize ${selectedScene?.scene_generated_data?.relevance_to_story_synopsis
                  ?.toLowerCase()
                  .includes('high') || selectedScene?.scene_generated_data?.relevance_to_story_synopsis
                  ?.toLowerCase()
                  .includes('strong')
                  ? 'text-[#067647] border-[#067647]'
                  : selectedScene?.scene_generated_data?.relevance_to_story_synopsis
                    ?.toLowerCase()
                    .includes('moderate') ||
                    selectedScene?.scene_generated_data?.relevance_to_story_synopsis
                      ?.toLowerCase()
                      .includes('mid')
                    ? 'text-[#E48D21] border-[#E48D21]'
                    : 'text-[#E44C3D] border-[#E44C3D]'
                  }`}
              >
                <div className="flex items-center gap-2 font-semibold text-[16px]">
                  <SceneRelevancyIcon size={24} />
                  {/* <img
                    src={SceneRelevancyIcon}
                    alt="Scene Relevancy"
                    className="w-6 h-6"
                  /> */}
                  <span className="text-[#fcfcfc] text-[16px]">
                    Scene Relevancy
                  </span>
                </div>
                <div className="text-sm text-[#E5E5E5]">
                

{(() => {
  const relevance =
    selectedScene?.scene_generated_data?.relevance_to_story_synopsis
      ?.toLowerCase() || "";

  if (relevance.includes("high") || relevance.includes("strong")) {
    return <p className="text-sm text-[#E5E5E5] uppercase font-bold">High</p>;
  } else if (relevance.includes("moderate") || relevance.includes("mid")) {
    return <p className="text-sm text-[#E5E5E5] uppercase font-bold">Moderate</p>;
  } else {
    return <p className="text-sm text-[#E5E5E5] uppercase font-bold">Low</p>;
  }
})()}

                </div>
              </div>

              {/* Duration — Wider */}
              <div className="lg:flex-[1.5] flex flex-col items-center justify-center px-3.5 py-2 border border-white/10">
                {/* <div className="flex items-center gap-2 font-semibold text-[16px] text-[#FCFCFC] mb-2">
                  <span>Duration</span>
                </div> */}
                <div className="text-sm w-full flex items-center">
                  <DurationEditComponent
                    duration={selectedScene?.scene_duration}
                    sceneId={selectedScene.scene_data_id}
                    scriptId={id}
                    queryClient={queryClient}
                  />
                </div>
              </div>
            </div>

            {/* Scene Oneliner Section */}
            <div className="w-full">
              <div className="self-start text-lg font-bold text-[#FCFCFC]">
                Scene Oneliner
              </div>

              <Card className="w-full text-justify p-4 mb-4 text-[#B0B0B0]">
                {selectedScene?.scene_generated_data?.oneliner ||
                  'No oneliner available'}
              </Card>

              {/* Suggestions Section (comes right below Oneliner) */}
              <div className="w-full flex flex-col gap-2">
                {!selectedScene?.scene_generated_data?.suggestion ? (
                  <button
                    className={`button-primary flex items-center gap-2 self-start ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    onClick={!isGenerating ? generateSuggestion : undefined}
                    disabled={isGenerating}
                  >
                    <GenerateSuggestionIcon size={24} />
                    <span>
                      {isGenerating ? 'Generating...' : 'Generate Suggestion'}
                    </span>
                  </button>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <GenerateSuggestionIcon size={24} />
                      <span className="font-semibold text-base">
                        Suggestions
                      </span>
                    </div>
                    <Card className="w-full text-justify p-4 text-[#B0B0B0]">
                      {selectedScene?.scene_generated_data?.suggestion ||
                        'No suggestions available'}
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </DisplayScriptLayout> */}
    </div>
  );
};

export default DisplaySceneEvaluation;
