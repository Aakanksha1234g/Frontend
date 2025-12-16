import { useNavigate, useLocation } from 'react-router';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendData, fetchData } from '@api/apiMethods';
import { ProjectCard } from '@shared/ui/no-image-project-card';
import PaginationControls from '@shared/components/PaginationControls';
import ProjectsStoryGenerationLoading from './loading';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';



export default function SmartScriptProjectsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setHeaderProps } = useProductHeader();
  // --- State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [alphabeticalOrder, setAlphabeticalOrder] = useState(false);
  const [dateOrder, setDateOrder] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState(null);
  const [selectedSortOrder, setSelectedSortOrder] = useState('Date');
  // --- ProductHeader context ---
   useEffect(() => {
     setHeaderProps({
       query,
       onQueryChange: e => setQuery(e.target.value),
       statusFilter,
       onStatusFilterChange: val => {
         setStatusFilter(val);
         setCurrentPage(1);
       },
       selectedSortOrder,
       onSortOrderChange: val => {
         setSelectedSortOrder(val);
         setCurrentPage(1);
       },
       alphabeticalOrder,
       onAlphabeticalOrderChange: val => {
         setAlphabeticalOrder(val);
         setCurrentPage(1);
       },
       dateOrder,
       onDateOrderChange: val => {
         setDateOrder(val);
         setCurrentPage(1);
       },
       showSearch: true,
       showFilter: true,
       showSGFilter: true,
       showSort: true,
       showButton: true,
       buttonText: 'New Project',
       onButtonClick: () =>
         navigate('/cine-scribe/story-generation/add-project'),
     });
     return () => setHeaderProps({});
   }, [
     query,
     statusFilter,
     alphabeticalOrder,
     dateOrder,
     setHeaderProps,
     navigate,
   ]);




  const pageSize = window.innerWidth >= 1920 ? 24 : 20;
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const today = new Date().toISOString().split('T')[0];


  // --- Queries ---
  const {
    data = { data: [], pagination: {} },
    error,
    isPending,
  } = useQuery({
    queryKey: [
      'storyGenerationProjects',
      currentPage,
      pageSize,
      statusFilter,
      alphabeticalOrder,
      dateOrder,
    ],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_all_stories?page_num=${currentPage}&page_size=${pageSize}&filter=${statusFilter}&sorting_field=${selectedSortOrder}&alphabetical=${alphabeticalOrder}&date_sort=${dateOrder}&end_date=${today}`,
        method: 'GET',
      });
      return response.data.response;
    },
    keepPreviousData: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
      // When filter/sort changes, clear projects immediately
      setDisplayedProjects([]);
  
      // Reset to first page
      setCurrentPage(1);
    }, [statusFilter, alphabeticalOrder, dateOrder]);
  useEffect(() => {
    if (!isPending && data?.data) {
      setDisplayedProjects(data.data);
    }
  }, [data, isPending]);

  const projects = data.data || [];
  const pagination = {
    currentPage: data.pagination?.current_page || 1,
    totalPages: data.pagination?.total_pages || 1,
    totalCount: data.pagination?.total_count || 0,
  };

  // --- Memoized derived data ---


  const filteredProjects = useMemo(
    () =>
      displayedProjects.filter(({ story_title }) =>
        story_title
          .toString()
          .toLowerCase()
          .includes((query || '').toString().toLowerCase())
      ),
    [displayedProjects, query]
  );


  // --- Handlers ---
  const handleProjectClick = useCallback(
    (projectId, chatStatus) => {
      navigate(
       
          `/cine-scribe/story-generation/${projectId}/story-details/`
      );
    },
    [navigate]
  );



  const deleteProjectMutation = useMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async story_id =>
      sendData({
        endpoint: `/story/delete_story/${story_id}`,
        method: 'DELETE',
        responseMessage: 'Project Deleted Successfully',
      }),
  });

  const handleDeleteProject = useCallback(
    async story_id => {
      setDeletingStoryId(story_id);
      deleteProjectMutation.mutate(story_id, {
        onSuccess: response => {
          if (response?.data?.response === 'Story Deleted Successfully') {
            queryClient.invalidateQueries(['storyGenerationProjects']);
          }
        },
        onError: error => {
          console.error('Error deleting the story:', error);
          alert(
            error?.response?.status === 500
              ? 'Internal Server Error. Please try again later.'
              : 'Something went wrong while deleting the story.'
          );
        },
        onSettled: () => setDeletingStoryId(null),
      });
    },
    [deleteProjectMutation, queryClient]
  );

  const editProjectMutation = useMutation({
    mutationKey: ['editProjectTitle'],
    mutationFn: async ({ story_id, story_title }) =>
      sendData({
        endpoint: `/story/edit_story_title`,
        method: 'PUT',
        body: { story_id, story_title },
        responseMessage: 'Project Title Edited Successfully',
      }),
  });

  const handleEditProject = useCallback(
    (story_id, story_title) => {
      editProjectMutation.mutate(
        { story_id, story_title },
        {
          onSuccess: response => {
            if (
              response?.data?.response === 'Story title updated successfully'
            ) {
              queryClient.invalidateQueries(['storyGenerationProjects']);
            }
          },
          onError: error => {
            console.error('Error editing project:', error);
          },
        }
      );
    },
    [editProjectMutation, queryClient]
  );

  const handlePageChange = useCallback(
    newPage => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        setCurrentPage(newPage);
        navigate(`${pathname}?page_num=${newPage}&page_size=${pageSize}`, {
          scroll: false,
        });
      }
    },
    [pagination.totalPages, navigate, pathname, pageSize]
  );

  // --- Memoized Project Grid ---
  const ProjectGrid = useMemo(
    () => (
      <div className="mt-[10px] grid sm:gap-[10px] gap-[16px] p-3 grid-cols-1 sm:grid-cols-3 xl:grid-cols-4">
        {filteredProjects.map(project => (
          <div key={project.story_id} className="w-full relative">
            <ProjectCard
              name={project.story_title}
              updatedAt={project.updated_at}
              status={project.story_chat_status}
              onClick={() =>
                handleProjectClick(project.story_id, project.story_chat_status)
              }
              onDelete={() => handleDeleteProject(project.story_id)}
              onEdit={newTitle => handleEditProject(project.story_id, newTitle)}
              showSGStatus={true}
            />
          </div>
        ))}
      </div>
    ),
    [
      filteredProjects,
      handleProjectClick,
      handleDeleteProject,
      handleEditProject,
    ]
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] overflow-y-auto">
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto">
        <h4 className="text-[#FCFCFC] text-[16px] font-medium pl-4">
          WELCOME TO STORY GENERATION
        </h4>
        {isPending ? (
          <div className="mt-[10px] flex flex-1 flex-col w-full max-w-[1028px] xl1440:max-w-[1028px] xl1920:max-w-[1128px] mx-auto py-4">
            <ProjectsStoryGenerationLoading />
          </div>
        ) : error ? (
          <div className="w-full flex-1 mx-auto flex flex-col gap-10 items-center justify-center bg-primary-gray-100">
            <p className="text-red-500">Failed to load projects.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">
            No projects available.
          </p>
        ) : (
          <>
            <div className="h-full">{ProjectGrid}</div>
            {pagination.totalPages >= 1 && (
              <div className="w-full flex justify-center py-3 bg-[#0A0A0A] border-t border-[#1E1E1E] sticky bottom-0">
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
