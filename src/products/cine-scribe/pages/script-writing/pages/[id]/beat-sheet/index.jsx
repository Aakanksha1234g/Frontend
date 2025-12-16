import React, { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import { useParams } from 'react-router';
import BeatChart from './Graph';
import NoDataDisplayAndGenerate from '../../../components/NoDataDisplay';
import { fetchData } from '@api/apiMethods';
import StatusList from '../../../components/StatusList';
import BeatSheetScriptGenerationLoading from './loading';
import { Tooltip } from '@heroui/react';


const TooltipText = [
  'Meet the hero, explore their world, and get a sense of what’s missing in their life.',
  'The first big shake-up that pushes the hero out of their comfort zone.',
  'The turning point where the hero commits to a new path or gets pulled into a new world.',
  'A major twist or discovery that changes everything and raises the stakes.',
  'The darkest moment where it seems all hope is lost.',
  'The emotional low point that forces deep reflection before the final stand.',
  'The ultimate showdown or emotional breakthrough that decides the outcome.',
  'The closing moment showing how the hero and their world have changed.',
];



const DisplayGraphsAnalysis = () => {
  const { id } = useParams();
  const { setHeaderProps } = useProductHeader();

  const {
    data: apiData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['beatSheetData', id],
    queryFn: () =>
      fetchData({
        endpoint: `/display_script_analysis/${id}?category=beat`,
      }),
    onSuccess: data => {
      if (!data?.response) {
        throw new Error('Invalid API response format');
      }
    },
  });
    const responseData = apiData?.data?.response;
    const fiveActData = responseData?.five_act;
    const beatData = fiveActData?.beat_data;
  const scriptTitle = fiveActData?.script_title || 'Untitled Project';
  
  const beat_data = React.useMemo(() => {
    if (!beatData) return [];
    return beatData.flatMap(beatObj =>
      Object.entries(beatObj)
        .filter(([key]) => !key.endsWith('_engagement_score'))
        .map(([key, value]) => ({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          reason: value,
        }))
    );
  }, [beatData]);

  useEffect(() => {
    setHeaderProps({
      showSWStatus: true,
      scriptStatusBarDetails: {
        script_title: scriptTitle,
        script_id: true,
        script_info: true,
        script_analysis_data: true,
      },
      showDownload: true,
      pdfData: beat_data,
    });
  }, [apiData,beat_data, scriptTitle]);

  // Destructure the response data


  const beat_graph_data = React.useMemo(() => {
    if (!beatData) return [];
    return beatData.flatMap(beatObj =>
      Object.entries(beatObj)
        .filter(([key]) => key.endsWith('_engagement_score'))
        .map(([key, value]) => ({
          label: key
            .replace('_engagement_score', '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase()),
          score: Number(value),
        }))
    );
  }, [beatData]);

  

  if (isLoading) {
    return (
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        <BeatSheetScriptGenerationLoading />
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

  if (!responseData || !beat_graph_data || beat_graph_data.length === 0) {
    return (
      <NoDataDisplayAndGenerate
        name={'Beat Sheet'}
        id={id}
        statusList={StatusList(id, true, true)}
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] overflow-y-auto scrollbar-gray">
      <div className="w-full responsive-container mx-auto  rounded-xl shadow-lg p-1 space-y-6 text-white">
        {/* Header Section */}
        <div className="rounded-[16px] w-full flex flex-col gap-1 justify-center items-center  py-3 px-6">
          <h4 className="text-[#FCFCFC] text-[16px] font-medium">
          Track Every Beat That Drives Your Story
          </h4>
          <p className="text-[#A3A3A3] text-center text-[14px]">
            Visualize each beat to see how tension rises, emotions shift, and
            momentum builds - keeping your audience hooked till the final
            fade-out.
          </p>
        </div>
      </div>
      <div className="mt-[6px] flex justify-center w-full">
        <div
          className="flex flex-col justify-center items-center w-full max-w-[1040px]"
          style={{
            aspectRatio: '1040 / 448', // keeps proportional height
            opacity: 1,
          }}
        >
          <BeatChart
            graph_data={beat_graph_data}
            beat_data={beat_data}
            scriptTitle={scriptTitle}
          />
        </div>
      </div>

      <div className="mt-[10px] flex justify-center w-full">
        <div className="mt-8mt-[10px] flex flex-col w-full responsive-container">
          <h2 className="text-[20px] font-semibold mb-4 text-[#FCFCFC]">
            Beat Explanations
          </h2>
          <div className="space-y-4 mb-8">
            {beat_data?.map((item, index) => (
              <div
                key={index}
                className="e p-4 rounded-lg shadow border"
                style={{
                  background: '#171717',
                  border: '1px solid var(--colors-base-default-100, #27272A)',
                }}
              >
                <Tooltip
                  className="max-w-[153px] text-xs"
                  content={TooltipText[index]}
                  placement="right"
                  showArrow
                >
                  <label className="text-sm font-medium flex items-center mb-1 gap-1 w-fit">
                    {item.label}
                  </label>
                </Tooltip>
                <p className="text-sm text-[#B0B0B0] whitespace-pre-line mt-1 text-justify">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayGraphsAnalysis;
