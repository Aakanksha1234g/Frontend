export const sceneIntExtOptionList = [
  {
    id: 1,
    value: 'INT',
  },
  {
    id: 2,
    value: 'EXT',
  },
  {
    id: 3,
    value: 'INT/EXT',
  },
  {
    id: 4,
    value: 'EXT/INT',
  },
];
export const sceneShotTimeOptionList = [
  {
    id: 6,
    value: 'DAY',
  },
  {
    id: 5,
    value: 'NIGHT',
  },
  {
    id: 7,
    value: 'MORNING',
  },
  {
    id: 8,
    value: 'SUNRISE',
  },
  {
    id: 9,
    value: 'DAWN',
  },
  {
    id: 10,
    value: 'AFTERNOON',
  },
  {
    id: 11,
    value: 'SUNSET',
  },
  {
    id: 12,
    value: 'DUSK',
  },
  {
    id: 13,
    value: 'TWILIGHT',
  },
  { id: 19, value: 'EVENING' },
];

export const sceneTypeOptionList = [
  {
    id: 14,
    value: 'MONTAGE',
  },
  {
    id: 15,
    value: 'FLASH BACK',
  },
  {
    id: 16,
    value: 'DREAM',
  },
  {
    id: 17,
    value: 'VISION',
  },
  {
    id: 18,
    value: 'VOICEOVER',
  },
];



export const toolTipText = {
  Logline:
    'A Concise summary that captures the main character, conflict, and stakes — like a movie pitch.',
  ProtagonistName: 'The main character who drives the story forward.',
  ProtagonistFlaw:
    'The key weakness or fear that holds the main character back and fuels their growth.',
  SubconsciousIdea:
    'The hidden emotional truth or inner drive beneath the story’s surface events.',
  PhilosophicalTheme:
    'The deeper life question or moral idea the story explores.',
  CharactersPresent:
    'The list of main characters appearing in the scene or story.',
  Title:
    'The name of your script.',
  SceneShotTime:
    'Indicates when the scene occurs, guiding the mood and cinematography.',
  SceneLocation:
    'The specific place or setting of the scene.',
  SceneIndicator:
     'Marks the narrative type or context of the scene , indicating how it fits into the script timeline.',
  SceneExtInt:
      'Scene specifies whether the scene takes place indoors  or outdoors.',
  SceneSummary:
       'Describe what happens in the scene, include key characters, actions, emotions, and how it advances the story.',
  
};



export const wordLimits = {
  logline: 50,
  protagonistname: 10,
  protagonistflaw: 10,
  philosophicaltheme: 50,
  subconsciousidea: 50,
  charactername: 10,
  characterrole:10,
  title:10,
  scenesummary:1000,
  scenelocation:10,
  sceneshottime:1
};

export const minWordLimits = {
  title:1,
  logline: 20,
  protagonistname:1,
  protagonistflaw: 1,
  philosophicaltheme: 5,
  subconsciousidea: 5,
  charactername: 1,
  characterrole:1,
  scenesummary:30,
  scenelocation:1,
  sceneshottime:1

};

export const wordDisplay = {
  logline: 'Logline',
  protagonistname: 'Protagonist Name',
  protagonistflaw: 'Protagonist Flaw',
  philosophicaltheme: 'Philosophical Theme',
  subconsciousidea: 'Subconscious Idea',
  charactername: 'Character Name',
  characterrole: 'Character Role',
  scenesummary:'Scene Summary',
  scenelocation:'Scene Location',


};


export const validateField = (name, value) => {
  const fieldName = name.replace(/[-_]/g, '');
  const field = fieldName.toLowerCase();

  // Skip empty or undefined values
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  const isDropdown = [
    "protagonistflaw",
  ].includes(field);

  if (isDropdown) {
    if (value.length > wordLimits[field]) {
      return `Add at most ${wordLimits[field]} ${field}`;
    }
  } else {
    const wordCount =
      typeof value === "string" ? value.trim().split(/\s+/).length : 0;

    if(wordCount < minWordLimits[field]){
      return `${wordDisplay[field]} must be at least ${minWordLimits[field]} words`;
    }

    if (wordCount > wordLimits[field]) {
      return `${wordDisplay[field]} must be at most ${wordLimits[field]} words`;
    }
  }

  return null;
};




