import { memo } from 'react';
import SceneHighlight from './SceneHighlight';
const SceneTextWrapper = memo(({ text, scenes, scriptId }) => {
  const sceneRegex = /Scene\s(\d+)/g;
  const parts = [];
  let lastIndex = 0;

  // Ensure text is a string before calling matchAll
  if (typeof text !== 'string') {
    return null; // or return a fallback UI
  }

  const matches = [...text.matchAll(sceneRegex)];

  matches.forEach(match => {
    const [fullMatch, sceneNumber] = match;
    const index = match.index;

    parts.push(text.slice(lastIndex, index));

    const scene = scenes.find(
      s => s.scene_sequence_no === parseInt(sceneNumber)
    );
    const sceneSummary = scene?.scene_summary || 'No summary available';
    const sceneId = scene?.scene_data_id || 'No ID available';

    parts.push(
      <SceneHighlight
        key={`scene-${sceneNumber}-${index}`}
        sceneNumber={fullMatch}
        sceneSummary={sceneSummary}
        scriptId={scriptId}
        sceneId={sceneId}
      />
    );

    lastIndex = index + fullMatch.length;
  });

  parts.push(text.slice(lastIndex));

  return <>{parts}</>;
});

export default SceneTextWrapper;
