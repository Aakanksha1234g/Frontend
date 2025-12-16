import { Divider, Slider, Spinner } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import DurationIcon from '@assets/icons/Clock Square.svg';
import SaveDurationIcon from '@assets/icons/floppy-disk.svg';
import {
  convertTimeToMS,
  formatMillisecondsToHHMMSS,
} from './timeFormatFunctions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';

const DurationEditComponent = ({ duration, sceneId, scriptId }) => {
  const [editDuration, setEditDuration] = useState(convertTimeToMS(duration)); // in ms
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditDuration(convertTimeToMS(duration));
  }, [duration]);

  const { mutate, isLoading } = useMutation({
    mutationKey: ['updateSceneEvaluationData', sceneId],
    mutationFn: () =>
      sendData({
        endpoint: `/scene_evaluation_processing/update_scene/${sceneId}`,
        method: 'PUT',
        body: {
          scene_duration: formatMillisecondsToHHMMSS(editDuration),
        },
      }),
    onSuccess: () => {
  
      queryClient.invalidateQueries(['sceneEvaluations', scriptId]);
    },
    onError: error => {
      console.error('Mutation error:', error);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center flex-2 h-4/5 bg-[#3c3c3c] px-2 py-4 rounded-xl space-y-2">
      {/* --- Duration Header Row --- */}
      <div className="flex items-center justify-between w-full border border-[#000] rounded-xl bg-[#2e2e2e] py-2.5 px-1">
        <div className="flex items-center gap-2">
          <img src={DurationIcon} alt="Duration" className="w-6 h-6" />
          <span className="text-[#fcfcfc] text-sm font-semibold">Duration</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#f5f5f5]">
            {formatMillisecondsToHHMMSS(editDuration)}
          </span>

          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <img
              src={SaveDurationIcon}
              alt="Save Duration"
              title="Save Changes"
              className={`w-5 h-5 transition-all duration-150 ${
                editDuration !== convertTimeToMS(duration)
                  ? 'opacity-100 cursor-pointer hover:scale-110'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              onClick={() =>
                editDuration !== convertTimeToMS(duration) && mutate()
              }
            />
          )}
        </div>
      </div>

      {/* --- Slider --- */}
      <div className="w-full">
        <Slider
          hideValue
          value={editDuration}
          maxValue={900000}
          step={5000}
          onChange={value => setEditDuration(value)}
          renderThumb={props => (
            <div
              {...props}
              className="group p-1 top-1/2 bg-[#006FEE] border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
            >
              <span className="transition-transform bg-[#fcfcfc] shadow-small rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
            </div>
          )}
          marks={[
            { value: 60000, label: '1m' },
            { value: 300000, label: '5m' },
            { value: 600000, label: '10m' },
            { value: 900000, label: '15m' },
          ]}
        />
      </div>
    </div>
  );
};

export default DurationEditComponent;
