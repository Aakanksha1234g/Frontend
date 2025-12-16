import React from 'react';
import folder from '@assets/icons/Folder.svg';
import ProjectFileDropDown from '@shared/layout/project-file-drop-down';
import { StatusCircle } from '@shared/layout/icons';
import Textarea from './textarea';

export function ProjectCard({
  name,
  updatedAt,
  status,
  onClick,
  onDelete,
  onEdit,
  showSGStatus = false,
}) {
  const formatRelativeDate = dateString => {
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
  };

  const handleDropdownClick = e => {
    e.stopPropagation();
  };

  const [editing, setEditing] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(name);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setDraftTitle(name);
  }, [name]);

  function startEditing(e) {
    e.stopPropagation();
    setEditing(true);
    setError('');
  }

  function saveEdit(e) {
    e.stopPropagation();

    const wordCount = draftTitle.trim().split(/\s+/).length;
    if (wordCount > 10) {
      setError('Title cannot exceed 10 words.');
      return;
    }

    setEditing(false);
    setError('');

    if (draftTitle.trim() !== '' && draftTitle !== name) {
      onEdit(draftTitle);
    } else {
      setDraftTitle(name);
    }
  }

  return (
    <div
      onClick={!editing ? onClick : undefined} // disable click while editing
      className={`h-[116px] rounded-[16px] bg-default-200 overflow-hidden flex flex-col p-1 pl-1.5 lg:pl-2.5 
    ${editing ? 'cursor-default' : 'cursor-pointer '}`}
    >
      <div className="w-full flex items-center justify-between text-sm">
        {status !== undefined && (
          <span className="flex items-center gap-1 text-[10px] text-[#FCFCFC] font-extralight tracking-[-0.02em] leading-[19.6px]">
            <StatusCircle color={status ? '#4ADE80' : '#175CD3'} />
            {showSGStatus
              ? status
                ? 'Generated'
                : 'Saved'
              : status
                ? 'Analyzed'
                : 'Saved'}
          </span>
        )}

        <div onClick={handleDropdownClick}>
          <ProjectFileDropDown
          
            onEditRequest={() => setEditing(true)}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="h-full w-full border-t border-default-300 flex  gap-[10px] sm:gap-[5px] p-[10px] sm:p-[5px] text-sm font-semibold">
        <div className='w-1/3 h-full'>
          <img src={folder} alt="Folder Icon " className='h-full'/>
        </div>
        <div className="flex flex-col items-start justify-center gap-1 text-sm w-2/3">
          {editing ? (
            <>
              <input
                type="text"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEdit(e);
                  if (e.key === 'Escape') {
                    setEditing(false);
                    setDraftTitle(name);
                    setError('');
                  }
                }}
                autoFocus
                aria-label="Edit project title"
                className="w-[140px] border-2 border-white/10 rounded-md py-1 px-2 text-sm text-[#FCFCFC] bg-[#171717] outline-none transition-all duration-150 focus:border-white/20 focus:ring-2 focus:ring-white/20 placeholder:text-white/30"
                placeholder="Enter title..."
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </>
          ) : (
            <p className="font-medium text-[12px] lg:text-sm text-[#FCFCFC]">
              {name?.length > 12
                ? name.toUpperCase().slice(0, 12) + '...'
                : name?.toUpperCase()}
            </p>
          )}
          <p className=" text-[10px] lg:text-xs text-[#A3A3A3] font-light">
            {formatRelativeDate(updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------- Skeleton Loader ----------------
export function ProjectCardSkeleton() {
  return (
    <div className="h-[116px] rounded-[16px] bg-[#1C1C1C] animate-pulse overflow-hidden flex flex-col p-1 pl-2.5">
      {/* Top section skeleton */}
      <div className="flex-1 flex items-center justify-between text-sm">
        <div className="w-12 h-3 bg-[#3C3C3C] rounded-full"></div>
        <div className="w-6 h-3 bg-[#3C3C3C] rounded-full"></div>
      </div>

      {/* Bottom section skeleton */}
      <div className="h-[72px] w-full border-t border-[#2A2A2A] flex items-start justify-start gap-[10px] p-[10px] text-lg font-semibold">
        <div className="w-[72px] h-[52px] bg-[#3C3C3C] rounded"></div>
        <div className="flex flex-col items-start justify-center gap-1 w-full">
          <div className="w-3/4 h-4 bg-[#3C3C3C] rounded"></div>
          <div className="w-1/2 h-3 bg-[#3C3C3C] rounded"></div>
        </div>
      </div>
    </div>
  );
}
