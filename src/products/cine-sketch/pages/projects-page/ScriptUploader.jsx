import { useState, useRef, useEffect } from 'react';
import clipBoard from '@assets/cine-sketch/Clipboard.svg';
import infoCircle from '@assets/icons/InfoCircle.svg';
import Tooltip from '@shared/ui/tooltip';
import { apiRequest } from '@shared/utils/api-client';
import { useNavigate } from 'react-router';
import SparkleIcon from '@assets/pitch-craft/SparkleIcon.svg?react';
import CloseIcon from '@assets/pitch-craft/CloseIcon.svg?react';
import Button from '@ui/Button';
import Heading from '@ui/Heading';
import {
  toolTipText,
  placeholderTexts,
  minWordLimits,
  maxWordLimits,
  validationMessages,
} from '@products/cine-sketch/constants/cine-sketch-constants';
import Dropdown from "@ui/Dropdown";
import DropdownItem from "@ui/DropdownItem";

export default function ScriptUploader({ setIsScriptUploaderOpen }) {
  const [currentStep, setCurrentStep] = useState('upload');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptData, setScriptData] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [shotCount, setShotCount] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [charData, setCharData] = useState({});
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [expandedCharacters, setExpandedCharacters] = useState({});
  const [isCastCrewExpanded, setIsCastCrewExpanded] = useState(true);
  const [openTimePeriodDropdown, setOpenTimePeriodDropdown] = useState(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleDrop = e => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Load scenes when scriptData is available
  useEffect(() => {
    if (scriptData?.scene_data) {
      const normalizedScenes = scriptData.scene_data.map(scene => ({
        ...scene,
        scene_key_elements: scene.scene_key_elements || {},
      }));
      setScenes(normalizedScenes);
    }
  }, [scriptData]);

  // Initialize shot count when scenes load
  useEffect(() => {
    setShotCount(scenes.map(scene => ({ shot_count: scene.shot_count || 5 })));
  }, [scenes]);

  const handleGenerate = async () => {
    if (!title || !title.trim()) {
      setErrors(prev => ({
        ...prev,
        script_title: validationMessages.script_title_required,
      }));
      return;
    }

    const wordCount = title.trim().split(/\s+/).length;

    if (wordCount < minWordLimits.script_title) {
      setErrors(prev => ({
        ...prev,
        script_title: validationMessages.script_title_min(
          minWordLimits.script_title
        ),
      }));
      return;
    }

    if (wordCount > maxWordLimits.script_title) {
      setErrors(prev => ({
        ...prev,
        script_title: validationMessages.script_title_max(
          maxWordLimits.script_title
        ),
      }));
      return;
    }

    if (!file) {
      return alert(validationMessages.file_required);
    }

    try {
      setIsGenerating(true);
      const formData = new FormData();
      formData.append('upload_file', file);
      console.log(title, file);

      const response = await apiRequest({
        endpoint: '/sketch_script_input',
        method: 'POST',
        params: { script_title: title },
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          accept: 'application/json',
        },
        successMessage: 'Script is saved successfully!',
      });

      if (response?.response?.script_id) {
        // Instead of navigating, stay in modal and show Shot Count
        setScriptData(response.response);
        setCurrentStep('shotCount');
        setIsGenerating(false);
      }
    } catch (e) {
      console.error('There is something wrong: ', e);
      setIsGenerating(false);
    }
  };

  const handleShotCountChange = (index, newValue) => {
    setShotCount(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, shot_count: newValue } : item
      )
    );
  };

  const handleTimePeriodChange = (index, value) => {
    const updatedScenes = [...scenes];
    if (!updatedScenes[index].scene_key_elements) {
      updatedScenes[index].scene_key_elements = {};
    }
    updatedScenes[index].scene_key_elements.time_period = value;
    setScenes(updatedScenes);
  };

  const toggleSceneExpansion = (index) => {
    setExpandedScenes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleCharacterExpansion = (charName) => {
    // Only allow one character to be expanded at a time
    setExpandedCharacters({
      [charName]: true
    });
  };

  const fetchCharacterDetails = async () => {
    if (!scriptData?.script_id) {
      console.error('No script_id available');
      return;
    }

    try {
      setIsLoadingCharacters(true);
      console.log('Fetching character details for script_id:', scriptData.script_id);
      console.log('Current scriptData:', scriptData);

      // First check if character data is already in scriptData (from initial upload)
      let charDataArray = scriptData?.char_data || [];

      // If not found in scriptData, fetch from API
      if (!charDataArray || charDataArray.length === 0) {
        console.log('No char_data in scriptData, fetching from API...');
        const response = await apiRequest({
          endpoint: '/get_character_details',
          method: 'GET',
          params: { script_id: scriptData.script_id },
          successMessage: 'Character details fetched successfully!',
        });

        console.log('Character details API response:', response);

        // Check different possible response structures
        charDataArray = response?.response?.char_data || response?.char_data || [];
      } else {
        console.log('Using char_data from scriptData:', charDataArray);
      }

      if (charDataArray && charDataArray.length > 0) {
        const normalizedCharData = {};
        charDataArray.forEach(charObj => {
          // Check if the object has character_name property (new structure)
          if (charObj.character_name) {
            const charName = charObj.character_name;
            const { character_name, ...charDetails } = charObj;
            normalizedCharData[charName] = {
              ...charDetails,
              time_period: charDetails.time_period || {},
            };
          } else {
            // Fallback to old structure where character name is the key
            const [charName, charDetails] = Object.entries(charObj)[0];
            normalizedCharData[charName] = {
              ...charDetails,
              time_period: charDetails.time_period || {},
            };
          }
        });

        console.log('Normalized character data:', normalizedCharData);
        setCharData(normalizedCharData);

        // Set the first character as selected by default
        const firstCharName = Object.keys(normalizedCharData)[0];
        if (firstCharName) {
          setSelectedCharacter(firstCharName);
        }
      } else {
        console.warn('No character data found. charDataArray:', charDataArray);
      }
    } catch (e) {
      console.error('Failed to fetch character details: ', e);
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  const goToCharacterEditor = async () => {
    setCurrentStep('characterEditor');
    await fetchCharacterDetails();
  };

  const handleCharacterChange = (charName, field, value) => {
    setCharData(prev => ({
      ...prev,
      [charName]: {
        ...prev[charName],
        [field]: value,
      },
    }));
  };

  const handleTimePeriodCharacterChange = (charName, timePeriod, field, value) => {
    setCharData(prev => ({
      ...prev,
      [charName]: {
        ...prev[charName],
        time_period: {
          ...prev[charName].time_period,
          [timePeriod]: {
            ...prev[charName].time_period[timePeriod],
            [field]: value,
          },
        },
      },
    }));
  };

  const goToCharacterConsistency = () => {
    navigate(`/cine-sketch/character-consistency/${scriptData.script_id}`, {
      state: {
        shotCount,
        scenes: scenes.map(scene => ({
          scene_data_id: scene.scene_data_id,
          scene_sequence_no: scene.scene_sequence_no,
          scene_key_elements: scene.scene_key_elements,
        })),
        char_data: Object.entries(charData).map(([charName, charDetails]) => ({
          [charName]: charDetails,
        })),
      },
    });
    setIsScriptUploaderOpen(false);
  };

  return (
    <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl min-h-[400px] text-white mx-auto relative bg-gradient-to-b from-[#333333] to-[#717171] p-0.5 rounded-2xl">
      <div className="w-full h-full rounded-2xl relative bg-black px-6 py-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">

        {/* Close Button */}
        <Button
          onClick={() => setIsScriptUploaderOpen(false)}
          className="absolute top-4 right-4 z-10"
        >
          <CloseIcon className="w-7 h-7" />
        </Button>

        {/* Content Card */}
        <div className="relative p-2 overflow-hidden mt-4 bg-[#0000004D]">

          {/* Tabs Navigation */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center bg-[#2A2A2A] rounded-full p-0.5">
              <button
                className={`px-2 py-1 rounded-full text-[12px] ${currentStep === 'upload' ? 'bg-[#3D3D3D] text-white font-bold' : 'text-gray-500 font-light'}`}
                disabled
              >
                Script Upload
              </button>
              <button
                className={`px-6 py-1 rounded-full text-[12px] ${currentStep === 'shotCount' ? 'bg-[#3D3D3D] text-white font-bold' : 'text-gray-500 font-light'}`}
                disabled
              >
                Shot Count
              </button>
              <button
                className={`px-2 py-1 rounded-full text-[12px] ${currentStep === 'characterEditor' ? 'bg-[#3D3D3D] text-white font-bold' : 'text-gray-500 font-light'}`}
                disabled
              >
                Character Editor
              </button>
            </div>
          </div>

          {/* Conditional rendering based on current step */}
          {currentStep === 'upload' ? (
            <>
              {/* Script Upload View */}
              <Heading
                as="h1"
                size="5xl"
                fontWeight={"light"}
                margin="mb8"
                className="text-center"
              >
                Upload Your <span className="font-bold">Script</span>
              </Heading>

              {/* Project title input */}
              <div className="mb-4">
                <label className="text-sm font-medium flex items-center gap-2 text-white mb-1" style={{ fontFamily: 'Outfit', fontWeight: 500 }}>
                  <span>
                    Project Title <span className="text-red-400">*</span>
                  </span>
                  <Tooltip text={toolTipText.script_title} position="right">
                    <img
                      src={infoCircle}
                      alt="info"
                      className="w-4 h-4 cursor-pointer"
                    />
                  </Tooltip>
                </label>
                <input
                  required
                  value={title}
                  type="text"
                  name="title"
                  placeholder={placeholderTexts.script_title}
                  onChange={e => {
                    setTitle(e.target.value);
                  }}
                  className="w-full h-10 min-h-[32px] rounded-md text-white
                             placeholder-gray-400 text-sm pl-4
                             bg-[#171717] border-t border-[#FFFFFF1A]
                             focus:outline-none focus:ring-2 focus:ring-white/50
                             shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)_inset]"
                  style={{ fontFamily: 'Outfit', fontWeight: 500 }}
                />
                {errors.script_title && (
                  <p className="text-red-400 text-sm mt-1">{errors.script_title}</p>
                )}
              </div>

              {/* Drag and drop file area */}
              <div className="mb-4">
                <label className="text-sm font-medium text-white mb-2 block">
                  Upload Files <span className="text-red-400">*</span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={triggerFileSelect}
                  className="w-full h-44 border-2 border-dashed border-[#FFFFFF1A] rounded-lg flex flex-col items-center justify-center cursor-pointer text-center bg-[#171717] hover:border-[#FFFFFF33] transition-colors"
                >
                  <img src={clipBoard} alt="clipboard" className="h-10 mb-3 opacity-70" />
                  {file ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-red-400 text-sm cursor-pointer hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-white mb-1">
                        Drop file or Browse
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Format: pdf, docx, doc & Max file size: 25 MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2 px-6 py-2 disabled:bg-[#2e2e2e] disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-[8px]">
                    <SparkleIcon className="w-5 h-5 text-white" />
                    <span className="text-[16px] leading-6 font-medium text-white">
                      {isGenerating ? 'Generating Scenes...' : 'Generate Scenes'}
                    </span>
                  </div>
                </Button>
              </div>
            </>
          ) : currentStep === 'shotCount' ? (
            <>
              {/* Shot Count View */}
              <Heading
                as="h1"
                size="5xl"
                fontWeight="light"
                margin="mb8"
                className="text-center"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
              >
                Shot <span className="font-bold" style={{ fontWeight: 700 }}>Count</span>
              </Heading>

              {/* Scene Cards Container with fixed height */}
              <div className="flex flex-col gap-4 mb-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#2A2A2A] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#5A5A5A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#6A6A6A]" style={{ maxHeight: 'calc(100vh - 450px)' }}>
                {scenes.map((scene, index) => (
                  <div
                    key={scene.scene_data_id}
                    className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-5"
                  >
                    {/* Scene Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-white text-[10px] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                          SCENE - {String(scene.scene_sequence_no).padStart(2, '0')}
                        </p>
                        <h3 className="text-white text-sm mb-1.5 leading-tight" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                          {scene.scene_title}
                        </h3>
                        <div>
                          <p className={`text-[#999999] text-xs leading-[1.4] ${!expandedScenes[index] ? 'line-clamp-3' : ''}`} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                            {scene.scene_description}
                          </p>
                          {scene.scene_description && scene.scene_description.length > 150 && (
                            <button
                              onClick={() => toggleSceneExpansion(index)}
                              className="text-[#888888] text-xs underline mt-0.5 hover:text-white transition-colors"
                              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                            >
                              {expandedScenes[index] ? 'View less' : 'View more'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Controls on the right */}
                      <div className="flex flex-row gap-2.5 items-center flex-shrink-0">
                        {/* Time Period Dropdown */}
                        <Dropdown
                          isOpen={openTimePeriodDropdown === index}
                          onClose={() => setOpenTimePeriodDropdown(null)}
                          trigger={
                            <button
                              onClick={() => setOpenTimePeriodDropdown(openTimePeriodDropdown === index ? null : index)}
                              className="bg-[#1A1A1A] text-white border border-[#2A2A2A] rounded-full px-3.5 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-white/20 min-w-[120px] cursor-pointer flex items-center justify-between gap-2"
                              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                            >
                              <span>{scene.scene_key_elements?.time_period || 'Present'}</span>
                              <svg
                                className={`w-3.5 h-3.5 text-white transition-transform duration-200 flex-shrink-0 ${openTimePeriodDropdown === index ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          }
                        >
                          <DropdownItem
                            onClick={() => {
                              handleTimePeriodChange(index, 'Present');
                              setOpenTimePeriodDropdown(null);
                            }}
                          >
                            Present
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              handleTimePeriodChange(index, 'Flashback');
                              setOpenTimePeriodDropdown(null);
                            }}
                          >
                            Flashback
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              handleTimePeriodChange(index, 'Flash Forward');
                              setOpenTimePeriodDropdown(null);
                            }}
                          >
                            Flash Forward
                          </DropdownItem>
                        </Dropdown>

                        {/* Shot Count Controls */}
                        <div className="flex items-center bg-[#1A1A1A] rounded-full px-2 py-1.5 border border-[#2A2A2A] gap-0.5">
                          <button
                            onClick={() => {
                              const currentCount = shotCount[index]?.shot_count || 5;
                              if (currentCount > 5) {
                                handleShotCountChange(index, currentCount - 1);
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center text-white hover:text-gray-400 transition-colors text-sm"
                            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
                          >
                            −
                          </button>
                          <span className="text-white text-[13px] min-w-[28px] text-center font-medium px-1.5" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                            {String(shotCount[index]?.shot_count || 5).padStart(2, '0')}
                          </span>
                          <button
                            onClick={() => {
                              const currentCount = shotCount[index]?.shot_count || 5;
                              if (currentCount < 40) {
                                handleShotCountChange(index, currentCount + 1);
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center text-white hover:text-gray-400 transition-colors text-sm"
                            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate Characters Button - Always visible at bottom */}
              <div className="flex justify-center pt-4 sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent pb-2">
                <Button
                  onClick={goToCharacterEditor}
                  disabled={scenes.length === 0}
                  className="gap-2 px-6 py-2 disabled:bg-[#2e2e2e] disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-[8px]">
                    <SparkleIcon className="w-5 h-5 text-white" />
                    <span className="text-[16px] leading-6 font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                      Generate Characters
                    </span>
                  </div>
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Character Editor View */}
              <Heading
                as="h1"
                size="2xl"
                fontWeight="light"
                margin="none"
                className="text-center mb-6 sm:text-4xl"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
              >
                Character <span className="font-bold" style={{ fontWeight: 700 }}>Editor</span>
              </Heading>

              {isLoadingCharacters ? (
                <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 450px)', minHeight: '400px' }}>
                  <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
                    Loading character details...
                  </p>
                </div>
              ) : (
                <>
                <div className="flex gap-6 mb-4" style={{ height: 'calc(100vh - 500px)', minHeight: '350px' }}>
                  {/* Left Sidebar - Character List */}
                  <div className="w-[320px] flex-shrink-0">
                  <div className="bg-[#1A1A1A] border border-[#262626] rounded-lg overflow-hidden h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-dashed border-[#262626]">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-white text-base font-light" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                          Cast & Crew
                        </h3>
                      </div>
                      <button onClick={() => setIsCastCrewExpanded(!isCastCrewExpanded)} className="focus:outline-none">
                        <svg
                          className={`w-5 h-5 text-white transition-transform duration-200 ${isCastCrewExpanded ? '' : 'rotate-180'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Character List */}
                    {isCastCrewExpanded && (
                    <div className="flex-1 overflow-y-auto p-3">
                      {Object.keys(charData).length > 0 ? (
                        <div className="space-y-2">
                          {Object.keys(charData).map((charName, index) => (
                            <button
                              key={charName}
                              onClick={() => {
                                setSelectedCharacter(charName);
                                toggleCharacterExpansion(charName);
                              }}
                              className={`w-full flex items-center justify-between px-5 py-2 rounded-xl transition-all duration-200 ${
                                selectedCharacter === charName
                                  ? 'bg-[#2A2A2A] text-white'
                                  : 'bg-[#262626] text-white hover:bg-[#2A2A2A]'
                              }`}
                              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
                            >
                              <span className="text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>{index + 1}. {charName}</span>
                              <svg
                                className={`w-4 h-4 text-white flex-shrink-0 transition-transform duration-200 ${
                                  expandedCharacters[charName] ? '-rotate-90' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-[#666666] text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                            No characters found
                          </p>
                          <p className="text-[#666666] text-xs font-light mt-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}>
                            Check console for errors
                          </p>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Character Details */}
                <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#2A2A2A] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#5A5A5A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#6A6A6A]">
                  {selectedCharacter && charData[selectedCharacter] && (
                    <div className="bg-[#0D0D0D] border border-[#262626] rounded-lg p-6">
                      {/* Character Name Header */}
                      <h2 className="text-white text-left mb-6 font-medium text-3xl uppercase" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                        {selectedCharacter}
                      </h2>

                      <div className="grid grid-cols-3 gap-7 mb-7">
                        {/* Role */}
                        <div className="min-w-0">
                          <label className="text-white text-xs mb-2 block" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                            Role <span className="text-red-400">*</span>
                          </label>
                          <Dropdown
                            isOpen={isRoleDropdownOpen}
                            onClose={() => setIsRoleDropdownOpen(false)}
                            trigger={
                              <button
                                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer flex items-center justify-between gap-2"
                                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                              >
                                <span className="truncate">{charData[selectedCharacter].role || 'Select Role'}</span>
                                <svg
                                  className={`w-4 h-4 text-white transition-transform duration-200 flex-shrink-0 ${isRoleDropdownOpen ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            }
                          >
                            <DropdownItem
                              onClick={() => {
                                handleCharacterChange(selectedCharacter, 'role', 'Protagonist');
                                setIsRoleDropdownOpen(false);
                              }}
                            >
                              Protagonist
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                handleCharacterChange(selectedCharacter, 'role', 'Antagonist');
                                setIsRoleDropdownOpen(false);
                              }}
                            >
                              Antagonist
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                handleCharacterChange(selectedCharacter, 'role', 'Supporting');
                                setIsRoleDropdownOpen(false);
                              }}
                            >
                              Supporting
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                handleCharacterChange(selectedCharacter, 'role', 'Minor');
                                setIsRoleDropdownOpen(false);
                              }}
                            >
                              Minor
                            </DropdownItem>
                          </Dropdown>
                        </div>

                        {/* Gender */}
                        <div className="min-w-0 ml-12">
                          <label className="text-white text-xs mb-2 block" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                            Gender <span className="text-red-400">*</span>
                          </label>
                          <Dropdown
                            isOpen={isGenderDropdownOpen}
                            onClose={() => setIsGenderDropdownOpen(false)}
                            trigger={
                              <button
                                onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                                className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer flex items-center justify-between gap-2"
                                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                              >
                                <span className="truncate capitalize">{charData[selectedCharacter].gender || 'Select Gender'}</span>
                                <svg
                                  className={`w-4 h-4 text-white transition-transform duration-200 flex-shrink-0 ${isGenderDropdownOpen ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            }
                          >
                            <DropdownItem
                              onClick={() => {
                                handleCharacterChange(selectedCharacter, 'gender', 'Male');
                                setIsGenderDropdownOpen(false);
                              }}
                            >
                              Male
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                handleCharacterChange(selectedCharacter, 'gender', 'Female');
                                setIsGenderDropdownOpen(false);
                              }}
                            >
                              Female
                            </DropdownItem>
  
                          </Dropdown>
                        </div>

                        {/* Ethnicity */}
                        <div className="min-w-0">
                          <label className="text-white text-xs mb-2 block" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                            Ethnicity <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={charData[selectedCharacter].ethnicity || ''}
                            onChange={(e) => handleCharacterChange(selectedCharacter, 'ethnicity', e.target.value)}
                            placeholder="Enter ethnicity"
                            className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                          />
                        </div>
                      </div>

                      {/* PRESENT Section */}
                      {Object.entries(charData[selectedCharacter].time_period || {}).map(([timePeriod, timeData]) => (
                        <div key={timePeriod} className="mt-6">
                          <h2 className="text-white text-lg font-semibold mb-4 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                            {timePeriod}
                          </h2>

                          <div className="mb-4">
                            <label className="text-white text-xs mb-2 block" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                              Age <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={timeData.age || ''}
                              onChange={(e) => handleTimePeriodCharacterChange(selectedCharacter, timePeriod, 'age', e.target.value)}
                              placeholder="Enter age"
                              className="w-full h-10 px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                            />
                          </div>

                          <div className="mb-4">
                            <label className="text-white text-xs mb-2 block" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                              Appearance <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={timeData.appearance || ''}
                              onChange={(e) => handleTimePeriodCharacterChange(selectedCharacter, timePeriod, 'appearance', e.target.value)}
                              placeholder="Enter appearance..."
                              rows={4}
                              className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
                              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, lineHeight: '1.6' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Storyboard Button */}
              <div className="flex justify-center pt-4 mt-4">
                <Button
                  onClick={goToCharacterConsistency}
                  disabled={Object.keys(charData).length === 0}
                  className="gap-2 px-6 py-2 disabled:bg-[#2e2e2e] disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-[8px]">
                    <SparkleIcon className="w-5 h-5 text-white" />
                    <span className="text-[16px] leading-6 font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                      Generate Storyboard
                    </span>
                  </div>
                </Button>
              </div>
              </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


