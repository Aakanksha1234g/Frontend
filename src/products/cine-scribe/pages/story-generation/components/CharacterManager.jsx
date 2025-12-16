import React,{useState} from 'react';
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Tooltip,
} from '@heroui/react';
import {
  wordLimits,
  toolTipText,
  placeholderText,
  genres,
  themes,
  // validateField,
  validateForm,
} from '@products/cine-scribe/constants/StoryGenerationConstants';

import Input from '@shared/ui/input';
import { DeleteIcon } from '@shared/layout/icons';

const CHARACTER_TYPES = [
  {
    key: 'protagonist',
    label: 'Protagonist',
    max: 3,
    fields: ['Name', 'Traits', 'Motivation', 'Flaws'],
    tooltip:
      'Your main character — central to your story and emotional core.',
  },
  {
    key: 'antagonist',
    label: 'Antagonist',
    max: 2,
    fields: ['Name', 'Traits'],
    tooltip:
      'The opposing force that creates tension and challenges the protagonist.',
  },
  {
    key: 'supporting',
    label: 'Supporting Character',
    max: 4,
    fields: ['Name', 'Traits'],
    tooltip:
      'Secondary characters who help or challenge the main character’s journey.',
  },
];

const FIELD_LABELS = {
  Name: 'Name',
  Traits: 'Traits',
  Motivation: 'Motivation',
  Flaws: 'Flaws',
};

const FIELD_TOOLTIPS = {
  protagonist: {
    Name: 'Give your main character a clear and memorable name.',
    Traits:
      'What makes your hero stand out? (e.g., kind, determined, curious).',
    Motivation: 'What drives your hero? What are they fighting for or chasing?',
    Flaws: 'What holds your hero back? Weaknesses that make them relatable.',
  },
  antagonist: {
    Name: 'Give your villain or opposing force a strong, clear name.',
    Traits: 'What makes them a threat? (e.g., manipulative, ruthless, charming).',
  },
  supporting: {
    Name: 'Give your supporting character a name that fits their role.',
    Traits:
      'What role do they play in helping or challenging the main characters?',
  },
};

const validateField = (field, value) => {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  switch (field) {
    case 'Name':
      if (!value.trim()) return 'Name is required';
      return wordCount <= 10 ? null : 'Name must be atmost 10 words';
    case 'Traits':
      return wordCount <= 20 ? null : 'Traits must be atmost 20 words';
    case 'Motivation':
      return wordCount <= 30 ? null : 'Motivation must be atmost 30 words';
    case 'Flaws':
      return wordCount <= 30 ? null : 'Flaws must be atmost 30 words';
    default:
      return null;
  }
};

export default function CharacterManager({
  formData,
  setFormData,
  errors,
  setValidationErrors,
  readOnly = false,
}) {


  const safeFormData = {
    characters: formData?.characters ?? {
      protagonist: [],
      antagonist: [],
      supporting: [],
    },
  };

const handleChange = (type, idx, field, value) => {
  // const validationError = validateField(field, value);

 
  // setValidationErrors(prev => {
  //   const newErrors = { ...prev };
  //   if (validationError) newErrors[`${type}-${idx}-${field}`] = validationError;
  //   else delete newErrors[`${type}-${idx}-${field}`];
  //   return newErrors;
  // });

  
  setFormData(prev => {
    const prevCharacters = prev?.characters || {
      protagonist: [],
      antagonist: [],
      supporting: [],
    };

    const updatedCharacters = {
      ...prevCharacters,
      [type]: prevCharacters[type].map((c, i) =>
        i === idx ? { ...c, [field]: value } : c
      ),
    };

    return {
      ...prev,
      characters: updatedCharacters, 
    };
  });
};


  const handleBlur = (type, idx, field, value) => {
    const validationError = validateField(field, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (validationError) {
        newErrors[`${type}-${idx}-${field}`] = validationError;
      } else {
        delete newErrors[`${type}-${idx}-${field}`];
      }
      return newErrors;
    });
  };

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    type: null,
    idx: null,
  });

  const [openAccordions, setOpenAccordions] = useState({});



  const canAddCharacter = type => {
    const characters = safeFormData.characters[type] || [];
    if (characters.length === 0) return true;
    const lastChar = characters[characters.length - 1];
    return !!lastChar?.Name?.trim();
  };

