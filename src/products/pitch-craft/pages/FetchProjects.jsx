import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { apiRequest } from '@shared/utils/api-client';
import ProjectCard from '@ui/ProjectCard';
import Button from '@ui/Button';
import readBase64Image from '@shared/utils/image-formater';

export default function FetchProjects({
  sortConfig = { sortBy: 'Date Created', sortOrder: 'Newest First' },
  handleSortChange,
  isHomePage = false,
}) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectParams, setProjectParams] = useState({
    search_query: '',
    page: 1,
    limit: 12,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiRequest({
          endpoint: '/get_all_pitches',
          method: 'GET',
          params: {
            search_query: projectParams.search_query,
            page: projectParams.page,
            limit: projectParams.limit,
          },
          successMessage: 'Projects fetched successfully!',
        });
        setProjects(response.response || []);
        setProjectParams(prev => ({
          ...prev,
          total_pages: response.total_pages,
        }));
      } catch (e) {
        console.error(e);
        setProjects([]);
      }
    };
    fetchProjects();
  }, [projectParams.page, projectParams.limit, projectParams.search_query]);

  const handleDelete = async id => {
    console.log(id);
    await apiRequest({
      endpoint: '/delete_pitch',
      method: 'DELETE',
      params: { pitch_id: id },
      successMessage: 'Pitch deleted successfully',
    });
    navigate(0);
  };

  // Sorting logic
  const sortedProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    let sorted = [...projects];

    // Sort by type
    switch (sortConfig.sortBy) {
      case 'Alphabetical':
        sorted.sort((a, b) => {
          const titleA = a.pitch_title?.toLowerCase() || '';
          const titleB = b.pitch_title?.toLowerCase() || '';
          // For alphabetical: "Z-A" = reverse, "A-Z" = normal
          const comparison = titleA.localeCompare(titleB);
          return sortConfig.sortOrder === 'Z-A' ? -comparison : comparison;
        });
        break;

      case 'Date Created':
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || a.updated_at);
          const dateB = new Date(b.created_at || b.updated_at);
          // For dates: "Newest First" = descending, "Oldest First" = ascending
          return sortConfig.sortOrder === 'Newest First'
            ? dateB - dateA
            : dateA - dateB;
        });
        break;

      default:
        break;
    }

    return sorted;
  }, [projects, sortConfig]);

  const handlePageChange = page => {
    setProjectParams(prev => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className={`flex flex-col overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} max-h-full h-full w-auto p-6 sm:p-2 md:p-6 items-center`}>
      <div className="h-full grid 2xl:grid-cols-4 xl:grid-cols-3 lg:gap-10 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2 max-w-400">
        {sortedProjects?.length > 0 &&
          sortedProjects.map(project => (
            <ProjectCard
              key={project.pitch_id}
              projectRoute={'pitch-craft'}
              projectId={project.pitch_id}
              projectTitle={project.pitch_title}
              projectDate={project.updated_at}
              projectImage={readBase64Image(project.pitch_image)}
              handleDelete={handleDelete}
            />
          ))}
      </div>
      {projectParams.total_pages > 1 && !isHomePage && (
        <div className="mt-auto pt-4 pb-2 w-full flex justify-start">
          <div className="flex items-center gap-3">
            <Button
              onClick={() =>
                handlePageChange(Math.max(1, projectParams.page - 1))
              }
              disabled={projectParams.page === 1}
              className="disabled:opacity-50 disabled:cursor-not-allowed px-2 py-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <span className="dark:text-dark-text text-light-text text-base font-medium min-w-[60px] text-center">
              {projectParams.page} of {projectParams.total_pages}
            </span>
            <Button
              onClick={() =>
                handlePageChange(
                  Math.min(projectParams.total_pages, projectParams.page + 1)
                )
              }
              disabled={projectParams.page === projectParams.total_pages}
              className="disabled:opacity-50 disabled:cursor-not-allowed px-2 py-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
