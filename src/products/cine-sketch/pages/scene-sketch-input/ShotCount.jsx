import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Fountain } from 'fountain-js';

import downIcon from '@assets/icons/down.svg';
import upIcon from '@assets/icons/up.svg';
import SparkleIcon from '@assets/pitch-craft/SparkleIcon.svg?react';
import CloseIcon from '@assets/pitch-craft/CloseIcon.svg?react';
import Button from '@ui/Button';

/**
 * ShotCount modal displays parsed scenes from a script.
 *
 * It allows users to review each scene, adjust shot counts,
 * and set the time period (e.g., flashback or present).
 * On completion, users can move to character consistency setup.
 */
export default function ShotCount({ setIsShotCountOpen }) {
  const navigate = useNavigate();
  const { script_id } = useParams();
  const [scenes, setScenes] = useState([]);
  const [shotCount, setShotCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const scriptDataFromState = location.state?.scriptData;
  const fountain = new Fountain();

  /**
   * Fetch scene data from state (passed via navigation).
   * Normalize data structure to ensure key elements exist.
   */
  useEffect(() => {
    const fetchSceneData = async () => {
      try {
        setLoading(true);
        if (scriptDataFromState?.scene_data) {
          const normalizedScenes = scriptDataFromState.scene_data.map(
            scene => ({
              ...scene,
              scene_key_elements: scene.scene_key_elements || {},
            })
          );
          setScenes(normalizedScenes);
        }
      } catch (error) {
        setError('Failed to load scene data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSceneData();
  }, [scriptDataFromState]);

  /**
   * When scenes load, initialize shot count for each scene.
   * Default to 5 shots if none provided.
   */
  useEffect(() => {
    setShotCount(scenes.map(scene => ({ shot_count: scene.shot_count || 5 })));
  }, [scenes]);

  /**
   * Updates shot count for a given scene.
   */
  const handleShotCountChange = (index, newValue) => {
    setShotCount(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, shot_count: newValue } : item
      )
    );
  };

  /**
   * Updates time period (e.g., flashback) for a scene.
   */
  const handleTimePeriodChange = (index, value) => {
    const updatedScenes = [...scenes];
    if (!updatedScenes[index].scene_key_elements) {
      updatedScenes[index].scene_key_elements = {};
    }
    updatedScenes[index].scene_key_elements.time_period = value;
    setScenes(updatedScenes);
  };

  /**
   * Converts scene objects into raw script text (title + description).
   * Used to re-parse the script using Fountain.
   */
  const convertSceneObjectsToScript = sceneObjects => {
    return sceneObjects
      .map(
        scene =>
          `${scene.scene_title || ''}\n\n${scene.scene_description || ''}`
      )
      .join('\n\n');
  };

  /**
   * Takes Fountain-parsed tokens and renders styled JSX output.
   */
  const renderFormattedScript = tokens => {
    return tokens.map((token, idx) => {
      switch (token.type) {
        case 'action':
          return (
            <p key={idx} className="my-2 w-full">
              {token.text}
            </p>
          );
        case 'character':
          return (
            <p key={idx} className="uppercase text-center font-semibold mt-4">
              {token.text}
            </p>
          );
        case 'dialogue':
          return (
            <p key={idx} className="text-center italic text-gray-500">
              {token.text}
            </p>
          );
        default:
          return null;
      }
    });
  };

  /**
   * Navigate to the Character Consistency screen,
   * passing current shot counts and scenes as state.
   */
  const goToCharacterConsistency = () => {
    navigate(`/cine-sketch/character-consistency/${script_id}`, {
      state: {
        shotCount,
        scenes: scenes.map(scene => ({
          scene_data_id: scene.scene_data_id,
          scene_sequence_no: scene.scene_sequence_no,
          scene_key_elements: scene.scene_key_elements,
        })),
        char_data: scriptDataFromState?.char_data || {},
      },
    });
  };

  if (error) {
    return (
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl min-h-[400px] text-white mx-auto relative bg-gradient-to-b from-[#333333] to-[#717171] p-0.5 rounded-2xl">
        <div className="w-full h-full rounded-2xl relative bg-black px-6 py-4">
          <div className="p-4 text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl min-h-[400px] text-white mx-auto relative bg-gradient-to-b from-[#333333] to-[#717171] p-0.5 rounded-2xl">
      <div className="w-full h-full rounded-2xl relative bg-black px-6 py-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">

        {/* Close Button - Only show when used as modal */}
        {setIsShotCountOpen && (
          <Button
            onClick={() => setIsShotCountOpen(false)}
            className="absolute top-4 right-4 z-10"
          >
            <CloseIcon className="w-5 h-5" />
          </Button>
        )}

        {/* Content Card */}
        <div className="relative p-6 overflow-hidden mt-4 bg-[#0000004D] rounded-lg">

          {/* Loading Overlay with Blur */}
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white text-lg font-medium">Processing your script...</p>
                <p className="text-gray-400 text-sm mt-2">Generating scenes and analyzing content</p>
              </div>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center bg-[#2A2A2A] rounded-full p-0.5">
              <button className={`px-6 py-1 text-[12px] font-light rounded-full ${!loading ? 'bg-[#3D3D3D] text-white font-bold' : 'text-gray-500'}`}>
                Script Upload
              </button>
              <button className={`px-6 py-1 text-[12px] font-light rounded-full ${!loading ? 'bg-[#3D3D3D] text-white font-bold' : 'text-gray-500'}`}>
                Shot Count
              </button>
              <button className="px-2 py-1 text-gray-500 text-[12px] font-light">
                Character Editor
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-white text-center mb-8 font-light text-5xl">
            Shot <span className="font-bold">Count</span>
          </h1>

          {/* Scene Cards */}
          <div className="flex flex-col gap-4 mb-6 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#2A2A2A] [&::-webkit-scrollbar-thumb]:bg-[#3D3D3D] [&::-webkit-scrollbar-thumb]:rounded-full">
            {scenes.map((scene, index) => (
              <div
                key={scene.scene_data_id}
                className="bg-[#171717] border border-[#FFFFFF1A] rounded-lg p-4"
              >
                {/* Scene Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-[#999999] text-xs mb-1 uppercase tracking-wide">
                      SCENE - {String(scene.scene_sequence_no).padStart(2, '0')}
                    </p>
                    <h3 className="text-white font-semibold text-base mb-2">
                      {scene.scene_title}
                    </h3>
                    <p className="text-gray-400 text-xs/4 ">
                      {scene.scene_description}
                    </p>
                  </div>

                  {/* Controls on the right */}
                  <div className="flex flex-col gap-3 ml-4 items-end">
                    {/* Time Period Dropdown */}
                    <select
                      value={scene.scene_key_elements?.time_period || 'Present'}
                      onChange={e => handleTimePeriodChange(index, e.target.value)}
                      className="bg-[#2A2A2A] text-white border border-[#3D3D3D] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 min-w-[140px]"
                      style={{ fontFamily: 'Outfit', fontWeight: 400 }}
                    >
                      <option value="Present">Present</option>
                      <option value="Flashback">Flashback</option>
                      <option value="Flash Forward">Flash Forward</option>
                    </select>

                    {/* Shot Count Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const currentCount = shotCount[index]?.shot_count || 5;
                          if (currentCount > 5) {
                            handleShotCountChange(index, currentCount - 1);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#3D3D3D] text-white rounded border border-[#3D3D3D] transition-colors"
                      >
                        −
                      </button>
                      <span className="text-white text-sm min-w-[30px] text-center font-medium">
                        {String(shotCount[index]?.shot_count || 5).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => {
                          const currentCount = shotCount[index]?.shot_count || 5;
                          if (currentCount < 40) {
                            handleShotCountChange(index, currentCount + 1);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#3D3D3D] text-white rounded border border-[#3D3D3D] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generate Characters Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={goToCharacterConsistency}
              disabled={scenes.length === 0 || loading}
              className="gap-2 px-6 py-2 disabled:bg-[#2e2e2e] disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-[8px]">
                <SparkleIcon className="w-5 h-5 text-white" />
                <span className="text-[16px] leading-6 font-medium text-white">
                  Generate Characters
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
