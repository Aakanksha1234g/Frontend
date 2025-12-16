import React, { useState, useEffect } from 'react';
import infoCircle from '@assets/icons/InfoCircle.svg';
import Tooltip from '@shared/ui/tooltip';
import Input from '@shared/ui/input';
import {
  toolTipText,
  placeholderTexts,
  errorMessages,
  appearanceFields,
  isWithinWordLimit,
  genderOptions,
  minWordLimits,
} from '@products/cine-sketch/constants/cine-sketch-constants.js';

/**
 * CharacterConsistencyForm allows users to view and edit detailed information
 * about each character in a script, including base traits and time-period-specific changes.
 *
 * Tracks unsaved changes, validates fields on blur, and highlights incomplete input.
 *
 * @param {Object} initialCharData - Character data passed from parent for editing.
 */
const CharacterConsistencyForm = ({ initialCharData }) => {
  const [charData, setCharData] = useState(initialCharData);
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState(
    Object.keys(initialCharData)[0]
  );
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Prevent accidental page navigation if there are unsaved changes.
   */
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (hasChanges) {
        const message = 'Are you sure you want to go without saving?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  /**
   * Handles field updates (base or time-period-specific).
   */
  const handleChange = (charName, timeKeyOrField, field, value) => {
    const updatedCharData = { ...charData };

    if (field && field.startsWith('appearance.')) {
      const appearanceField = field.split('.')[1];
      updatedCharData[charName].time_period[timeKeyOrField].appearance[
        appearanceField
      ] = value;
    } else if (field) {
      updatedCharData[charName].time_period[timeKeyOrField][field] = value;
    } else {
      updatedCharData[charName][timeKeyOrField] = value;
    }

    setCharData(updatedCharData);
    setHasChanges(true);
  };

  /**
   * Marks a field as touched when user leaves it.
   */
  const handleBlur = (charName, timeKey, field) => {
    const fieldKey = `${charName}-${timeKey}-${field}`;
    setTouchedFields(prev => ({
      ...prev,
      [fieldKey]: true,
    }));
  };

  /**
   * Renders appearance input fields like height, body type, etc.
   */
  const renderAppearanceFields = (charName, timeKey, appearanceData) => {
  return (
    <div className="w-full">
      <Input
        type="text"
        className="w-full mt-1.5"
        value={appearanceData || ""}
        onChange={(e) =>
          handleChange(charName, timeKey, "appearance", e.target.value)
        }
        onBlur={() => handleBlur(charName, timeKey, "appearance")}
      />
    </div>
  );
};


  /**
   * Renders editable fields for a given time period (like Flashback, Present, etc.)
   */
  const renderTimePeriodFields = (charName, timeKey, timeData) => (
    <div key={timeKey} className="bg-gray-50 rounded-xl p-5 mb-4">
      <h4 className="font-semibold text-sm mb-4 text-gray-700 capitalize">
        {timeKey}
      </h4>
      <div className="flex gap-6 mb-6">
        {/* Age field */}
        <div>
          <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
            Age
            <Tooltip text={toolTipText.age} position="right">
              <img
                src={infoCircle}
                alt="info"
                className="w-4 h-4 cursor-pointer"
              />
            </Tooltip>
          </label>
          <Input
            type="text"
            value={timeData.age === 'unspecified' ? '' : timeData.age || ''}
            placeholder={
              timeData.age === 'unspecified' || !timeData.age ? 'Enter age' : ''
            }
            onChange={e =>
              handleChange(charName, timeKey, 'age', e.target.value)
            }
            onBlur={() => handleBlur(charName, timeKey, 'age')}
            className="mt-1.5"
          />
          {touchedFields[`${charName}-${timeKey}-age`] &&
            !isWithinWordLimit(timeData.age, 'age') && (
              <p className="text-xs text-red-500 mt-1">{errorMessages.age}</p>
            )}
        </div>
        <div className='w-full'>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Appearance
            <Tooltip text={toolTipText.age} position="right">
              <img
                src={infoCircle}
                alt="info"
                className="w-4 h-4 cursor-pointer"
              />
            </Tooltip>
          </label>
          {renderAppearanceFields(charName, timeKey, timeData.appearance || {})}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3">
      <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
        Character Consistency Editor
      </h2>
      <div className="flex gap-8">
        {/* Sidebar with character list */}
        <div className="w-1/4 bg-white px-4 py-4 rounded-lg shadow-card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Characters
          </h3>
          <div className="space-y-1.5">
            {Object.keys(charData).map(charName => (
              <button
                key={charName}
                onClick={() => setSelectedCharacter(charName)}
                className={`w-full text-left px-4 py-2.5 rounded-lg cursor-pointer ${selectedCharacter === charName
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {charName}
              </button>
            ))}
          </div>
        </div>

        {/* Main form to edit selected character */}
        <div className="flex-1 bg-white rounded-xl p-6 shadow-card">
          {selectedCharacter && (
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-800">
                {selectedCharacter}
              </h3>

              {/* Base character fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {/* Gender dropdown */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    Gender
                    <Tooltip text={toolTipText.gender} position="right">
                      <img
                        src={infoCircle}
                        alt="info"
                        className="w-4 h-4 cursor-pointer"
                      />
                    </Tooltip>
                  </label>
                  <select
                    value={
                      charData[selectedCharacter].gender === 'unspecified'
                        ? ''
                        : charData[selectedCharacter].gender || ''
                    }
                    onChange={e =>
                      handleChange(
                        selectedCharacter,
                        'gender',
                        null,
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur(selectedCharacter, 'base', 'gender')
                    }
                    className="mt-1.5 w-full px-3 py-3 rounded-lg text-sm bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    {genderOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role field */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    Role
                    <Tooltip text={toolTipText.role} position="right">
                      <img
                        src={infoCircle}
                        alt="info"
                        className="w-4 h-4 cursor-pointer"
                      />
                    </Tooltip>
                  </label>
                  <Input
                    type="text"
                    value={
                      charData[selectedCharacter].role === 'unspecified'
                        ? ''
                        : charData[selectedCharacter].role || ''
                    }
                    placeholder={
                      charData[selectedCharacter].role === 'unspecified' ||
                        !charData[selectedCharacter].role
                        ? 'Enter role'
                        : ''
                    }
                    onChange={e =>
                      handleChange(
                        selectedCharacter,
                        'role',
                        null,
                        e.target.value
                      )
                    }
                    onBlur={() => handleBlur(selectedCharacter, 'base', 'role')}
                    className="mt-1.5"
                  />
                  {touchedFields[`${selectedCharacter}-base-role`] &&
                    !isWithinWordLimit(
                      charData[selectedCharacter].role,
                      'role'
                    ) && (
                      <p className="text-xs text-red-500 mt-1">
                        {errorMessages.role}
                      </p>
                    )}
                </div>

                {/* Ethnicity field */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    Ethnicity
                    <Tooltip text={toolTipText.ethnicity} position="right">
                      <img
                        src={infoCircle}
                        alt="info"
                        className="w-4 h-4 cursor-pointer"
                      />
                    </Tooltip>
                  </label>
                  <Input
                    type="text"
                    value={
                      charData[selectedCharacter].ethnicity === 'unspecified'
                        ? ''
                        : charData[selectedCharacter].ethnicity || ''
                    }
                    placeholder={
                      charData[selectedCharacter].ethnicity === 'unspecified' ||
                        !charData[selectedCharacter].ethnicity
                        ? 'Enter ethnicity'
                        : ''
                    }
                    onChange={e =>
                      handleChange(
                        selectedCharacter,
                        'ethnicity',
                        null,
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur(selectedCharacter, 'base', 'ethnicity')
                    }
                    className="mt-1.5"
                  />
                  {touchedFields[`${selectedCharacter}-base-ethnicity`] &&
                    !isWithinWordLimit(
                      charData[selectedCharacter].ethnicity,
                      'ethnicity'
                    ) && (
                      <p className="text-xs text-red-500 mt-1">
                        {errorMessages.ethnicity}
                      </p>
                    )}
                </div>
              </div>

              {/* Time period-specific fields */}
              {Object.entries(charData[selectedCharacter]?.time_period).map(
                ([timeKey, timeData]) =>
                  renderTimePeriodFields(selectedCharacter, timeKey, timeData)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterConsistencyForm;
