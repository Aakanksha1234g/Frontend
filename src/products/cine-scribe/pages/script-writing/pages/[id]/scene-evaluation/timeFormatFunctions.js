const convertTimeToMS = timeString => {
  const parts = timeString.split(':').map(Number);
  const [hh, mm, ss] =
    parts.length === 3 ? parts : [0, parts[0] || 0, parts[1] || 0];
  return (hh * 3600 + mm * 60 + ss) * 1000;
};
const formatMillisecondsToHHMMSS = milliseconds => {
  if (typeof milliseconds !== 'number') {
    // Handle cases where value might be an array for multi-thumb
    milliseconds = Array.isArray(milliseconds) ? milliseconds[0] : milliseconds;
  }
  if (isNaN(milliseconds) || milliseconds < 0) {
    // Default for invalid input
    return '00:00:00';
  }

  let totalSeconds = Math.floor(milliseconds / 1000);
  let hours = Math.floor(totalSeconds / 3600);

  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  const pad = num => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
const formatDuration = durationString => {
  if (!durationString) return 'N/A';

  const parts = durationString.split(':');
  if (parts.length === 2) {
    // Handle MM:SS format
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    return `${minutes}m ${seconds}s`;
  } else if (parts.length === 3) {
    // Handle HH:MM:SS format
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}sec`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}sec`;
    } else {
      return `${seconds}sec`;
    }
  }
  return durationString; // Fallback for unexpected formats
};
const convertTimeToSeconds = timeString => {
  if (!timeString) return 0;

  // Handle raw seconds input
  if (!isNaN(timeString)) return parseInt(timeString);

  // Handle hh:mm:ss or mm:ss format
  const parts = timeString.split(':').reverse();
  return parts.reduce((acc, part, index) => {
    return acc + (parseInt(part) || 0) * Math.pow(60, index);
  }, 0);
};
export {
  convertTimeToMS,
  formatMillisecondsToHHMMSS,
  formatDuration,
  convertTimeToSeconds,
};
