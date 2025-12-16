import React, { useState } from 'react';

const EffectsPanel = () => {
  const [activeTab, setActiveTab] = useState('Effects');
  const [selectedColorMode, setSelectedColorMode] = useState('fill'); // 'fill', 'stroke', 'gradient', 'remove'
  const [fillColor, setFillColor] = useState({ r: 0, g: 195, b: 255, a: 1 });
  const [strokeColor, setStrokeColor] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });
  const [gradientStart, setGradientStart] = useState({
    r: 0,
    g: 149,
    b: 255,
    a: 1,
  });
  const [gradientEnd, setGradientEnd] = useState({
    r: 0,
    g: 255,
    b: 157,
    a: 1,
  });

  const [effects, setEffects] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    fade: 0,
    vignette: 0,
  });

  const handleEffectChange = (effect, value) => {
    setEffects(prev => ({ ...prev, [effect]: value }));
  };

  const resetEffects = () => {
    setEffects({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      fade: 0,
      vignette: 0,
    });
  };

  const handleColorSelect = mode => {
    setSelectedColorMode(mode);
  };

  const EffectSlider = ({ label, value, onChange, min = -100, max = 100 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const percentage = ((value - min) / (max - min)) * 100;

    const handleMouseDown = e => {
      setIsDragging(true);
      handleSliderChange(e);
    };

    const handleSliderChange = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const newValue = min + (x / rect.width) * (max - min);
      onChange(Math.round(newValue));
    };

    const handleMouseMove = e => {
      if (isDragging) {
        handleSliderChange(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging]);

    return (
      <div className="mb-4 text-white">
        {/* Label + Value on one line */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm w-8 text-right">{value}</span>
        </div>

        {/* Slider below */}
        <div
          className="relative w-full h-1 bg-gray-600 rounded-full cursor-pointer select-none"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute top-2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 cursor-grab shadow-lg border-2 border-gray-300 pointer-events-none"
            style={{
              left: `${percentage}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>
    );
  };

  const SpectrumColorPicker = ({ color, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null); // 'spectrum', 'hue', 'alpha'
    const [spectrumPosition, setSpectrumPosition] = useState({ x: 50, y: 50 });
    const [huePosition, setHuePosition] = useState(0);

    // Convert RGB to HSL to get current positions
    const rgbToHsl = (r, g, b) => {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    };

    // Convert RGB to Hex
    const rgbToHex = (r, g, b) => {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    // Predefined color palette
    const colorPalette = [
      '#8B4513',
      '#20B2AA',
      '#DAA520',
      '#FF8C00',
      '#FF6347',
      '#DC143C',
      '#1E3A8A',
      '#1E40AF',
      '#0EA5E9',
      '#06B6D4',
      '#67E8F9',
      '#A7F3D0',
    ];

    // Update positions when color changes externally
    React.useEffect(() => {
      const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
      setHuePosition((h / 360) * 100);
      setSpectrumPosition({ x: s, y: 100 - l });
    }, [color.r, color.g, color.b]);

    const hslToRgb = (h, s, l) => {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
      const m = l - c / 2;
      let r, g, b;
      if (h < 1 / 6) [r, g, b] = [c, x, 0];
      else if (h < 2 / 6) [r, g, b] = [x, c, 0];
      else if (h < 3 / 6) [r, g, b] = [0, c, x];
      else if (h < 4 / 6) [r, g, b] = [0, x, c];
      else if (h < 5 / 6) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      };
    };

    const handleSpectrumInteraction = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const saturation = (x / rect.width) * 100;
      const lightness = 100 - (y / rect.height) * 100;
      setSpectrumPosition({ x: saturation, y: (y / rect.height) * 100 });

      const h = huePosition / 100;
      const s = saturation / 100;
      const l = lightness / 100;
      onChange({ ...color, ...hslToRgb(h, s, l) });
    };

    const handleHueInteraction = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const newHue = (x / rect.width) * 100;
      setHuePosition(newHue);

      const [, s, l] = rgbToHsl(color.r, color.g, color.b);
      onChange({ ...color, ...hslToRgb(newHue / 100, s / 100, l / 100) });
    };

    const handleAlphaInteraction = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const alpha = x / rect.width;
      onChange({ ...color, a: Math.max(0, Math.min(1, alpha)) });
    };

    const handleMouseDown = (e, type) => {
      setIsDragging(true);
      setDragType(type);
      if (type === 'spectrum') handleSpectrumInteraction(e);
      else if (type === 'hue') handleHueInteraction(e);
      else if (type === 'alpha') handleAlphaInteraction(e);
    };

    const handleMouseMove = e => {
      if (!isDragging || !dragType) return;
      if (dragType === 'spectrum') handleSpectrumInteraction(e);
      else if (dragType === 'hue') handleHueInteraction(e);
      else if (dragType === 'alpha') handleAlphaInteraction(e);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, dragType]);

    const handleColorPaletteClick = hexColor => {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      onChange({ ...color, r, g, b });
      const [h, s, l] = rgbToHsl(r, g, b);
      setHuePosition((h / 360) * 100);
      setSpectrumPosition({ x: s, y: 100 - l });
    };

    return (
      <div className="my-2 p-2 bg-gray-800 rounded-lg space-y-4">
        {/* Spectrum */}
        <div
          className="w-full h-20 rounded-lg cursor-crosshair relative overflow-hidden select-none"
          style={{
            background: `
              linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%),
              linear-gradient(to right, rgba(255,255,255,1), hsl(${huePosition * 3.6}, 100%, 50%))
            `,
          }}
          onMouseDown={e => handleMouseDown(e, 'spectrum')}
        >
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg pointer-events-none"
            style={{
              left: `${spectrumPosition.x}%`,
              top: `${spectrumPosition.y}%`,
            }}
          />
        </div>

        {/* Hue Slider */}
        <div
          className="w-full h-4 rounded-lg cursor-pointer relative select-none"
          style={{
            background:
              'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
          onMouseDown={e => handleMouseDown(e, 'hue')}
        >
          <div
            className="absolute w-3 h-6 bg-white border border-gray-300 rounded-sm transform -translate-x-1/2 -translate-y-1/2 shadow-md pointer-events-none"
            style={{ left: `${huePosition}%`, top: '50%' }}
          />
        </div>

        {/* Alpha Slider */}
        <div
          className="w-full h-4 rounded-lg cursor-pointer relative select-none"
          style={{
            background: `
              linear-gradient(to right, 
                rgba(${color.r}, ${color.g}, ${color.b}, 0) 0%, 
                rgba(${color.r}, ${color.g}, ${color.b}, 1) 100%
              ),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M4 0h4v4H4V0zM0 4h4v4H0V4z' fill='%23ddd'/%3E%3C/svg%3E")
            `,
            backgroundSize: '8px 8px, 8px 8px',
          }}
          onMouseDown={e => handleMouseDown(e, 'alpha')}
        >
          <div
            className="absolute w-3 h-6 bg-white border border-gray-300 rounded-sm transform -translate-x-1/2 -translate-y-1/2 shadow-md pointer-events-none"
            style={{ left: `${color.a * 100}%`, top: '50%' }}
          />
        </div>

        {/* Current Color */}
        <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-1.5">
          <div
            className="w-8 h-8 rounded-lg border-2 border-gray-500"
            style={{
              backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M4 0h4v4H4V0zM0 4h4v4H0V4z' fill='%23999'/%3E%3C/svg%3E")`,
              backgroundSize: '8px 8px',
            }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={rgbToHex(color.r, color.g, color.b)}
              className="w-full bg-gray-600 text-white px-3 h-8 rounded text-sm font-mono"
            />
          </div>
        </div>

        {/* Palette */}
        {/* <div className="grid grid-cols-6 gap-2">
          {colorPalette.map((hexColor, index) => (
            <button
              key={index}
              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white transition-colors"
              style={{ backgroundColor: hexColor }}
              onClick={() => handleColorPaletteClick(hexColor)}
            />
          ))}
        </div> */}
      </div>
    );
  };

  const getCurrentColor = () => {
    switch (selectedColorMode) {
      case 'fill':
        return fillColor;
      case 'stroke':
        return strokeColor;
      case 'gradient':
        return gradientStart;
      default:
        return fillColor;
    }
  };

  const setCurrentColor = color => {
    switch (selectedColorMode) {
      case 'fill':
        setFillColor(color);
        break;
      case 'stroke':
        setStrokeColor(color);
        break;
      case 'gradient':
        setGradientStart(color);
        break;
    }
  };

  return (
    <div className="bg-[#111111] flex flex-col gap-4 p-2">
      {/* Color Selection */}
      <div className="px-6 mb-3 flex-shrink-0">
        <div className="flex justify-center items-center mb-2 relative w-full h-20">
          {/* Stroke (top-left) */}
          <div
            className={`absolute w-14 h-14 cursor-pointer transition-all duration-200`}
            style={{
              border: `6px solid rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b}, ${strokeColor.a})`,
              backgroundColor: 'transparent',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transform:
                selectedColorMode === 'stroke'
                  ? 'translate(0,0) scale(1.1)'
                  : 'translate(10px,10px) scale(1)', // 👈 moved to bottom-right when inactive
              zIndex: selectedColorMode === 'stroke' ? 20 : 10,
            }}
            onClick={() => handleColorSelect('stroke')}
          />

          {/* Fill (bottom-right) */}
          <div
            className={`absolute w-14 h-14 shadow-xl cursor-pointer transition-all duration-200`}
            style={{
              backgroundColor: `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${fillColor.a})`,
              transform:
                selectedColorMode === 'fill'
                  ? 'translate(0,0) scale(1.1)'
                  : 'translate(-10px,-10px) scale(1)', // 👈 moved to top-left when inactive
              zIndex: selectedColorMode === 'fill' ? 20 : 10,
            }}
            onClick={() => handleColorSelect('fill')}
          />
        </div>

        {/* Mode Buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleColorSelect('fill')}
            className={`w-7 h-7 rounded-lg border-2 transition-all ${
              selectedColorMode === 'fill'
                ? 'border-white scale-110'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{
              backgroundColor: `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${fillColor.a})`,
            }}
          />
          <button
            onClick={() => handleColorSelect('gradient')}
            className={`w-7 h-7 rounded-lg border-2 transition-all ${
              selectedColorMode === 'gradient'
                ? 'border-white scale-110'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{
              background: `linear-gradient(90deg, rgba(${gradientStart.r}, ${gradientStart.g}, ${gradientStart.b}, ${gradientStart.a}) 0%, rgba(${gradientEnd.r}, ${gradientEnd.g}, ${gradientEnd.b}, ${gradientEnd.a}) 100%)`,
            }}
          />
          <button
            onClick={() => handleColorSelect('remove')}
            className={`w-7 h-7 rounded-lg border-2 transition-all ${
              selectedColorMode === 'remove'
                ? 'border-white scale-110'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M5 0h5v5H5V0zM0 5h5v5H0V5z' fill='%23666'/%3E%3Cpath d='M10 0v10L0 0h10z' stroke='%23f00' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: '10px 10px',
            }}
          />
        </div>

        {/* {selectedColorMode !== 'remove' && (
          <SpectrumColorPicker
            color={getCurrentColor()}
            onChange={setCurrentColor}
          />
        )} */}
      </div>

      {/* Effects */}
      <div className="flex-1 px-6 pb-1 min-h-0">
        <div className="space-y-4">
          <EffectSlider
            label="Brightness"
            value={effects.brightness}
            onChange={value => handleEffectChange('brightness', value)}
          />
          <EffectSlider
            label="Contrast"
            value={effects.contrast}
            onChange={value => handleEffectChange('contrast', value)}
          />
          <EffectSlider
            label="Saturation"
            value={effects.saturation}
            onChange={value => handleEffectChange('saturation', value)}
          />
          <EffectSlider
            label="Hue"
            value={effects.hue}
            onChange={value => handleEffectChange('hue', value)}
          />
          <EffectSlider
            label="Fade"
            value={effects.fade}
            onChange={value => handleEffectChange('fade', value)}
            min={0}
          />
          <EffectSlider
            label="Vignette"
            value={effects.vignette}
            onChange={value => handleEffectChange('vignette', value)}
            min={0}
          />
        </div>

        <div className="flex justify-center mt-5 pb-4">
          <button
            onClick={resetEffects}
            className="bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
          >
            Reset all
          </button>
        </div>
      </div>
    </div>
  );
};

export default EffectsPanel;
