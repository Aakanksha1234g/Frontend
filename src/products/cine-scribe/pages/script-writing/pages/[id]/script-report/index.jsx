import React, { useEffect, useReducer } from "react";
import DisplayScriptLayout from "../../../components/Layout";
import { useParams } from "react-router";
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import NoDataDisplayAndGenerate from "../../../components/NoDataDisplay";
import { useUser } from "@shared/context/user-context";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@api/apiMethods";
import StatusList from "../../../components/StatusList";
import Script from "@products/cine-scribe/pages/story-generation/pages/[id]/script";
import ScriptReportGenerationLoading from "./loading";

const initialState = {
  uiState: {
    analysisInProgress: false,
    processStatus: null,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_UI_STATE":
      return {
        ...state,
        uiState: { ...state.uiState, ...action.payload },
      };
    case "UPDATE_PROCESS_STATUS":
      return {
        ...state,
        uiState: {
          ...state.uiState,
          processStatus: action.payload,
        },
      };
    default:
      return state;
  }
}

const DisplayScriptAnalysisReport = () => {
  const selectedLevel = "medium";
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { uiState } = state;
  const { state: profileState } = useUser();
  const processCheckInterval = React.useRef(null);
  const { setHeaderProps } = useProductHeader();

  const { data, isPending, error } = useQuery({
    queryKey: ["finalReportData", id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/display_script_analysis/${id}?category=report`,
        method: "GET",
      });
      return response.data.response.five_act;
    },
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

    const getCurrentLevelData = () => {
      if (!Array.isArray(data?.final_report_data?.analysis)) return null;
      return data.final_report_data?.analysis;
    };

    const currentLevelData = getCurrentLevelData();

   useEffect(() => {
      setHeaderProps({
        showSWStatus: true,
        scriptStatusBarDetails: {
          script_title: data?.script_title,
          script_id: true,
          script_info: true,
          script_analysis_data: true,
        },
        showDownload: true,
        pdfData: currentLevelData,
      });
    }, [data, currentLevelData]);



  useEffect(() => {
    return () => {
      if (processCheckInterval.current) clearInterval(processCheckInterval.current);
    };
  }, []);

  if (isPending)
    return (
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        <ScriptReportGenerationLoading />
      </div>
    );
  if (error)
    return <div className="text-center py-8 text-red-400">Error: {error}</div>;
  if (!data?.final_report_data || Object.keys(data.final_report_data?.analysis).length === 0)
    return (
      <NoDataDisplayAndGenerate
        name={"Script Report"}
        id={id}
        statusList={StatusList(id, true, true)}
      />
    );



  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] scrollbar-gray overflow-y-auto">
      <div className="w-full responsive-container mx-auto  rounded-xl shadow-lg p-1 space-y-1 text-white">
        {/* Header Section */}
        <div className="rounded-[16px] w-full flex flex-col gap-1 justify-center items-center  py-3 px-6">
          <h4 className="text-[#FCFCFC] text-[16px] font-medium">
            See the Overall Picture of Your Script
          </h4>
          <p className="text-[#A3A3A3] text-center text-[14px]">
            Get a high-level report that captures your script’s plot,
            screenplay, and suggestions — all in one clear snapshot.
          </p>
        </div>

        {/* <div className="flex justify-end items-center">
          <FinalAnalysisPdfDownloadButton
            data={currentLevelData[0]}
            createdBy={profileState?.username || "XXX"}
            projectName={data.script_title}
            criticismLevel={data?.final_report_data?.level}
          />
        </div>

        <p className="text-gray-400">
          You have selected the{" "}
          <span className="text-white font-semibold">
            {data?.final_report_data?.level}
          </span>{" "}
          level.
        </p> */}

        {currentLevelData ? (
          <div className="w-full space-y-6 overflow-y-auto">
            {Object.entries(currentLevelData[0]).map(([key, value], index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#2a2a2a] bg-[#171717] p-6 shadow-md transition-all duration-300"
              >
                <h3 className="text-[16px] font-bold text-[#fcfcfc] capitalize">
                  {key.replace(/_/g, ' ')}
                </h3>

                {typeof value === 'string' ? (
                  <div className="text-sm text-[#B0B0B0] whitespace-pre-line mt-1 text-justify">
                    {value}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(value).map(
                      ([subKey, subValue], subIndex) => (
                        <div
                          key={subIndex}
                          className="text-sm text-[#B0B0B0] whitespace-pre-line mt-1 text-justify"
                        >
                          <span className="text-[16px] font-bold text-[#fcfcfc] capitalize">
                            {subKey.replace(/_/g, ' ')}:
                          </span>{' '}
                          {subValue}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center rounded-md border-dashed border border-gray-600 bg-[#1a1a1a] p-8">
            <p className="text-gray-400">
              No data available for {selectedLevel} level
            </p>
            <button
              disabled={uiState.analysisInProgress}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              {uiState.analysisInProgress ? 'Analyzing...' : 'Generate Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayScriptAnalysisReport;
