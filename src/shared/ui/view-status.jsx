import star from '@assets/icons/Stars.svg';
import StatusBar from './status-bar';
import { useParams } from 'react-router';
import { useState } from 'react';
import ScriptGenerationIcon from '@assets/icons/ScriptGeneration.svg';

export default function ViewStatus({
  webArticlesStatus,
  beatSheetStatus,
  onelinersStatus,
  sceneSynopsisStatus,
  storyChatStatus,
  inputStatus,
  position = 'default',
}) {
  const { id } = useParams();
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setShowStatus(true)}>
      {/* Status Bar Trigger Button */}
      <button className="iconButton relative">
        <img src={ScriptGenerationIcon} alt="Status" className="w-5 h-5" />
      </button>

      {/* Responsive Status Bar Positioning */}
      {showStatus && (
        <div
          className="absolute top-full mt-2 w-max  rounded-lg transition-all duration-300 z-1000
                     left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-0"
          onMouseLeave={() => setShowStatus(false)}
        >
          <StatusBar
            statusList={[
              {
                name: 'Story Details',
                activeStatus: inputStatus,
                redirectedPath: `/cine-scribe/story-generation/${id}/story-details`,
              },
              {
                name: 'Web Articles',
                activeStatus: webArticlesStatus,
                redirectedPath: `/cine-scribe/story-generation/${id}/web-articles`,
              },
              {
                name: 'Story Idea',
                activeStatus: storyChatStatus,
                redirectedPath: `/cine-scribe/story-generation/${id}/chat`,
              },
              {
                name: 'Beat Sheet',
                activeStatus: beatSheetStatus,
                redirectedPath: `/cine-scribe/story-generation/${id}/beat-sheet`,
              },
              {
                name: 'Oneliners',
                activeStatus: onelinersStatus,
                redirectedPath: `/cine-scribe/story-generation/${id}/one-liners`,
              },
              {
                name: 'Script',
                activeStatus: sceneSynopsisStatus,
                redirectedPath: `/cine-scribe/story-generation/${id}/script`,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
