export const minWordLimits = {
  script_title: 1,
  role: 1,
  ethnicity: 1,
  adjective: 1,
  age: 1,
  body_type: 1,
  clothing: 1,
  complexion: 1,
  cultural_elements: 0,
  facial_features: 1,
  hair_description: 1,
  height: 1,
};

export const maxWordLimits = {
  script_title: 30,
  role: 20,
  ethnicity: 10,
  age: 5,
  adjective: 20,
  body_type: 20,
  clothing: 20,
  complexion: 10,
  cultural_elements: 20,
  facial_features: 20,
  hair_description: 20,
  height: 5,
};

export const genderOptions = ['male', 'female', 'non-binary', 'other'];

export const appearanceFields = [
  'body_type',
  'clothing',
  'complexion',
  'cultural_elements',
  'facial_features',
  'hair_description',
  'height',
];

export const toolTipText = {
  script_title: 'This is the title of your storyboard',
  gender: "Select the character's gender identity",
  role: "Enter the character's role in the story",
  ethnicity: "Specify the character's ethnic background",
  age: "Enter the character's age in this time period",
  personality: "Describe the character's personality traits",
  body_type: "Describe the character's body type and build",
  clothing: "Describe the character's clothing and style",
  complexion: "Describe the character's skin tone and complexion",
  cultural_elements: 'Describe any cultural elements in appearance',
  facial_features: 'Describe distinctive facial features',
  hair_description: "Describe the character's hair style and color",
  height: "Specify the character's height",
};

export const placeholderTexts = {
  script_title: 'Name your script',
  role: 'Enter character role',
  ethnicity: 'Enter ethnicity',
  age: 'Enter age',
  adjective: 'Enter personality traits',
  body_type: 'Enter body type',
  clothing: 'Enter clothing description',
  complexion: 'Enter complexion',
  cultural_elements: 'Enter cultural elements',
  facial_features: 'Enter facial features',
  hair_description: 'Enter hair description',
  height: 'Enter height',
};

export const validationMessages = {
  script_title_required: 'Script title is required.',
  script_title_min: min =>
    `Script title must be at least ${min} word${min > 1 ? 's' : ''}.`,
  script_title_max: max => `Script title must be at most ${max} words.`,
  file_required: 'Please upload a file.',
};

export const errorMessages = {
  script_title: 'Title must be between 1 and 30 words',
  role: 'Role must be between 1 and 20 words',
  ethnicity: 'Ethnicity must be between 1 and 10 words',
  age: 'Age must be between 1 and 5 words',
  adjective: 'Personality must be between 1 and 20 words',
  body_type: 'Body type must be between 1 and 20 words',
  clothing: 'Clothing must be between 1 and 20 words',
  complexion: 'Complexion must be between 1 and 10 words',
  cultural_elements: 'Cultural elements must be between 0 and 20 words',
  facial_features: 'Facial features must be between 1 and 20 words',
  hair_description: 'Hair description must be between 1 and 20 words',
  height: 'Height must be between 1 and 5 words',
};

export const isWithinWordLimit = (text, field) => {
  if (!text) return true;
  const words = text.trim().split(/\s+/);
  const minWords = minWordLimits[field] || 0;
  const maxWords = maxWordLimits[field] || Infinity;
  return words.length >= minWords && words.length <= maxWords;
};
