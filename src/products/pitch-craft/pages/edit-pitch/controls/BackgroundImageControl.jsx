import { useCanvasBackground } from '@products/pitch-craft/hooks/useCanvasBackground';
import { useState } from 'react';

export default function BackgroundImageControl() {
  const {
    setBackgroundImage,
    setBackgroundImageFromFile,
    removeBackgroundImage,
  } = useCanvasBackground();

  const [imageUrl, setImageUrl] = useState('');
  const [scaleMode, setScaleMode] = useState('fill');
  const [opacity, setOpacity] = useState(1);

  const handleImageUrlSubmit = e => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setBackgroundImage(imageUrl, { scaleMode, opacity });
    }
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImageFromFile(file, { scaleMode, opacity });
    }
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="font-semibold">Background Image</div>

      {/* Image URL input */}
      <form onSubmit={handleImageUrlSubmit} className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          className="flex-1 px-2 py-1 border rounded text-sm"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Apply
        </button>
      </form>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium mb-1">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Scale mode selection
      <div>
        <label className="block text-sm font-medium mb-1">Scale Mode</label>
        <select
          value={scaleMode}
          onChange={e => setScaleMode(e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm"
        >
          <option value="fill">Fill (may crop)</option>
          <option value="fit">Fit (may have empty space)</option>
          <option value="stretch">Stretch (may distort)</option>
          <option value="center">Center (original size)</option>
        </select>
      </div> */}

      {/* Opacity control */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Opacity: {Math.round(opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={e => setOpacity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Sample images */}
      <div>
        <label className="block text-sm font-medium mb-2">Sample Images</label>
        <div className="grid grid-cols-3 gap-2">
          {sampleImages.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Sample ${idx + 1}`}
              className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setImageUrl(url);
                setBackgroundImage(url, { scaleMode, opacity });
              }}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={removeBackgroundImage}
          className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Remove Image
        </button>
      </div>
    </div>
  );
}

// Combined Background Control Component
export function BackgroundControls() {
  const [activeTab, setActiveTab] = useState('color');

  return (
    <div className="flex flex-col gap-3">
      <div className="font-semibold">Canvas Background</div>

      {/* Tab navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('color')}
          className={`px-3 py-1 text-sm font-medium ${
            activeTab === 'color'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Color
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-3 py-1 text-sm font-medium ${
            activeTab === 'image'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Image
        </button>
      </div>

      {/* Tab content
      <div className="min-h-[200px]">
        {activeTab === 'color' && <BackgroundColorControl />}
        {activeTab === 'image' && <BackgroundImageControl />}
      </div> */}
    </div>
  );
}
