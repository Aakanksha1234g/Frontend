import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PitchCraftLogo from '@assets/pitch-craft/PitchCraftLogo.svg?react';
import PitchCraftLogoDark from '@assets/pitch-craft/PitchCraftLogoDark.svg?react';
import SparkleIcon from '@assets/pitch-craft/SparkleIcon.svg?react';
import CloseIcon from '@assets/pitch-craft/CloseIcon.svg?react';
import Button from '@ui/Button';
import Heading from '@ui/Heading';
import Input from '@ui/Input';
import { useTheme } from '@products/pitch-craft/contexts/ThemeContext';
import Chip from '@ui/Chip';
import { apiRequest } from '@shared/utils/api-client';
import { useApplyTemplates } from '@products/pitch-craft/contexts/TemplatesContext';
import {
  genreOptions,
  themeOptions,
  placeholderTexts,
  toolTipText,
  validationMessages,
  minWordLimits,
  maxWordLimits,
} from '../../constants/pitch-craft-constants';
import Loading from '@ui/Loading';
import HelpTooltip from '@ui/HelpTooltip';

export default function CreateNewProject({ onClose }) {
  const navigate = useNavigate();
  const { templateId, setTemplateId } = useApplyTemplates();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    projectTitle: '',
    storySummary: '',
    selectedGenres: [],
    selectedThemes: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const showErrors = () => {
    const errors = {
      projectTitle:
        (formData.projectTitle !== '' || touched.projectTitle) &&
        validateProjectTitle(formData.projectTitle),
      storySummary:
        (formData.storySummary !== '' || touched.storySummary) &&
        validateStorySummary(formData.storySummary),
      selectedGenres:
        (formData.selectedGenres.length > 0 || touched.selectedGenres) &&
        validateGenres(formData.selectedGenres),
      selectedThemes:
        (formData.selectedThemes.length > 0 || touched.selectedThemes) &&
        validateThemes(formData.selectedThemes),
    };
    setErrors(errors);
  };

  useEffect(() => {
    showErrors();
  }, [formData]);

  // VALIDATION FUNCTIONS
  const wordCount = text => text.trim().split(/\s+/).length;

  const validateProjectTitle = val => {
    if (!val.trim()) return validationMessages.pitch_title_required;
    if (wordCount(val) > maxWordLimits.pitch_title)
      return validationMessages.pitch_title_max(maxWordLimits.pitch_title);
    return '';
  };

  const validateStorySummary = val => {
    if (!val.trim()) return validationMessages.pitch_plot_required;
    if (wordCount(val) > maxWordLimits.pitch_plot)
      return validationMessages.pitch_plot_max(maxWordLimits.pitch_plot);
    if (wordCount(val) < minWordLimits.pitch_plot)
      return validationMessages.pitch_plot_min(minWordLimits.pitch_plot);
    return '';
  };

  const validateGenres = list => {
    if (list.length > maxWordLimits.pitch_genre)
      return validationMessages.genre_max(maxWordLimits.pitch_genre);
    if (list.length < minWordLimits.pitch_genre)
      return validationMessages.genre_required;
    return '';
  };

  const validateThemes = list => {
    if (list.length > maxWordLimits.pitch_key_elements)
      return validationMessages.theme_max(maxWordLimits.pitch_key_elements);
    if (list.length < minWordLimits.pitch_key_elements)
      return validationMessages.theme_required;
    return '';
  };

  const isFormValid = () => {
    return (
      !validateProjectTitle(formData.projectTitle) &&
      !validateStorySummary(formData.storySummary) &&
      !validateGenres(formData.selectedGenres) &&
      !validateThemes(formData.selectedThemes)
    );
  };

  // HANDLERS
  const handleGenreSelect = useCallback(genre => {
    setFormData(prev => {
      const updated = prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre];

      // Always validate when user selects a chip
      setErrors(err => ({
        ...err,
        selectedGenres: validateGenres(updated),
      }));

      setTouched(t => ({ ...t, selectedGenres: true }));

      return { ...prev, selectedGenres: updated };
    });
  }, []);

  const handleThemeSelect = useCallback(theme => {
    setFormData(prev => {
      const updated = prev.selectedThemes.includes(theme)
        ? prev.selectedThemes.filter(t => t !== theme)
        : [...prev.selectedThemes, theme];

      setErrors(err => ({
        ...err,
        selectedThemes: validateThemes(updated),
      }));

      setTouched(t => ({ ...t, selectedThemes: true }));

      return { ...prev, selectedThemes: updated };
    });
  }, []);

  // SUBMIT
  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {
      projectTitle: validateProjectTitle(formData.projectTitle),
      storySummary: validateStorySummary(formData.storySummary),
      selectedGenres: validateGenres(formData.selectedGenres),
      selectedThemes: validateThemes(formData.selectedThemes),
    };
    setErrors(newErrors);
    setTouched({
      projectTitle: true,
      storySummary: true,
      selectedGenres: true,
      selectedThemes: true,
    });

    if (Object.values(newErrors).some(msg => msg)) return;

    setIsLoading(true);
    if (templateId === null) setTemplateId(1);
    try {
      const response = await apiRequest({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        endpoint: '/create_pitchdeck',
        method: 'POST',
        body: {
          pitch_title: formData.projectTitle,
          pitch_genre: formData.selectedGenres.join(','),
          pitch_key_elements: formData.selectedThemes.join(','),
          pitch_plot: formData.storySummary,
          template_id: templateId,
        },
        successMessage: 'Pitchcraft created successfully',
      });

      setTemplateId(null);
      const pitchId = response?.response?.pitch_id;
      if (pitchId) {
        navigate(`/pitch-craft/projects/${pitchId}`);
      }
    } catch (error) {
      console.error('Error creating pitch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[95vw] max-h-[95%] sm:max-w-[90vw] mx-auto relative bg-gradient-to-b dark:from-dark-text dark:to-[#717171] from-[#B6B6B6] to-[#E6E6E6] p-[2px] rounded-3xl">
      {!isLoading && (
        <div className={`w-full rounded-3xl relative overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} dark:bg-black bg-white px-6 pt-1 overflow-y-auto overflow-x-hidden`}>
          {/* Close Button */}
          <Button
            onClick={onClose}
            className="absolute p-2 rounded-full top-4 right-4 z-10"
          >
            <CloseIcon />
          </Button>

          {/* Card */}
          <div className="relative p-4 overflow-hidden mt-4 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-2 -mt-4">
              <div className="flex items-center justify-center mb-2">
                {theme === "dark" ? <PitchCraftLogo alt="PitchCraft-logo" className="h-8 w-24 object-fit" /> : <PitchCraftLogoDark alt="PitchCraft-logo" className="h-8 w-24" />}
              </div>
              <Heading
                as="p"
                size="sm"
                fontWeight="normal"
                className="text-light-foreground-muted leading-relaxed text-[15px] max-w-2xl mx-auto font-[Outfit]"
              >
                Just share the basics — your idea, your goals, and what makes
                your story stand out. Our AI transforms it into a compelling,
                investor-ready pitch deck.
              </Heading>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Title */}
              <Input
                label="Project Title"
                name="projectTitle"
                placeholder={placeholderTexts.pitch_title}
                helperText={toolTipText.pitch_title}
                required
                value={formData.projectTitle}
                onChange={e => {
                  setFormData(f => ({ ...f, projectTitle: e.target.value }));
                  setTouched(t => ({ ...t, projectTitle: true }));
                }}
                validate={validateProjectTitle}
                setError={setErrors}
                onBlur={() => setTouched(t => ({ ...t, projectTitle: true }))}
                error={errors.projectTitle}
              />

              {/* Story Summary */}
              <Input
                as="textarea"
                label="Story Summary"
                name="storySummary"
                className={`h-23 py-2 overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"}`}
                placeholder={placeholderTexts.pitch_plot}
                helperText={toolTipText.pitch_plot}
                required
                rows={30}
                value={formData.storySummary}
                onChange={e => {
                  setFormData(f => ({ ...f, storySummary: e.target.value }));
                  setTouched(t => ({ ...t, storySummary: true }));
                }}
                validate={validateStorySummary}
                setError={setErrors}
                onBlur={() => setTouched(t => ({ ...t, storySummary: true }))}
                error={errors.storySummary}
              />

              {/* Genres and Themes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Genres */}
                <div
                  onBlur={() =>
                    setTouched(t => ({ ...t, selectedGenres: true }))
                  }
                  tabIndex={0}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-sm font-[Outfit] font-medium dark:text-light-accent-foreground text-dark-accent-foreground">
                      Genres <span className="text-red-400">*</span>
                    </label>

                    {/* Tooltip help icon */}
                    <HelpTooltip text={toolTipText.pitch_genre} />
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pb-1">
                    {genreOptions.map(genre => (
                      <Chip
                        key={genre}
                        selected={formData.selectedGenres.includes(genre)}
                        onClick={() => {
                          handleGenreSelect(genre);
                        }}
                      >
                        {genre}
                      </Chip>
                    ))}
                  </div>

                  {touched.selectedGenres && errors.selectedGenres && (
                    <p className="text-xs text-red-400 mt-1 font-[Outfit]">
                      {errors.selectedGenres}
                    </p>
                  )}
                </div>

                {/* Themes */}
                <div
                  onBlur={() =>
                    setTouched(t => ({ ...t, selectedThemes: true }))
                  }
                  tabIndex={0}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-sm font-[Outfit] font-medium dark:text-light-accent-foreground text-dark-accent-foreground">
                      Themes <span className="text-red-400">*</span>
                    </label>

                    {/* Tooltip help icon */}
                    <HelpTooltip text={toolTipText.pitch_theme} />
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pb-1">
                    {themeOptions.map(theme => (
                      <Chip
                        key={theme}
                        selected={formData.selectedThemes.includes(theme)}
                        onClick={() => {
                          handleThemeSelect(theme);
                        }}
                      >
                        {theme}
                      </Chip>
                    ))}
                  </div>

                  {touched.selectedThemes && errors.selectedThemes && (
                    <p className="text-xs text-red-400 mt-1 font-[Outfit]">
                      {errors.selectedThemes}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className="gap-2 px-4 py-2 dark:disabled:bg-[#2e2e2e] disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <SparkleIcon className="w-5 h-5 fill-light-background-inverse dark:fill-dark-background-inverse" />
                    <span className="text-md font-medium">
                      {isLoading ? 'Generating...' : 'Generate Pitch'}
                    </span>
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="w-full h-full rounded-3xl relative bg-black px-6 pt-1 overflow-y-auto overflow-x-hidden">
          <Loading />
        </div>
      )}
    </div>
  );
}
