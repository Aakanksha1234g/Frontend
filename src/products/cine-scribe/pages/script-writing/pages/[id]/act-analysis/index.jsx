import React, { useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useParams } from 'react-router';
import GraphVisualizer from './Graph';
import NoDataDisplayAndGenerate from '../../../components/NoDataDisplay';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import { fetchData } from '@api/apiMethods';
import StatusList from '../../../components/StatusList';
import { Accordion, AccordionItem, Divider } from '@heroui/react';
import ActAnalysisScriptGenerationLoading from './loading';


const DisplayAnalysis = () => {
  const { id } = useParams();
  const { setHeaderProps } = useProductHeader();

  const fetchAnalysisData = async id => {
    const response = await fetchData({
      endpoint: `/display_script_analysis/${id}?category=act`,
    });

    const fiveAct = response?.data?.response?.five_act;
    if (!fiveAct?.act_wise_analysis_graph_data) {
      throw new Error('Invalid or missing analysis data');
    }

    fiveAct.act_wise_analysis_data = fiveAct.act_wise_analysis_data.map(act => ({
      ...act,
      analysis:
        typeof act.analysis === 'string'
          ? JSON.parse(act.analysis)
          : act.analysis,
    }));

    fiveAct.act_wise_analysis_graph_data =
      fiveAct.act_wise_analysis_graph_data.map(act => ({
        ...act,
        analysis:
          typeof act.analysis === 'string'
            ? JSON.parse(act.analysis)
            : act.analysis,
      }));

    return fiveAct;
  };


  const fetchScenesData = async id => {
    const scenesResponse = await fetchData({
      endpoint: `/scene_data/display_scene_data/${id}`,
    });
    return scenesResponse?.data?.response?.scene_summaries || [];
  };

  const transformAnalysisData = five_act => {
    const transformedData = {
      act_names: [],
      plot_and_theme: [],
      plot_and_theme_analysis: [],
      emotional_intensity: [],
      emotional_intensity_analysis: [],
      conflicts: [],
      conflicts_analysis: [],
      set_up_and_payoff: [],
      set_up_and_payoff_analysis: [],
    };

    five_act.act_wise_analysis_graph_data.forEach(act => {
      transformedData.act_names.push(act.act_name);
      transformedData.plot_and_theme.push(act.analysis.plot_and_theme.score);
      transformedData.plot_and_theme_analysis.push(
        act.analysis.plot_and_theme.analysis
      );
      transformedData.emotional_intensity.push(
        act.analysis.emotional_intensity.score
      );
      transformedData.emotional_intensity_analysis.push(
        act.analysis.emotional_intensity.analysis
      );
      transformedData.conflicts.push(act.analysis.conflict.score);
      transformedData.conflicts_analysis.push(act.analysis.conflict.analysis);
      transformedData.set_up_and_payoff.push(
        act.analysis.set_up_and_pay_off.score
      );
      transformedData.set_up_and_payoff_analysis.push(
        act.analysis.set_up_and_pay_off.analysis
      );
    });

    return transformedData;
  };

  const results = useQueries({
    queries: [
      {
        queryKey: ['actAnalysisData', id],
        queryFn: () => fetchAnalysisData(id),
        enabled: !!id,
      },
      {
        queryKey: ['scenesData', id],
        queryFn: () => fetchScenesData(id),
        enabled: !!id,
      },
    ],
  });

  const [
    {
      data: analysisData,
      isLoading: isAnalysisLoading,
      isError: isAnalysisError,
      error: analysisError,
      isPending: isAnalysisPending,
    },
    {
      data: scenesData,
      isLoading: isScenesLoading,
      isError: isScenesError,
      error: scenesError,
      isPending: isScenesPending,
    },
  ] = results;

  // Transform data for graph
  const transformedData = analysisData
    ? transformAnalysisData(analysisData)
    : {
      act_names: [],
      plot_and_theme: [],
      plot_and_theme_analysis: [],
      emotional_intensity: [],
      emotional_intensity_analysis: [],
      conflicts: [],
      conflicts_analysis: [],
      set_up_and_payoff: [],
      set_up_and_payoff_analysis: [],
    };




  useEffect(() => {
    setHeaderProps({
      showSWStatus: true,
      scriptStatusBarDetails: {
        script_title: analysisData?.script_title,
        script_id: true,
        script_info: true,
        script_analysis_data: true,
      },
      showDownload: true,
      pdfData: analysisData
    });
  }, [analysisData]);
  // Loading and error states
  if (
    isAnalysisLoading ||
    isScenesLoading ||
    isAnalysisPending ||
    isScenesPending
  ) {
    return (
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        <ActAnalysisScriptGenerationLoading />
      </div>
    );
  }

  if (isAnalysisError || isScenesError) {
    return (
      <div>
        Error loading data: {analysisError?.message || scenesError?.message}
      </div>
    );
  }

  if (!analysisData || !analysisData.act_wise_analysis_data?.length) {
    return (
      <NoDataDisplayAndGenerate
        statusList={StatusList(id, true, true)}
        name={'Act Analysis'}
        id={id}
      />
    );
  }

  return (
    <div className="w-full flex justify-center  text-justify scrollbar-gray overflow-y-auto">
      <div className="rounded-[16px] mt-[6px] responsive-container w-full flex flex-col gap-1 justify-center items-center">
        <div className='rounded-[16px] w-full flex flex-col gap-1 justify-center items-center  py-3 px-6'>
          <h4 className="text-[#FCFCFC] text-[16px] font-medium">
            See the Script Beneath the Surface
          </h4>
          <p className="text-[#A3A3A3] text-center text-[14px]">
            Unveil the full depth of your screenplay with comprehensive insights
            into your characters, plot developments, and key story moments.
            Empower your storytelling with a clear, detailed view that helps you
            refine, enhance, and elevate your narrative to its highest potential.
          </p>
        </div>

        <Divider />
        <div className="w-full ">
          {transformedData.act_names.length > 0 ? (
            <GraphVisualizer
              graph_data={transformedData}
              analysisData={analysisData}
            />
          ) : (
            <NoDataDisplayAndGenerate
              name={'Graph Act Analysis'}
              id={id}
              inside={true}
            />
          )}
        </div>
        <div className="border border-[#222222] rounded-2xl p-4 w-full">
          <Accordion
            variant="splitted"
            defaultExpandedKeys={['0']}
            className="w-full  space-y-4  text-[#fcfcfc] p-0 "
          >
     
            {analysisData?.act_wise_analysis_data?.map((act, index) => {
              const actTitle = act.act_name.split(':')[0];
              const actSubtitle = act.act_name.split(':')[1];

              return (
                <AccordionItem
                  key={index}
                  textValue={`${actTitle} ${actSubtitle}`}
                  title={<span className="text-lg lg:text-xl">{actTitle}</span>}
                  subtitle={
                    <span className="text-sm lg:text-lg">{actSubtitle}</span>
                  }
                  className="text-[#b0b0b0] text-sm lg:text-[16px]"
                >
                  {Object.entries(act.analysis).map(([key, value], i) => (
                    <div key={i}>
                      <p className="font-semibold my-2 text-sm lg:text-[16px] uppercase text-[#fcfcfc]">
                        {key
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, c => c.toUpperCase())}
                      </p>

                      {key !== 'suggestions' ? (
                        value
                      ) : Array.isArray(value) ? (
                        value.map((item, idx) => (
                          <p key={idx} className="text-sm lg:text-[16px]">
                            {idx + 1}. {item}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm lg:text-[16px]">{value}</p>
                      )}
                    </div>
                  ))}
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
      {/* </DisplayScriptLayout> */}
    </div>
  );
};

export default DisplayAnalysis;
