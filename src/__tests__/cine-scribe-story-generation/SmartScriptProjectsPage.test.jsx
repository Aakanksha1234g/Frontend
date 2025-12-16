// src/__tests__/SmartScriptProjectsPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SmartScriptProjectsPage from '../../products/cine-scribe/pages/story-generation/pages/projects-page';
import { useNavigate, useLocation } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';

// --- Mock external modules ---
vi.mock('@shared/ui/no-image-project-card', () => ({
  ProjectCard: ({ name, updatedAt, status, onClick, onDelete, onEdit, showSGStatus }) => (
    <div data-testid="project-card">
      <p>{name}</p>
      <p data-testid="updated-at">{updatedAt?.toString()}</p>
     
      <p data-testid="show-sg-status">{status === true ? 'Generated' : 'Saved'}</p>
      <button data-testid="edit-btn" onClick={() => onEdit('New Title')}>Edit</button>
      <button data-testid="delete-btn" onClick={onDelete}>Delete</button>
      <button data-testid="click-btn" onClick={onClick}>Click</button>
    </div>
  ),
}));

// --- Correct @tanstack/react-query mock ---
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});



vi.mock('@shared/components/PaginationControls', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange }) => (
    <div data-testid="pagination-controls">
      {Array.from({ length: pagination.totalPages }).map((_, idx) => (
        <button
          key={idx}
          data-testid={`page-btn-${idx + 1}`}
          onClick={() => onPageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  ),
}));

vi.mock(
  '../../products/cine-scribe/pages/story-generation/pages/projects-page/loading',
  () => ({
    __esModule: true,
    default: () => <div data-testid="loading-component">Loading...</div>,
  })
);

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

vi.mock('@products/cine-scribe/contexts/ProductHeaderContext', () => ({
  useProductHeader: () => ({ setHeaderProps: vi.fn() }),
}));

// --- Mock data ---
const mockProjects = [
  {
    story_id: 1,
    story_title: 'Project 1',
    updated_at: '2025-10-19T10:00:00Z',
    story_chat_status: false,
  },
  {
    story_id: 2,
    story_title: 'Project 2',
    updated_at: '2025-10-18T15:00:00Z',
    story_chat_status: true,
  },
];

// --- Helpers to mock queries/mutations ---

const mockQuery = (projects = mockProjects, isPending = false, error = null, totalPages = 2) => {
  useQuery.mockReturnValue({
    data: {
      data: projects,
      pagination: {
        current_page: 1,
        total_pages: totalPages,
        total_count: projects.length,
      },
    },
    isPending,
    error,
  });
};

const mockMutation = (mutateMock = vi.fn()) => {
  useMutation.mockReturnValue({ mutate: mutateMock });
};


describe('SmartScriptProjectsPage', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(navigateMock);
    useLocation.mockReturnValue({ pathname: '/cine-scribe/story-generation' });
  });

  it('renders loading component when query is pending', async () => {
    mockQuery([], true);
    render(<SmartScriptProjectsPage />);
    expect(await screen.findByTestId('loading-component')).toBeInTheDocument();
  });

  it('renders project cards with correct props', async () => {
    mockQuery();
    render(<SmartScriptProjectsPage />);
    const cards = await screen.findAllByTestId('project-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
   const statuses = screen.getAllByTestId('show-sg-status');
   expect(statuses).toHaveLength(2);
   expect(statuses[0].textContent).toBe('Saved');
   expect(statuses[1].textContent).toBe('Generated');
  });

  it('handles project card click and navigates', async () => {
    mockQuery();
    render(<SmartScriptProjectsPage />);
    const clickBtn = screen.getAllByTestId('click-btn')[0];
    fireEvent.click(clickBtn);
    expect(navigateMock).toHaveBeenCalledWith('/cine-scribe/story-generation/1/story-details/');
  });

  it('calls editProject mutation when edit button clicked', async () => {
    const mutateMock = vi.fn();
    mockMutation(mutateMock);

    mockQuery();
    render(<SmartScriptProjectsPage />);
    const editBtn = screen.getAllByTestId('edit-btn')[0];
    fireEvent.click(editBtn);
    expect(mutateMock).toHaveBeenCalledWith(
      { story_id: 1, story_title: 'New Title' },
      expect.any(Object)
    );
  });

  it('calls deleteProject mutation when delete button clicked', async () => {
    const mutateMock = vi.fn();
    mockMutation(mutateMock);

    mockQuery();
    render(<SmartScriptProjectsPage />);
    const deleteBtn = screen.getAllByTestId('delete-btn')[0];
    fireEvent.click(deleteBtn);
    expect(mutateMock).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('renders pagination controls correctly', async () => {
    mockQuery();
    render(<SmartScriptProjectsPage />);
    const pagination = await screen.findByTestId('pagination-controls');
    expect(pagination).toBeInTheDocument();

    const page1Btn = screen.getByTestId('page-btn-1');
    const page2Btn = screen.getByTestId('page-btn-2');

    fireEvent.click(page2Btn);
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        '/cine-scribe/story-generation?page_num=2&page_size=20',
        { scroll: false }
      );
    });

    fireEvent.click(page1Btn);
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        '/cine-scribe/story-generation?page_num=1&page_size=20',
        { scroll: false }
      );
    });
  });
});

// --- Optional completeness tests ---
describe('SmartScriptProjectsPage - optional completeness tests', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(navigateMock);
    useLocation.mockReturnValue({ pathname: '/cine-scribe/story-generation' });
  });

  it('displays error state when query returns an error', async () => {
    mockQuery([], false, { message: 'Failed to load' });
    render(<SmartScriptProjectsPage />);
    expect(await screen.findByText(/failed to load projects/i)).toBeInTheDocument();
  });

  it('displays "No projects available" when project list is empty', async () => {
    mockQuery([], false);
    render(<SmartScriptProjectsPage />);
    expect(await screen.findByText(/no projects available/i)).toBeInTheDocument();
  });

  it('does not render pagination if totalPages = 1', async () => {
    mockQuery(
      [
        {
          story_id: 1,
          story_title: 'Only Project',
          updated_at: '2025-10-19',
          story_chat_status: 'Saved',
        },
      ],
      false,
      null,
      1
    );
    render(<SmartScriptProjectsPage />);
    expect(screen.queryByTestId('pagination-controls')).not.toBeInTheDocument();
  });

  it('renders updatedAt correctly in project card', async () => {
    mockQuery([
      {
        story_id: 1,
        story_title: 'Project 1',
        updated_at: '2025-10-19T12:00:00Z',
        story_chat_status: 'Saved',
      },
    ]);
    render(<SmartScriptProjectsPage />);
    const updatedAtEl = await screen.findByTestId('updated-at');
    expect(updatedAtEl.textContent).toContain('2025-10-19');
  });
});
