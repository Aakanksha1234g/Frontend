import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import DeleteIcon from '@assets/pitch-craft/Delete.svg';
import { relativeTime } from '@shared/utils/relative-time';
import Button from '@ui/Button';
import PopoverModal from './PopoverModal';

export default function ProjectCard({
  projectRoute,
  projectId,
  projectTitle,
  projectImage,
  projectDate,
  handleDelete,
}) {
  const [relative, setRelative] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    relativeTime.format(projectDate).then(formatted => {
      setRelative(formatted);
    });
  }, [projectDate]);

  return (
    <>
      <div
        key={projectId}
        className="relative rounded-lg max-h-[200px] overflow-hidden border-none cursor-pointer group transition-transform duration-300 ease-in-out transform hover:scale-105"
        onClick={() => navigate(`/${projectRoute}/projects/${projectId}`)}
      >
        {/* Header */}
        <div className="absolute z-20 p-4 top-0 right-0 flex-row justify-end bg-gradient-to-t items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex">
          <Button
            className="p-2 text-tiny bg-black/50 rounded-full"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            variant="tranparent"
          >
            <img src={DeleteIcon} alt="Delete" className="w-4 h-4" />
          </Button>
        </div>

        {/* Background Image */}
        <img
          alt="project-thumbnail"
          className="object-cover w-auto h-auto"
          src={projectImage}
        />

        {/* Footer */}
        <div className="border-none bg-gradient-to-t from-black/70 to-black/0 overflow-hidden absolute bottom-0 w-full transition-opacity duration-300 ease-in-out justify-between z-10 flex px-4 py-2">
          {/* Name */}
          <span className="text-white/90 text-m text-left w-40 truncate">
            {projectTitle}
          </span>

          <p className="text-[10px] sm:text-xs text-white/80">{relative}</p>
        </div>
      </div>

      {/* Modal moved outside the card container */}
      <PopoverModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        message="Are you sure you want to delete this project"
        proceedMsg="Delete"
        cancelMsg="Cancel"
        proceedAction={() => handleDelete(projectId)}
      />
    </>
  );
}