const addCharacter = (type, fields) => {
  if (!canAddCharacter(type)) {
    setValidationErrors(prev => ({
      ...prev,
      [`${type}-add`]: 'Please enter a Name before adding another character',
    }));
    return;
  }


  setValidationErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[`${type}-add`];
    return newErrors;
  });

  
  setFormData(prev => {
    const prevCharacters = prev?.characters || {
      protagonist: [],
      antagonist: [],
      supporting: [],
    };

    const newChar = fields.reduce((acc, f) => ({ ...acc, [f]: '' }), {});
    const updatedCharacters = {
      ...prevCharacters,
      [type]: [...(prevCharacters[type] || []), newChar],
    };

    
    const newIndex = updatedCharacters[type].length - 1;
    setOpenAccordions(prevOpen => ({
      ...prevOpen,
      [type]: `${type}-${newIndex}`,
    }));

    return {
      ...prev,
      characters: updatedCharacters,
    };
  });
};



  const deleteCharacter = (type, idx) => {
    setFormData(prev => {
      const prevCharacters = prev?.characters || {
        protagonist: [],
        antagonist: [],
        supporting: [],
      };

      const updated = {
        ...prevCharacters,
        [type]: prevCharacters[type].filter((_, i) => i !== idx),
      };

      return {
        ...prev,
        characters: updated,
      };
    });
  };


  return (
    <div className="">
      {CHARACTER_TYPES.map(
        ({
          key: CharacterKey,
          label: CharacterTypeLabel,
          max,
          fields,
          tooltip,
        }) => {
          const characters = safeFormData.characters[CharacterKey] || [];

          return (
            <div key={CharacterKey} className="">
              {/* Header with tooltip on label */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <Tooltip
                    content={tooltip}
                    showArrow
                    placement="right"
                    classNames={{
                      base: 'max-w-[150px]',
                      content: 'text-xs',
                    }}
                  >
                    <h5 className="text-sm font-semibold cursor-pointer">
                      {CharacterTypeLabel}
                    </h5>
                  </Tooltip>

                  {characters.length > 0 && (
                    <span className="ml-2 text-sm">
                      ({characters.length}/{max})
                    </span>
                  )}
                </div>


                {!readOnly && (
                  <div className="flex flex-col items-end">
                    <Button
                      type="button"
                      onPress={() => addCharacter(CharacterKey, fields, max)}
                      className={`button-primary ${
                        characters.length >= max ||
                        !canAddCharacter(CharacterKey)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      disabled={
                        characters.length >= max ||
                        !canAddCharacter(CharacterKey)
                      }
                    >
                      + Add
                    </Button>
                    {errors?.[`${CharacterKey}-add`] && (
                      <p className="text-error-500 text-xs mt-1">
                        {errors[`${CharacterKey}-add`]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Character Accordion */}
              {characters.length > 0 && (
                <Accordion
                  variant="bordered"
                  className="px-2"
                  selectedKeys={new Set([openAccordions[CharacterKey]])}
                  onSelectionChange={keys => {
                    const key = Array.from(keys)[0];
                    setOpenAccordions(prev => ({
                      ...prev,
                      [CharacterKey]:
                        key === openAccordions[CharacterKey] ? null : key,
                    }));
                  }}
                >
                  {characters.map((char, idx) => (
                    <AccordionItem
                      key={`${CharacterKey}-${idx}`}
                      aria-label={`${CharacterTypeLabel}-${idx}`}
                      title={
                        <div className="flex justify-between items-center w-full">
                          <span>
                            {(char.Name && char.Name.toUpperCase()) ||
                              `${CharacterTypeLabel} #${idx + 1}`}
                          </span>

                          {!readOnly && (
                            <button
                              type="button"
                              onClick={e => {
                                e.preventDefault();
                                setConfirmDelete({
                                  show: true,
                                  type: CharacterKey,
                                  idx,
                                });
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              <DeleteIcon size={20} />
                            </button>
                          )}
                        </div>
                      }
                    >
                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                        {fields.map(field => (
                          <div key={field}>
                            <Input
                              label={FIELD_LABELS[field]}
                              tooltipText={FIELD_TOOLTIPS[CharacterKey][field]}
                              errorMessage={
                                errors[`${CharacterKey}-${idx}-${field}`]
                              }
                              required={field === 'Name'}
                              value={char[field] || ''}
                              onChange={e =>
                                !readOnly &&
                                handleChange(
                                  CharacterKey,
                                  idx,
                                  field,
                                  e.target.value
                                )
                              }
                              onBlur={e =>
                                !readOnly &&
                                handleBlur(
                                  CharacterKey,
                                  idx,
                                  field,
                                  e.target.value
                                )
                              }
                              placeholder={`Enter ${FIELD_LABELS[field]}`}
                              disabled={readOnly}
                              wordLimit={wordLimits[field]}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              <Divider className="my-4" />
            </div>
          );
        }
      )}

      {confirmDelete.show && (
        <div className="fixed inset-0 flex items-center justify-center z-70 bg-black/50 backdrop-blur-md">
          <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up min-w-[250px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
            <p className="text-center text-sm text-primary-gray-900">
              Are you sure you want to delete this character?
            </p>
            <div className="w-full flex items-center justify-center gap-2">
              <Button
                size="md"
                onClick={() => {
                  deleteCharacter(confirmDelete.type, confirmDelete.idx);
                  setConfirmDelete({ show: false, type: null, idx: null });
                }}
                className="bg-[#EB5545] hover:bg-[#EB5545]/80 text-[#FCFCFC] cursor-pointer"
              >
                Delete
              </Button>
              <Button
                size="md"
                onClick={() =>
                  setConfirmDelete({ show: false, type: null, idx: null })
                }
                className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
