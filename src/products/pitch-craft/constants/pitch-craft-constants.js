// Placeholder Prompts
export const sampleStories = [
  'In a post-apocalyptic future, humanity lives in floating sky cities above an uninhabitable Earth...',
  'In a kingdom where magic is outlawed, an orphaned thief named Elen stumbles upon a sentient sword...',
  'A therapist begins treating a boy who claims his imaginary friend is real...',
  'During the early 1800s, a struggling writer discovers a cache of letters from a mysterious benefactor...',
  'In a neon-soaked underbelly of Hong Kong, mercenaries retrieve an ancient artifact from a vault...',
  'When a data analyst is added to a group chat by mistake, she starts an unlikely romance...',
  'An artist in a coastal town paints vivid landscapes from her dreams...',
  'In a dystopian mega-city, memories are bought and sold, and a detective is drawn into a conspiracy...',
  'During a centuries-long war, a young officer discovers a shocking truth about the conflict...',
  'In a small town during the 1980s, a teenager listens to a cassette tape that changes his life...',
];

// Genre & Theme Options
export const genreOptions = [
  'Drama',
  'Comedy',
  'Thriller',
  'Action',
  'Horror',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Crime',
  'Historical/Period',
];
export const themeOptions = [
  'Love',
  'Good vs Evil',
  'Coming of Age',
  'Survival',
  'Revenge',
  'Death and Mortality',
  'Justice & Injustice',
];

// Word Limits
export const minWordLimits = {
  pitch_title: 1,
  pitch_plot: 30,
  pitch_genre: 1,
  pitch_key_elements: 1,
  character_description: 10,
};

export const maxWordLimits = {
  pitch_title: 10,
  pitch_plot: 1000,
  pitch_genre: 5,
  pitch_key_elements: 5,
  character_description: 150,
};

// Tooltips 
export const toolTipText = {
  pitch_title: 'Give your project a memorable title',
  pitch_plot: "Describe your story's setup, conflict, and stakes",
  pitch_genre:
    'The primary category or style of your story. This helps guide the tone and plot structure.',
  pitch_theme: 'Add thematic elements like love, revenge, discovery, etc.',
  character_description:
    'Include personality traits, history, motivations, etc.',
  character_name: 'Enter the full name of the character.',
  actor_name: 'Enter the full name of the actor/actress.',
  role: "Enter the role of the actor/actress.",
  age: 'Age can help anchor the character in your story world.',
  gender: 'Specify the character\'s gender identity.',
  height: 'height in ft (e.g., 6ft).',
  weight: 'height in kg (e.g., 180kg).',
};

// Placeholders 
export const placeholderTexts = {
  pitch_title: 'Name your pitch.',
  pitch_plot: 'Enter your story plot.',
  character_name: 'Enter the full name of the character.',
  actor_name: 'Enter the full name of the actor/actress.',
  role: "Enter the role of the actor/actress.",
  age: 'Age can help anchor the character in your story world.',
  gender: 'gender',
  height: 'height in ft (e.g., 6ft).',
  weight: 'height in kg (e.g., 180kg).',
  character_description: 'Describe the character...',
};

// Validation Messages 
export const validationMessages = {
  // Character-related validations
  character_name_required: 'Character name is required.',
  character_description_required: 'Character description is required.',
  character_description_min: min => `Minimum ${min} words required.`,
  character_description_max: max => `Maximum ${max} words allowed.`,

  actor_name_required: 'Actor name is required.',
  actor_description_required: 'Actor description is required.',
  actor_description_min: min => `Minimum ${min} words required.`,
  actor_description_max: max => `Maximum ${max} words allowed.`,

  // Pitch-related validations
  pitch_title_required: 'Pitch title is required.',
  pitch_title_min: min => `Pitch title must be at least ${min} word.`,
  pitch_title_max: max => `Pitch title must be at most ${max} words.`,
  pitch_plot_required: 'Plot synopsis is required.',
  pitch_plot_min: min => `Plot synopsis must be at least ${min} words.`,
  pitch_plot_max: max => `Plot synopsis must be at most ${max} words.`,
  genre_required: 'At least one genre is required.',
  genre_max: max => `Select at most ${max} genres.`,
  theme_required: 'At least one theme is required.',
  theme_max: max => `Select at most ${max} themes.`,

  // File validation
  file_required: 'Please upload a script file.',

  // Actor-related validations
  actor_name_required: 'Actor name is required.',
  character_name_required: 'Character name is required.',
  role_required: 'Role is required.',
  age_required: 'Age is required.',
  age_invalid: 'Please enter a valid age number',
  gender_required: 'Gender is required.',
  height_required: 'Height is required.',
  height_invalid: 'Please enter a valid height',
  weight_required: 'Weight is required.',
  weight_invalid: 'Please enter a valid weight',
};

