import { Card, CardContent, CardTitle } from './card';
import TrashBin from '@assets/icons/TrashBin.svg';
import { useState, useEffect } from 'react';
import pencil from '@assets/icons/PenNewSquare.svg';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';

export function ProjectCard({
  story_id,
  story_title,
  genres = null,
  created_at,
  updated_at,
  onClick,
  highlightText = '',
  onDelete,
  onEdit,
  className = '',
  isDeleting = false,
}) {
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(story_title);

  function formatRelativeDate(dateString) {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    if (isNaN(inputDate)) return 'Invalid date';

    const diffInMs = currentDate - inputDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return 'Updated just now';
    if (diffInMinutes < 60)
      return diffInMinutes === 1
        ? '1 minute ago'
        : `${diffInMinutes} minutes ago`;
    if (diffInHours < 24)
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    if (diffInDays < 7)
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    if (diffInWeeks < 4)
      return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    if (diffInMonths < 12)
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  }

  const handleEditClick = e => {
    e.stopPropagation();
    setIsEditing(true);
  };

  useEffect(() => {
    setEditedTitle(story_title);
  }, [story_title]);

  const handleSaveEdit = e => {
    e.stopPropagation();
    setIsEditing(false);
    if (editedTitle !== story_title) {
      onEdit(story_id, editedTitle);
    }
  };

  const handleDeleteButton = e => {
    e.stopPropagation();
    setDeletePopupOpen(true);
  };

  return (
    <>
      <Card
        onClick={() => {
          if (!isEditing) onClick();
        }}
        className={`group relative w-full border-primary-gray-100 hover:border-primary-gray-400 max-w-[320px] overflow-hidden bg-white transition-all shadow-lg shadow-shadow-chat-button rounded-2xl cursor-pointer ${className}`}
      >
        <CardContent className="pl-5 py-3">
          <div className="mt-1 w-full flex justify-between items-center">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                onClick={e => e.stopPropagation()}
                onBlur={handleSaveEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveEdit(e);
                }}
                className="text-base border px-2 py-1 rounded-md text-black w-3/4"
                autoFocus
              />
            ) : (
              <CardTitle className="text-base">
                {story_title?.length > 15
                  ? story_title.toUpperCase().slice(0, 15) + '...'
                  : story_title?.toUpperCase()}
              </CardTitle>
            )}

            <div className="flex absolute right-2 gap-2 items-center">
              <IconButtonWithTooltip
                tooltipText="Edit"
                imageUrl={pencil}
                iconButton={false}
                onClick={handleEditClick}
              />
              <IconButtonWithTooltip
                tooltipText="Delete"
                imageUrl={TrashBin}
                iconButton={false}
                onClick={handleDeleteButton}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between items-center">
            {genres ? (
              <p className="w-full text-left text-xs text-muted-foreground">
                {Array.isArray(genres) ? genres.join(', ') : genres}
              </p>
            ) : null}

            <p className="w-full text-left text-xs text-muted-foreground">
              {formatRelativeDate(updated_at)}
            </p>
          </div>

          {highlightText && (
            <div className="absolute bottom-2 right-2 bg-primary-indigo-100 text-xs font-medium px-2 py-0.5 rounded-md text-black">
              {highlightText}
            </div>
          )}
        </CardContent>
      </Card>

      {deletePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
          <div className="bg-primary-gray-50 text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up w-[425px] max-h-[100dvh] overflow-y-auto flex flex-col items-center justify-start gap-4">
            <p className="text-center text-sm text-primary-gray-900">
              Are you sure you want to delete this project?
            </p>
            <div className="mt-2 flex justify-end gap-4">
              <button
                onClick={() => {
                  setDeletePopupOpen(false);
                }}
                className="button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(story_id, () => setDeletePopupOpen(false));
                }}
                className="button-error"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
