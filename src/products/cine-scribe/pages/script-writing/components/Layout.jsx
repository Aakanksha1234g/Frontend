import React, { useEffect, useState } from 'react';
import StatusBar from '@shared/ui/status-bar';
import { useParams } from 'react-router';
import { apiRequest } from '@shared/utils/api-client';
import ScriptDetailEdit from '../pages/[id]/input/ScriptDetailEdit';

const DisplayScriptLayout = ({ children, statusList }) => {
  const [data, setData] = useState({});
  const { id } = useParams();
  const [displayScriptOverView, setDisplayScriptOverview] = useState(false);
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        const response = await apiRequest({
          endpoint: `/script/display_script/${id}`,
        });

        if (!isSubscribed) return;

        if (!response?.response) {
          throw new Error('Invalid API response format');
        }

        const apiData = response.response;
        setData({
          ...apiData,
        });
      } catch (error) {
        if (!isSubscribed) return;
        setData({});
      }
    };

    fetchData();

    return () => (isSubscribed = false);
  }, [id]);

  if (!data.script_title) {
    return (
      <div className="p-4 h-[calc(100vh-100px)]">
        <div className="flex w-full items-center mb-4 bg-white p-3 rounded-lg shadow-shadow-chat-button shadow-xl">
          <div className="animate-pulse h-10 w-1/5 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 ml-4 w-4/5">
            <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="flex gap-4 max-h-[calc(100vh-220px)] justify-center">
          <div className="bg-white rounded-md shadow-shadow-chat-button shadow-xl p-4 w-full">
            <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-[calc(100vh-100px)] text-pretty">
      {/* Header Section */}
      <div className="flex w-full items-center mb-4 ">
        <div
          className="flex w-1/5 items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
          // onClick={() => setDisplayScriptOverview(!displayScriptOverView)}
        >
          <h2 className="text-lg font-semibold text-gray-800 uppercase">
            {/* Script Overview */} {data.script_title}
          </h2>
          {/* <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
              displayScriptOverView ? "rotate-90" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg> */}
        </div>
 
        <div className="flex-1 ml-4 w-4/5">
          <StatusBar statusList={[...statusList]} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex gap-4 max-h-[calc(100vh-220px)] justify-center">
        {/* Script Overview Panel */}
        <div
          className={`bg-white rounded-md shadow-shadow-chat-button shadow-lg overflow-y-auto p-4 transition-all duration-300 ${
            displayScriptOverView ? 'w-1/5 flex' : 'hidden'
          }`}
        >
          <div className="space-y-4 ">
            {window.location.pathname.includes('/input') ? (
              <ScriptDetailEdit data={data} />
            ) : (
              <>
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </h3>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {data.script_title}
                  </h1>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                    {data.story_summary}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`bg-transparent rounded-md shadow-shadow-chat-button shadow-xl p-4 transition-all duration-300 overflow-y-auto ${
            displayScriptOverView ? 'w-4/5' : 'w-full'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DisplayScriptLayout;
