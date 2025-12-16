// This function returns a human-readable time difference between the current time and the given date.

const FormatDate = dateString => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now - date; // Difference in milliseconds
  const diffSec = Math.floor(diffMs / 1000); // Difference in seconds
  const diffMin = Math.floor(diffSec / 60); // Difference in minutes
  const diffHours = Math.floor(diffMin / 60); // Difference in hours
  const diffDays = Math.floor(diffHours / 24); // Difference in days

  if (diffSec < 60) return `${diffSec} sec ago`; // Less than a minute
  if (diffMin < 60) return `${diffMin} min ago`; // Less than an hour
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`; // Less than a day

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
};
export default FormatDate;