// Field Validation Logic 
export const validateField = (name, value) => {
  switch (name) {
    // PITCH FIELDS
    case 'pitch_title': {
      if (!value || !value.trim())
        return validationMessages.pitch_title_required;
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount < minWordLimits.pitch_title)
        return validationMessages.pitch_title_min(minWordLimits.pitch_title);
      if (wordCount > maxWordLimits.pitch_title)
        return validationMessages.pitch_title_max(maxWordLimits.pitch_title);
      return null;
    }
    case 'pitch_plot': {
      if (!value || !value.trim())
        return validationMessages.pitch_plot_required;
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount < minWordLimits.pitch_plot)
        return validationMessages.pitch_plot_min(minWordLimits.pitch_plot);
      if (wordCount > maxWordLimits.pitch_plot)
        return validationMessages.pitch_plot_max(maxWordLimits.pitch_plot);
      return null;
    }
    case 'pitch_genre': {
      if (!value || value.length === 0)
        return validationMessages.genre_required;
      if (value.length > maxWordLimits.pitch_genre)
        return validationMessages.genre_max(maxWordLimits.pitch_genre);
      return null;
    }
    case 'pitch_key_elements': {
      if (!value || value.length === 0)
        return validationMessages.theme_required;
      if (value.length > maxWordLimits.pitch_key_elements)
        return validationMessages.theme_max(maxWordLimits.pitch_key_elements);
      return null;
    }

    // CHARACTER FIELDS
    case 'character_name': {
      if (!value || !value.trim())
        return validationMessages.character_name_required;
      return null;
    }
    case 'actor_name': {
      if (!value || !value.trim())
        return validationMessages.actor_name_required;
      return null;
    }
    case 'description': {
      if (!value || !value.trim())
        return validationMessages.character_description_required;
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount < minWordLimits.character_description)
        return validationMessages.character_description_min(
          minWordLimits.character_description
        );
      if (wordCount > maxWordLimits.character_description)
        return validationMessages.character_description_max(
          maxWordLimits.character_description
        );
      return null;
    }

    // ACTOR & ROLE FIELDS
    case 'actor_name': {
      if (!value || !value.trim())
        return validationMessages.actor_name_required;
      return null;
    }
    case 'role': {
      if (!value || !value.trim())
        return validationMessages.role_required;
      return null;
    }

    // PHYSICAL ATTRIBUTES
    case 'age': {
      if (!value || !value.trim())
        return validationMessages.age_required;
      const age = Number(value);
      if (isNaN(age) || age <= 0 || age > 120)
        return validationMessages.age_invalid;
      return null;
    }
    case 'gender': {
      if (!value || !value.trim())
        return validationMessages.gender_required;
      return null;
    }
    case 'height': {
      if (!value || !value.trim())
        return validationMessages.height_required;
      const isValidHeight = /^\d+(\.\d+)?(ft|cm)$/.test(value.trim());
      if (!isValidHeight)
        return validationMessages.height_invalid;
      return null;
    }
    case 'weight': {
      if (!value || !value.trim())
        return validationMessages.weight_required;
      const isValidWeight = /^\d+(\.\d+)?(kg|lbs)?$/.test(value.trim());
      if (!isValidWeight)
        return validationMessages.weight_invalid;
      return null;
    }

    // FILE UPLOAD
    case 'file': {
      if (!value)
        return validationMessages.file_required;
      return null;
    }

    // DEFAULT
    default:
      return null;
  }
};

