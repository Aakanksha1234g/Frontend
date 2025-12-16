import React, { useEffect, useState, useRef , useMemo} from 'react';
import { useNavigate } from 'react-router';
import CreateScriptProject from './CreateScript';
import { ProjectCard, ProjectCardSkeleton } from '@shared/ui/no-image-project-card';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import PaginationControls from '@shared/components/PaginationControls';
import ProductHeader from '@shared/layout/product-header';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';

const AllScriptDisplayAndCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
   const productHeaderHeight = useMemo(
      () => (window.innerWidth >= 1920 ? 70 : 64),
      []
    );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [alphabeticalOrder, setAlphabeticalOrder] = useState(false);
  const [dateOrder, setDateOrder] = useState(false);
  const [query, setQuery] = useState('');
  const { setHeaderProps } = useProductHeader();
    const [selectedSortOrder, setSelectedSortOrder] = useState('Date');

  
  const handleCardClick = (scriptId, scene_evaluation) => {
    if (!scriptId) return console.error('Invalid script ID');
    navigate(`${scriptId}/input`);
  };

  const editScriptMutation = useMutation({
    mutationKey: ['editScriptTitle'],
    mutationFn: async ({ story_id, story_title }) =>
      sendData({
        endpoint: `/script_processing/edit_script_title/${story_id}`,
        method: 'PUT',
        body: { script_title: story_title },
        responseMessage: 'Script Title Edited Successfully',
      }),
  });

  const handleEditProject = async (story_id, story_title) => {
    editScriptMutation.mutate({ story_id, story_title }, {
      onSuccess: (response) => {
        if (response?.data?.response === 'Script title updated successfully') {
          queryClient.setQueryData(['scriptWritingProjects', currentPage, pageSize], (oldData) => {
            if (!oldData) return oldData;
            const updatedData = oldData.data.map((project) =>
              project.script_id === story_id
                ? { ...project, script_title, updated_at: new Date().toISOString() }
                : project
            );
            return { ...oldData, data: updatedData };
          });
        }
      },
      onError: error => console.error('Error editing script title:', error),
    });
  };

  const deleteProjectMutation = useMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async (story_id) =>
      sendData({ endpoint: `/script/delete_script/${story_id}`, method: 'DELETE', responseMessage: 'Project Deleted Successfully' }),
  });

  const handleDeleteProject = async (scriptId, onClosePopup) => {
    if (!scriptId) return console.error('No script selected for deletion');
    deleteProjectMutation.mutate(scriptId, {
      onSuccess: (response) => {
        if (response?.data?.response === 'script deleted successfully') {
          onClosePopup?.();
          queryClient.invalidateQueries(['scriptWritingProjects', currentPage, pageSize]);
        }
      },
      onError: error => console.error('Error deleting project:', error),
    });
  };

const [displayedProjects, setDisplayedProjects] = useState([]);
const today = new Date().toISOString().split('T')[0];
const {
  data = { data: [], pagination: {} },
  error,
  isPending,
} = useQuery({
  queryKey: [
    'scriptWritingProjects',
    currentPage,
    pageSize,
    statusFilter,
    alphabeticalOrder,
    dateOrder,
  ],
  queryFn: async () => {
    const response = await fetchData({
      endpoint: `/script/${'SW'}/display_all_scripts?limit=${pageSize}&page_no=${currentPage}&filter=${statusFilter}&sorting_field=${selectedSortOrder}&alphabetical=${alphabeticalOrder}&date_sort=${dateOrder}&end_date=${today}`,
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
const filteredProjects = useMemo(
  () =>
    displayedProjects.filter(({ script_title }) =>
      script_title
        .toString()
        .toLowerCase()
        .includes((query || '').toString().toLowerCase())
    ),
  [displayedProjects, query]
);


  useEffect(() => setCurrentPage(1), [pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= data.pagination?.total_pages) {
      setCurrentPage(newPage);
    }
  };


  const ProjectGrid = useMemo(
    () => (
     
      <div className="mt-[10px] grid sm:gap-[10px] gap-[16px] p-3 grid-cols-1 sm:grid-cols-3 xl:grid-cols-4">
        {filteredProjects.map(project => (
          <div key={project.script_id} className="w-full relative">
            <ProjectCard
              name={project.script_title}
              updatedAt={project.updated_at}
              status={project?.scene_evaluation_status}
              onClick={() =>
                handleCardClick(
                  project.script_id,
                  project.scene_evaluation_status
                )
              }
              onDelete={() => handleDeleteProject(project.script_id)}
              onEdit={newTitle =>
                handleEditProject(project.script_id, newTitle)
              }
            />
          </div>
        ))}
      </div>
    ),
    [filteredProjects, handleCardClick, handleDeleteProject, handleEditProject]
  );

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
      showSort: true,
      showButton: true,
      buttonText: 'New Project',
      onButtonClick: () =>
        {setIsCreateModalOpen(true)}
    });
  }, [
    query,
    statusFilter,
    alphabeticalOrder,
    dateOrder,
    setHeaderProps,
    navigate,
  ]);

  return (
    <div className="flex flex-col  w-full h-full bg-[#0A0A0A]">
      {/* Product Header */}

      {/* Main content */}
      <div className="mt-[10px] flex flex-1 flex-col  w-full responsive-container mx-auto">
        <h4 className="text-[#FCFCFC] text-[16px] font-medium pl-4">
          WELCOME TO SCRIPT WRITING AND ANALYSIS
        </h4>
        {isPending ? (
          <div className="mt-[10px] grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
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
            <div className='h-full'>{ProjectGrid}</div>
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
      <CreateScriptProject
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={async newScript => {
          setIsCreateModalOpen(false);
          await fetchData();
        }}
        moduleType="SW"
      />
    </div>
  );
};

export default AllScriptDisplayAndCreatePage;
