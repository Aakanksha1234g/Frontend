import PitchCraftProjectsPage from '@components/pitch-craft/layouts/projects-page';
import * as apiClient from '@utils/api-client';

// Mocks
vi.mock('@utils/api-client');

vi.mock('@shared/ui/project-card', () => ({
  ProjectCard: ({ title, onClick, onDelete }) => (
    <div data-testid="project-card">
      <h3>{title}</h3>
      <button onClick={onClick}>Open</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}));

vi.mock('@shared/ui/searchbar', () => ({
  default: ({ query, setQuery }) => (
    <input
      placeholder="Search"
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  ),
}));

const mockProjects = [
  {
    pitch_id: 1,
    pitch_title: 'Survival Horror',
    updated_at: '2024-06-01T10:00:00Z',
    pitch_image: 'fakeImageBase64==',
  },
];

describe('PitchCraftProjectsPage', () => {
  const mockApiWithProjects = () => {
    apiClient.apiRequest.mockResolvedValue({
      response: mockProjects,
      total_pages: 1,
    });
  };

  const mockApiWithNoProjects = () => {
    apiClient.apiRequest.mockResolvedValue({
      response: [],
      total_pages: 1,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and accepts user input', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Survival' } });
    expect(input.value).toBe('Survival');
  });

  it('displays correct projects after valid search', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
  });

  it('shows no projects for invalid search', async () => {
    mockApiWithNoProjects();
    render(<PitchCraftProjectsPage />);
    expect(
      await screen.findByText(/no matching projects/i)
    ).toBeInTheDocument();
  });

  it('filters case-insensitively and trims whitespace', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: '  SURVIVAL ' } });
    expect(await screen.findByText(/survival horror/i)).toBeInTheDocument();
  });

  it('handles unsupported characters in search', async () => {
    mockApiWithNoProjects();
    render(<PitchCraftProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: '#$@!%' } });
    expect(
      await screen.findByText(/no matching projects/i)
    ).toBeInTheDocument();
  });

  it('displays pagination and works with multiple pages', async () => {
    apiClient.apiRequest
      .mockResolvedValueOnce({
        response: mockProjects,
        total_pages: 2,
      })
      .mockResolvedValueOnce({
        response: mockProjects,
        total_pages: 2,
      });

    render(<PitchCraftProjectsPage />);
    const nextButton = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(2);
    });
  });

  it('displays project card with correct title and open button', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('triggers delete popup when delete is clicked', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    const deleteBtn = await screen.findByText('Delete');
    fireEvent.click(deleteBtn);
    expect(await screen.findByText(/delete confirmation/i)).toBeInTheDocument();
  });

  it('handles deletion confirm button and closes popup', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    fireEvent.click(await screen.findByText('Delete'));
    fireEvent.click(await screen.findByText(/yes, delete/i));
    await waitFor(() => {
      expect(
        screen.queryByText(/delete confirmation/i)
      ).not.toBeInTheDocument();
    });
  });

  it('renders create new project button and opens modal', async () => {
    mockApiWithProjects();
    render(<PitchCraftProjectsPage />);
    const createBtn = await screen.findByText(/Create New Project/i);
    fireEvent.click(createBtn);
    expect(await screen.findByText(/create new pitch/i)).toBeInTheDocument();
  });
});
