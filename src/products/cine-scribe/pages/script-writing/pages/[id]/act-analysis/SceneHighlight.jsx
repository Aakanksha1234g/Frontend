import React, { useState } from 'react';

const SceneHighlight = ({ sceneNumber, sceneSummary, scriptId, sceneId }) => {
  const [isHovered, setIsHovered] = useState(false);

  const tooltipStyle = {
    position: 'absolute',
    backgroundColor: 'rgba(249, 250, 251, 1)',
    color: '#333',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '8px',
    zIndex: 1000,
    maxWidth: '500px',
    minWidth: '280px',
    height: '100px',
    top: '28px',
    left: '0',
    boxShadow: 'var(--shadow-shadow-chat-button)',
    fontSize: '0.85rem',
    overflowY: 'auto',
    whiteSpace: 'normal',
    lineHeight: '1.2',
    transition: 'opacity 0.2s ease-in-out',
  };

  return (
    <a
      href={`/cine-scribe/script-writing/${scriptId}/input?sceneNumber=${sceneId}`}
    >
      <span
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ')
            window.location.href = `/cine-scribe/script-writing/${scriptId}/input?sceneNumber=${sceneId}`;
        }}
        style={{
          cursor: 'pointer',
          position: 'relative',
          display: 'inline-block',
          padding: '2px 4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${!isHovered ? 'text-primary' : ''}`}
      >
        {sceneNumber}
        {isHovered && <div style={tooltipStyle}>{sceneSummary}</div>}
      </span>
    </a>
  );
};

export default SceneHighlight;
