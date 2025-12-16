import React, { useEffect, useRef, useState } from 'react';

export default function AdvancedColorPicker({ value, onChange }) {
  const canvasRef = useRef(null);
  const pickerCircleRef = useRef(null);
  const hueSliderRef = useRef(null);
  const opacitySliderRef = useRef(null);
  const onChangeRef = useRef(onChange);

  const [hue, setHue] = useState(180);
  const [opacity, setOpacity] = useState(1);
  const [rgb, setRgb] = useState({ r: 200, g: 206, b: 209 });
  const [mode, setMode] = useState('Hex');
  const [isDragging, setIsDragging] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const [inputValue, setInputValue] = useState('');
  const isInitializedRef = useRef(false);
  const isUserInteraction = useRef(false);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // --- HELPER FUNCTIONS ---
  function hslToRgb(h, s, l) {
    h = h % 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
      } else if (max === g) {
        h = ((b - r) / delta + 2) * 60;
      } else {
        h = ((r - g) / delta + 4) * 60;
      }
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    const v = max;

    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
      } else if (max === g) {
        h = ((b - r) / delta + 2) * 60;
      } else {
        h = ((r - g) / delta + 4) * 60;
      }
    }

    return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
  }

  const formatColor = (r, g, b, a = opacity) => {
    switch (mode) {
      case 'RGB':
        return `rgba(${r},${g},${b},${a.toFixed(2)})`;
      case 'Hex':
      default:
        const hex = [r, g, b]
          .map(x => Math.round(x).toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();
        const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
        return `#${hex}${alphaHex}`;
    }
  };

  // Parse custom color input
  const parseColorInput = (input) => {
    const trimmed = input.trim();

    // Parse Hex format (#RRGGBB or #RRGGBBAA)
    if (trimmed.startsWith('#')) {
      const hex = trimmed.slice(1);
      if (hex.length === 6 || hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : opacity;

        if (!isNaN(r) && !isNaN(g) && !isNaN(b) && !isNaN(a)) {
          return { r, g, b, a };
        }
      }
    }

    // Parse RGB/RGBA format
    const rgbaMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : opacity;

      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
        return { r, g, b, a };
      }
    }

    return null;
  };

  // --- DRAW CANVAS ---
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    const hueColor = hslToRgb(hue, 100, 50);
    const horiz = ctx.createLinearGradient(0, 0, width, 0);
    horiz.addColorStop(0, 'rgba(255,255,255,1)');
    horiz.addColorStop(1, `rgb(${hueColor.r},${hueColor.g},${hueColor.b})`);
    ctx.fillStyle = horiz;
    ctx.fillRect(0, 0, width, height);

    const vert = ctx.createLinearGradient(0, 0, 0, height);
    vert.addColorStop(0, 'rgba(0,0,0,0)');
    vert.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vert;
    ctx.fillRect(0, 0, width, height);
  };

  // --- PICK COLOR ---
  const handlePick = e => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Scale from display coordinates to canvas coordinates
    x = Math.max(0, Math.min((x / rect.width) * canvas.width, canvas.width - 1));
    y = Math.max(0, Math.min((y / rect.height) * canvas.height, canvas.height - 1));

    setPickerPos({ x, y });

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixel;
    setRgb({ r, g, b });
    const formattedColor = formatColor(r, g, b, opacity);
    setInputValue(formattedColor);
    onChangeRef.current?.(formattedColor);

    const circle = pickerCircleRef.current;
    if (circle) {
      const displayX = (x / canvas.width) * rect.width;
      const displayY = (y / canvas.height) * rect.height;
      circle.style.left = `${displayX}px`;
      circle.style.top = `${displayY}px`;
      circle.classList.remove('hidden');
    }
  };

  const startDrag = e => {
    setIsDragging(true);
    handlePick(e);
  };

  useEffect(() => {
    const move = e => { if (isDragging) handlePick(e); };
    const up = () => setIsDragging(false);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [isDragging, opacity, mode]);

  const handleOpacity = v => {
    const newOpacity = v / 100;
    setOpacity(newOpacity);
    const formattedColor = formatColor(rgb.r, rgb.g, rgb.b, newOpacity);
    setInputValue(formattedColor);
    onChangeRef.current?.(formattedColor);
  };

  // Handle custom color input
  const handleCustomColorInput = (e) => {
    const input = e.target.value;
    setInputValue(input);

    const parsed = parseColorInput(input);
    if (parsed) {
      setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
      setOpacity(parsed.a);
      onChangeRef.current?.(input);
    }
  };

  // --- INITIALIZE PICKER POSITION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const circle = pickerCircleRef.current;
    if (!canvas || !circle) return;

    drawCanvas();

    // Initialize from value prop if provided
    if (value) {
      const parsed = parseColorInput(value);
      if (parsed) {
        setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
        setOpacity(parsed.a);

        // Format the color code properly and set it in input
        const formattedValue = value.startsWith('rgb') ? value : (value.startsWith('#') ? value.toUpperCase() : value);
        setInputValue(formattedValue);

        // Calculate and set the hue from RGB
        const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
        setHue(hsl.h);

        // Redraw canvas with correct hue
        setTimeout(() => {
          drawCanvas();

          // Calculate correct position based on saturation and value (HSV model)
          const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);

          // Map saturation (0-100) to x position (0-canvas.width)
          // Saturation increases from left (white) to right (pure hue color)
          const canvasX = Math.floor((hsv.s / 100) * canvas.width);

          // Map value/brightness (0-100) to y position (inverted)
          // Value decreases from top (bright) to bottom (dark) due to black overlay
          const canvasY = Math.floor(((100 - hsv.v) / 100) * canvas.height);

          setPickerPos({ x: canvasX, y: canvasY });

          const rect = canvas.getBoundingClientRect();
          const displayX = (canvasX / canvas.width) * rect.width;
          const displayY = (canvasY / canvas.height) * rect.height;
          circle.style.left = `${displayX}px`;
          circle.style.top = `${displayY}px`;
          circle.classList.remove('hidden');

          // Mark as initialized after setup is complete
          isInitializedRef.current = true;
        }, 0);
        return;
      }
    }

    // Default initial position (70% width, 50% height)
    const canvasX = Math.floor(canvas.width * 0.7);
    const canvasY = Math.floor(canvas.height * 0.5);
    setPickerPos({ x: canvasX, y: canvasY });

    // Sample color after canvas has been drawn
    requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const [r, g, b] = pixel;
      setRgb({ r, g, b });
      const formattedColor = formatColor(r, g, b, opacity);
      setInputValue(formattedColor);
      // Don't call onChange during initialization

      const rect = canvas.getBoundingClientRect();
      const displayX = (canvasX / canvas.width) * rect.width;
      const displayY = (canvasY / canvas.height) * rect.height;
      circle.style.left = `${displayX}px`;
      circle.style.top = `${displayY}px`;
      circle.classList.remove('hidden');

      // Mark as initialized after setup is complete
      isInitializedRef.current = true;
    });
  }, []);

  // --- UPDATE COLOR WHEN HUE CHANGES ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const circle = pickerCircleRef.current;
    if (!canvas || !circle) return;

    // Redraw canvas with new hue
    drawCanvas();

    // Sample the color at current position
    const ctx = canvas.getContext('2d');
    const x = Math.max(0, Math.min(pickerPos.x, canvas.width - 1));
    const y = Math.max(0, Math.min(pickerPos.y, canvas.height - 1));
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixel;

    setRgb({ r, g, b });
    const formattedColor = formatColor(r, g, b, opacity);
    setInputValue(formattedColor);

    // Call onChange if initialized OR if this is a user interaction
    const shouldCallOnChange = isInitializedRef.current || isUserInteraction.current;
    if (shouldCallOnChange && onChangeRef.current) {
      onChangeRef.current(formattedColor);
    }

    // Reset user interaction flag after handling
    if (isUserInteraction.current) {
      isUserInteraction.current = false;
    }

    const rect = canvas.getBoundingClientRect();
    const displayX = (x / canvas.width) * rect.width;
    const displayY = (y / canvas.height) * rect.height;
    circle.style.left = `${displayX}px`;
    circle.style.top = `${displayY}px`;
  }, [hue]);

  // --- UPDATE COLOR WHEN MODE CHANGES (but not during initialization) ---
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) return;

    const formattedColor = formatColor(rgb.r, rgb.g, rgb.b, opacity);
    setInputValue(formattedColor);
    onChangeRef.current?.(formattedColor);
  }, [mode]);

  // --- ADD SLIDER THUMB STYLES ---
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .color-picker-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        border-radius: 8px;
        outline: none;
      }

      /* WebKit (Chrome, Safari, Edge) - Track */
      .color-picker-slider::-webkit-slider-track {
        width: 100%;
        height: 8px;
        border-radius: 8px;
        cursor: pointer;
      }

      /* WebKit (Chrome, Safari, Edge) - Thumb */
      .color-picker-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: white;
        border: 2px solid #374151;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .color-picker-slider::-webkit-slider-thumb:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      }

      /* Firefox - Track */
      .color-picker-slider::-moz-range-track {
        width: 100%;
        height: 8px;
        border-radius: 8px;
        cursor: pointer;
        border: none;
      }

      /* Firefox - Thumb */
      .color-picker-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: white;
        border: 2px solid #374151;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .color-picker-slider::-moz-range-thumb:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      }

      /* IE/Edge - Track */
      .color-picker-slider::-ms-track {
        width: 100%;
        height: 8px;
        border-radius: 8px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }

      /* IE/Edge - Thumb */
      .color-picker-slider::-ms-thumb {
        width: 16px;
        height: 16px;
        background: white;
        border: 2px solid #374151;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .color-picker-slider::-ms-thumb:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);


  // --- UI ---
  return (
    <div className="bg-white dark:bg-dark-default-main rounded-2xl shadow-lg p-4 w-full max-w-md text-black dark:text-white">
      {/* Canvas */}
      <div className="relative mb-4 w-full h-80">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrag}
          className="w-full h-full rounded-xl cursor-crosshair"
        />
        <div
          ref={pickerCircleRef}
          className="absolute w-5 h-5 rounded-full pointer-events-none shadow-lg hidden"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Hue Slider */}
      <div className="mb-3">
        <input
          ref={hueSliderRef}
          type="range"
          min="0"
          max="359"
          value={hue}
          onChange={e => {
            isUserInteraction.current = true;
            setHue(Number(e.target.value));
          }}
          className="color-picker-slider"
          style={{
            background: `linear-gradient(to right,
        #FF0000 0%,
        #FFFF00 17%,
        #00FF00 33%,
        #00FFFF 50%,
        #0000FF 67%,
        #FF00FF 83%,
        #FF0000 100%)`
          }}
        />
      </div>

      {/* Opacity Slider */}
      <div className="mb-3 flex items-center gap-2">
        <input
          ref={opacitySliderRef}
          type="range"
          min="0"
          max="100"
          value={Math.round(opacity * 100)}
          onChange={e => handleOpacity(Number(e.target.value))}
          className="color-picker-slider w-full h-2 rounded-lg cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0) 0%, rgba(${rgb.r},${rgb.g},${rgb.b},1) 100%)`,
          }}
        />
        <span className="text-sm w-8 text-right">{Math.round(opacity * 100)}%</span>
      </div>

      {/* Mode + Output */}
      <div className="flex items-center gap-2">
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="px-2 py-1 border border-gray-800 rounded-md text-sm"
        >
          <option>Hex</option>
          <option>RGB</option>
        </select>
        <input
          value={inputValue}
          onChange={handleCustomColorInput}
          className="flex-1 px-3 py-1 border border-gray-800 rounded-md text-center text-sm"
          placeholder="Enter color..."
        />
      </div>
    </div>
  );
}
