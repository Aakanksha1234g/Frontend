import { useLocation, useParams, useNavigate, useBlocker } from 'react-router';
import CharacterConsistencyForm from './CharacterConsistencyForm';
import { apiRequest } from '@shared/utils/api-client';
import { useState, useEffect } from 'react';
import UnsavedChangesModal from '@shared/unSavedChangesModal';

/**
 * CharacterConsistencyPage serves as the review and edit screen for
 * character consistency across different time periods.
 *
 * After confirming the data, users can trigger the sketch generation process.
 */
const CharacterConsistencyPage = () => {
  const { script_id } = useParams();
  const location = useLocation();
  const { shotCount, scenes, char_data } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [fetchedCharData, setFetchedCharData] = useState(null);

  const navigate = useNavigate();
  const blocker = useBlocker(true); // Prevents navigation with unsaved changes

  /**
   * Prepares character and scene data, then sends it to the backend
   * to generate storyboards (sketches). Navigates to sketch page on success.
   */
  const handleGenerateStoryBoard = async () => {
    setLoading(true);
    try {
      console.log('scenes:', scenes);
      console.log('shotCount:', shotCount);

      if (!scenes || !shotCount) {
        throw new Error('Scenes or shotCount missing');
      }

      // Prepare scene-level inputs including shot count and time period
      const scene_inputs = scenes.map((scene, index) => ({
        scene_data_id: scene.scene_data_id,
        scene_sequence_no: scene.scene_sequence_no,
        scene_time_period: scene.scene_key_elements?.time_period || 'present',
        shot_count: shotCount[index]?.shot_count || 5,
      }));

      const normalizeCharData = (charArray) => {
        return charArray?.reduce((acc, charObj) => {
          const [charName, charDetails] = Object.entries(charObj)[0];
          acc[charName] = {
            ...charDetails,
            time_period: charDetails.time_period || {},
          };
          return acc;
        }, {}) || {};
      };

      const payload = {
        script_id: script_id,
        scene_inputs,
        char_data: normalizeCharData(char_data),
      };

      console.log('payload: ', payload);

      // Send data to backend to generate sketches
      const response = await apiRequest({
        endpoint: `/generate_sketches`,
        method: 'POST',
        body: payload,
      });

      // Prevent back navigation to previous state
      window.history.pushState(null, '', window.location.href);

      // Redirect to the shots preview page
      navigate(`/cine-sketch/shots/${response.sketch_id}`, { replace: true });
    } catch (error) {
      // Handle silently (or add toast/log if desired)
    } finally {
      setLoading(false);
    }
  };

  const normalizeCharData = (charArray) => {
    const normalized = {};
    charArray?.forEach(charObj => {
      const [charName, charDetails] = Object.entries(charObj)[0];
      normalized[charName] = {
        ...charDetails,
        time_period: charDetails.time_period || {},
      };
    });
    return normalized;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Character editing form */}
      <CharacterConsistencyForm initialCharData={normalizeCharData(char_data)} />

      {/* Modal that blocks navigation if changes are unsaved */}
      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        blocker={blocker}
      />

      {/* Footer button to trigger sketch generation */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleGenerateStoryBoard}
          disabled={loading}
          className="px-3 py-2 border border-gray-300 text-sm font-medium text-white rounded-md bg-primary-blue-100 hover:bg-sky-600 cursor-pointer"
        >
          {loading ? 'Generating...' : 'Generate Story Board'}
        </button>
      </div>
    </div>
  );
};

export default CharacterConsistencyPage;
