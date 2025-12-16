import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@api/apiMethods';
import CharacterArcScriptGenerationLoading from './loading';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import CharacterArcChart from './Graph';
import NoDataDisplayAndGenerate from '../../../components/NoDataDisplay';
import StatusList from '../../../components/StatusList';
import { Tooltip } from '@heroui/react';


const TooltipText = [
  'Where the character’s life, goals, and flaws begin.',
  'First challenges that shake the character’s beliefs or comfort.',
  'The character’s moment of truth or self-realization.',
  'A major turning point caused by the character’s own actions.',
  'The peak of the character’s conflict and toughest choices.',
  'Aftermath showing what the character has lost or learned.',
];

const DisplayCharacterArc = () => {
  const { id } = useParams();
  const { setHeaderProps } = useProductHeader();

  const { data, isLoading, error } = useQuery({
    queryKey: ['characterArc', id],
    queryFn: () =>
      fetchData({
        endpoint: `/display_script_analysis/${id}?category=character`,
      }),
    onSuccess: response => {
      const fiveActData = response?.response?.five_act;
      if (!fiveActData || !fiveActData.character_arc_analysis_data) {
        throw new Error('No character arc data found');
      }
      return fiveActData;
    },
    onError: error => {
      console.error('Error fetching character arc data:', error);
    },
  });

  // Destructure five_act for cleaner code
  const five_act = data?.data?.response?.five_act;
  useEffect(() => {
    setHeaderProps({
      showSWStatus: true,
      scriptStatusBarDetails: {
        script_title: five_act?.script_title,
        script_id: true,
        script_info: true,
        script_analysis_data: true,
      },
      showDownload: true,
      pdfData: five_act,
    });
  }, [data, five_act]);

  if (isLoading) {
    return (
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        <CharacterArcScriptGenerationLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">Error: {error.message}</div>
    );
  }

  if (!five_act || !five_act.character_arc_analysis_data?.length) {
    return (
      <NoDataDisplayAndGenerate
        statusList={StatusList(id, true, true)}
        name={'Character arc Analysis'}
        inside={false}
        id={id}
      />
    );
  }

  const chartData = five_act.character_arc_analysis_data.map(arc => ({
    label: arc.arc_name,
    score: arc.score,
  }));

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] overflow-y-auto scrollbar-gray">
      <div className="w-full responsive-container mx-auto  rounded-xl shadow-lg p-1 space-y-1 text-white">
        {/* Header Section */}
        <div className="rounded-[16px] w-full flex flex-col gap-1 justify-center items-center  py-3 px-6">
          <h4 className="text-[#FCFCFC] text-[16px] font-medium">
          Trace Every Shift in Your Protagonist’s Transformation
          </h4>
          <p className="text-[#A3A3A3] text-center text-[14px]">
            Trace your protagonist’s journey.The choices, conflicts, and
            revelations that define their growth. See how every shift adds depth
            and emotion to your story’s core.
          </p>
        </div>
      </div>

      <div className="mt-[6px] flex justify-center w-full">
        <div className="flex flex-col w-full responsive-container">
          <CharacterArcChart graph_data={chartData} data={five_act} />
        </div>
      </div>

      <div className="mt-[10px] flex justify-center w-full">
        <div className="flex flex-col w-full responsive-container">
          <h2 className="text-[20px] font-semibold mb-4 text-[#FCFCFC]">
            Character Arc Explanations
          </h2>
          <div className="space-y-4  mb-8">
            {five_act.character_arc_analysis_data.map((act, index) => (
              <div
                key={index}
                className=" p-4 rounded-lg shadow border "
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
                    {act.arc_name}
                  </label>
                </Tooltip>
                <p className="text-sm text-[#B0B0B0] whitespace-pre-line mt-1 text-justify">
                  {act.analysis}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayCharacterArc;
