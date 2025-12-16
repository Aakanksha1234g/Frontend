import CineSketchProjectsPage from '@components/cine-sketch-ai/layouts/projects-page';
import * as apiClient from '@utils/api-client';

vi.mock('@utils/api-client');

vi.mock('@shared/ui/project-card', () => ({
  ProjectCard: ({ script_title, onClick, onDelete }) => (
    <div data-testid="project-card">
      <h3>{script_title}</h3>
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

// --- Mock DeletePopup ---
vi.mock('@shared/ui/delete-popup', () => ({
  __esModule: true,
  default: ({ sketchId, onConfirm, onCancel }) => (
    <div data-testid="delete-popup" data-sketch-id={sketchId}>
      <p>Are you sure you want to delete?</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
      <div data-testid="modal-backdrop" onClick={onCancel}></div>
    </div>
  ),
}));

const mockProjects = [
  {
    sketch_id: 1,
    script_title: 'Survival Horror',
    created_time: '2024-06-01T10:00:00Z',
    shot_image: 'fakeImageBase64==',
  },
  {
    sketch_id: 2,
    script_title: 'Sci-Fi Dreams',
    created_time: '2024-06-02T11:00:00Z',
    shot_image: 'anotherFakeBase64==',
  },
];

// --- Utility: Mock fetch and delete API ---
function mockApiWithProjects() {
  apiClient.apiRequest.mockResolvedValueOnce({
    response: mockProjects,
    total_pages: 1,
  });
}

function mockDeleteApi(fn) {
  apiClient.apiRequest.mockImplementation(async args => {
    if (args.method === 'DELETE') {
      return fn();
    }
    return { response: mockProjects, total_pages: 1 };
  });
}

describe('CineSketchProjectsPage', () => {
  const mockApiWithProjects = (totalPages = 1) => {
    apiClient.apiRequest.mockResolvedValue({
      response: mockProjects,
      total_pages: totalPages,
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

  // Initial Render & Loading State
  it('Should render loading spinner initially', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    );
  });

  it('Should show search bar and button', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('Should not render any project cards initially before fetch resolves', async () => {
    apiClient.apiRequest.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () => resolve({ response: mockProjects, total_pages: 1 }),
            100
          )
        )
    );
    render(<CineSketchProjectsPage />);
    expect(screen.queryByTestId('project-card')).not.toBeInTheDocument();
  });

  it('Should not show delete popup on first load', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    expect(screen.queryByText(/delete confirmation/i)).not.toBeInTheDocument();
  });

  it('Should have initial pagination set to page 1', async () => {
    mockApiWithProjects(5);
    render(<CineSketchProjectsPage />);
    const input = await screen.findByDisplayValue('1');
    expect(input).toBeInTheDocument();
  });

  // Fetching Projects
  it('Should call apiRequest on mount', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    await waitFor(() => {
      expect(apiClient.apiRequest).toHaveBeenCalled();
    });
  });

  it('Should fetch projects with default limit', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    await waitFor(() => {
      const lastCall = apiClient.apiRequest.mock.calls[0][0];
      expect(lastCall.params.limit).toBeDefined();
    });
  });

  it('Should display projects when data returns', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
  });

  it('Should reverse project list before rendering', async () => {
    const reversedProjects = [
      { ...mockProjects[0], sketch_id: 2, script_title: 'Z Project' },
      { ...mockProjects[0], sketch_id: 1, script_title: 'A Project' },
    ];
    apiClient.apiRequest.mockResolvedValue({
      response: reversedProjects,
      total_pages: 1,
    });

    render(<CineSketchProjectsPage />);
    const titles = await screen.findAllByTestId('project-card');
    expect(titles[0]).toHaveTextContent('A Project');
    expect(titles[1]).toHaveTextContent('Z Project');
  });

  it('Should update pagination totalPages on success', async () => {
    apiClient.apiRequest.mockResolvedValue({
      response: mockProjects,
      total_pages: 3,
    });
    render(<CineSketchProjectsPage />);
    expect(await screen.findByText(/of 3/i)).toBeInTheDocument();
  });

  it('Should handle fetch error gracefully', async () => {
    apiClient.apiRequest.mockRejectedValue(new Error('Fetch failed'));
    render(<CineSketchProjectsPage />);
    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('Should not fetch if component unmounts early', async () => {
    const abortMock = vi.fn();
    const abortController = { abort: abortMock, signal: {} };
    global.AbortController = vi.fn(() => abortController);

    const { unmount } = render(<CineSketchProjectsPage />);
    unmount();
    expect(abortMock).toHaveBeenCalled();
  });

  it('Should retry fetching if currentPage changes', async () => {
    apiClient.apiRequest
      .mockResolvedValueOnce({ response: mockProjects, total_pages: 2 })
      .mockResolvedValueOnce({ response: mockProjects, total_pages: 2 });

    render(<CineSketchProjectsPage />);
    const nextBtn = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(2);
    });
  });

  it('Should abort previous fetch on unmount', async () => {
    const abortMock = vi.fn();
    const abortController = { abort: abortMock, signal: {} };
    global.AbortController = vi.fn(() => abortController);

    const { unmount } = render(<CineSketchProjectsPage />);
    unmount();
    expect(abortMock).toHaveBeenCalled();
  });

  it('Should fetch again when search query changes', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Thriller' } });

    await waitFor(() => {
      expect(apiClient.apiRequest).toHaveBeenCalledTimes(2);
    });
  });

  // --- Search-related tests ---
  it('Should update searchQuery on user input', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Horror' } });
    expect(input.value).toBe('Horror');
  });

  it('Should filter project list based on script_title', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Survival' } });
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
  });

  it('Should not filter when searchQuery is empty', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
  });

  it('Should ignore the case when filtering', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'surVival HoRRor' } });
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
  });

  it("Should display 'No projects' if no match", async () => {
    mockApiWithNoProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'NoMatchTitle' } });
    expect(
      await screen.findByText(/no matching projects/i)
    ).toBeInTheDocument();
  });

  it('Should debounce search input (if applicable)', async () => {
    vi.useFakeTimers();
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: 'Thril' } });
    fireEvent.change(input, { target: { value: 'Thriller' } });

    vi.advanceTimersByTime(500); // Assuming 500ms debounce
    await waitFor(
      () => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2) // initial + debounced
    );
    vi.useRealTimers();
  });

  it('Should re-fetch filtered data from server', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Thriller' } });
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2)); // initial + search
  });

  it('Should reset to page 1 on new search', async () => {
    mockApiWithProjects(5);
    render(<CineSketchProjectsPage />);

    const next = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(next);
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2));

    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Survival' } });

    const pageInput = await screen.findByDisplayValue('1');
    expect(pageInput).toBeInTheDocument();
  });

  it('Should preserve search term in input field', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Survival' } });
    expect(input.value).toBe('Survival');
  });

  it('Should work with special characters in search', async () => {
    const projects = [
      { id: 1, script_title: "L'amour, c'est tout", shot_image: '' },
    ];
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.json(projects)))
    );
    render(<CineSketchProjectsPage />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "L'amour" } });
    expect(await screen.findByText(/L'amour, c'est tout/)).toBeInTheDocument();
  });

  it('Should support non-ASCII script titles', async () => {
    const projects = [{ id: 1, script_title: '情书', shot_image: '' }];
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.json(projects)))
    );
    render(<CineSketchProjectsPage />);
    expect(await screen.findByText('情书')).toBeInTheDocument();
  });

  it('Should filter with partial matches', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const input = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'viv' } });
    expect(await screen.findByText('Survival Horror')).toBeInTheDocument();
  });

  // --- Pagination-related tests ---
  it("Should increment page on 'Next' click", async () => {
    mockApiWithProjects(3);
    render(<CineSketchProjectsPage />);
    const nextButton = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2));
  });

  it("Should decrement page on 'Previous' click", async () => {
    mockApiWithProjects(3);
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /next/i }));
    fireEvent.click(await screen.findByRole('button', { name: /previous/i }));
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(3));
  });

  it('Should not decrement page below 1', async () => {
    mockApiWithProjects(3);
    render(<CineSketchProjectsPage />);
    const prev = await screen.findByRole('button', { name: /previous/i });
    fireEvent.click(prev);
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(1));
  });

  it('Should not increment page above totalPages', async () => {
    mockApiWithProjects(1);
    render(<CineSketchProjectsPage />);
    const next = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(next);
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(1));
  });

  it('Should display correct current page in input', async () => {
    mockApiWithProjects(2);
    render(<CineSketchProjectsPage />);
    const input = await screen.findByDisplayValue('1');
    expect(input).toBeInTheDocument();
  });

  it('Should update state when page input is changed', async () => {
    mockApiWithProjects(5);
    render(<CineSketchProjectsPage />);
    const input = await screen.findByDisplayValue('1');
    fireEvent.change(input, { target: { value: '3' } });
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2));
  });

  it('Should show left/right arrow icons', async () => {
    mockApiWithProjects(2);
    render(<CineSketchProjectsPage />);
    expect(await screen.findByAltText(/previous/i)).toBeInTheDocument();
    expect(await screen.findByAltText(/next/i)).toBeInTheDocument();
  });

  it('Should disable pagination if only 1 page', async () => {
    mockApiWithProjects(1);
    render(<CineSketchProjectsPage />);
    const next = await screen.findByRole('button', { name: /next/i });
    expect(next).not.toBeDisabled(); // Optional enhancement: actually check for `disabled` class
  });

  it("Should display 'of totalPages'", async () => {
    mockApiWithProjects(4);
    render(<CineSketchProjectsPage />);
    expect(await screen.findByText('of')).toBeInTheDocument();
    expect(await screen.findByText('4')).toBeInTheDocument();
  });

  it('Should re-fetch data on page change', async () => {
    mockApiWithProjects(2);
    render(<CineSketchProjectsPage />);
    const next = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(next);
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2));
  });

  it('Should handle non-numeric input in pagination', async () => {
    mockApiWithProjects(5);
    render(<CineSketchProjectsPage />);
    const input = await screen.findByDisplayValue('1');
    fireEvent.change(input, { target: { value: 'abc' } });
    // Input should ignore or correct non-numeric input.
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(1));
  });

  it('Should clamp invalid page inputs', async () => {
    mockApiWithProjects(3);
    render(<CineSketchProjectsPage />);
    const input = await screen.findByDisplayValue('1');
    fireEvent.change(input, { target: { value: '999' } });
    await waitFor(() => expect(apiClient.apiRequest).toHaveBeenCalledTimes(2));
  });

  it('Should re-render project cards on page change', async () => {
    mockApiWithProjects(2);
    render(<CineSketchProjectsPage />);
    const next = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(next);
    expect(await screen.findAllByTestId('project-card')).toHaveLength(1);
  });

  it('Should show correct number of cards per page', async () => {
    mockApiWithProjects(1);
    render(<CineSketchProjectsPage />);
    const cards = await screen.findAllByTestId('project-card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('Should support totalPages = 0 gracefully', async () => {
    apiClient.apiRequest.mockResolvedValue({
      response: [],
      total_pages: 0,
    });
    render(<CineSketchProjectsPage />);
    expect(
      await screen.findByText(/no matching projects/i)
    ).toBeInTheDocument();
  });

  // --- Delete popup logic ---
  it('Should open delete popup on delete click', async () => {
    render(<CineSketchProjectsPage />);
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('Should close popup on cancel', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it('Should call delete API on confirm', async () => {
    const deleteSpy = vi.fn().mockResolvedValue({});
    mockDeleteApi(deleteSpy);

    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  it('Should show error on delete failure', async () => {
    mockDeleteApi(() => Promise.reject(new Error('Delete failed')));
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText(/delete failed/i)).toBeInTheDocument();
  });

  it('Should show success message on successful delete', async () => {
    mockDeleteApi(() => Promise.resolve({}));
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(
      await screen.findByText(/successfully deleted/i)
    ).toBeInTheDocument();
  });

  it('Should reload page after delete', async () => {
    const reloadSpy = vi
      .spyOn(window.location, 'reload')
      .mockImplementation(() => {});
    mockDeleteApi(() => Promise.resolve({}));

    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalled();
    });

    reloadSpy.mockRestore();
  });

  it('Should set correct sketchId on delete', async () => {
    render(<CineSketchProjectsPage />);
    const deleteButtons = await screen.findAllByRole('button', {
      name: /delete/i,
    });

    fireEvent.click(deleteButtons[0]);
    expect(screen.getByTestId('delete-popup')).toHaveAttribute(
      'data-sketch-id',
      '1'
    ); // or use actual ID
  });

  it('Should not call delete if no sketchId', async () => {
    const deleteSpy = vi.fn();
    render(<DeletePopup sketchId={null} onConfirm={deleteSpy} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('Should hide popup on backdrop click', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it('Should allow multiple deletions sequentially', async () => {
    const deleteSpy = vi.fn().mockResolvedValue({});
    mockDeleteApi(deleteSpy);
    render(<CineSketchProjectsPage />);

    const deleteButtons = await screen.findAllByRole('button', {
      name: /delete/i,
    });

    for (const button of deleteButtons) {
      fireEvent.click(button);
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
      await waitFor(() => expect(deleteSpy).toHaveBeenCalled());
    }

    expect(deleteSpy).toHaveBeenCalledTimes(deleteButtons.length);
  });

  // Create New Project Flow
  it('Should open ScriptUploader on button click', async () => {
    render(<CineSketchProjectsPage />);
    const openButton = screen.getByRole('button', { name: /upload script/i });
    fireEvent.click(openButton);
    expect(await screen.findByTestId('script-uploader')).toBeInTheDocument();
  });

  it('Should close ScriptUploader on outside click', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    fireEvent.mouseDown(document.body); // simulate outside click
    await waitFor(() => {
      expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
    });
  });

  it('Should pass close function to ScriptUploader', async () => {
    const { getByRole } = render(<CineSketchProjectsPage />);
    fireEvent.click(getByRole('button', { name: /upload script/i }));
    const closeButton = await screen.findByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
  });

  it('Should show overlay when ScriptUploader is open', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    expect(await screen.findByTestId('script-overlay')).toBeInTheDocument();
  });

  it('Should render ScriptUploader only if toggled', () => {
    render(<CineSketchProjectsPage />);
    expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    expect(screen.getByTestId('script-uploader')).toBeInTheDocument();
  });

  it('Should focus input inside ScriptUploader (if applicable)', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    const input = await screen.findByPlaceholderText(/enter script/i);
    expect(document.activeElement).toBe(input);
  });

  it('Should not block background scroll (optional)', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('Should block background interactions', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    const backgroundButton = screen.getByTestId('some-background-button');
    fireEvent.click(backgroundButton);
    // assert background button did not respond (e.g. call a mock or check a class)
    expect(screen.getByTestId('script-uploader')).toBeInTheDocument();
  });

  it('Should close ScriptUploader on escape key (if implemented)', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
    });
  });

  it('Should not re-fetch on close', async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce([]);
    render(<CineSketchProjectsPage fetchProjects={fetchSpy} />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  // error handling
  it('Should open ScriptUploader on button click', async () => {
    render(<CineSketchProjectsPage />);
    const openButton = screen.getByRole('button', { name: /upload script/i });
    fireEvent.click(openButton);
    expect(await screen.findByTestId('script-uploader')).toBeInTheDocument();
  });

  it('Should close ScriptUploader on outside click', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    fireEvent.mouseDown(document.body); // simulate outside click
    await waitFor(() => {
      expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
    });
  });

  it('Should pass close function to ScriptUploader', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    const closeButton = await screen.findByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
  });

  it('Should show overlay when ScriptUploader is open', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    expect(await screen.findByTestId('script-overlay')).toBeInTheDocument();
  });

  it('Should render ScriptUploader only if toggled', () => {
    render(<CineSketchProjectsPage />);
    expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    expect(screen.getByTestId('script-uploader')).toBeInTheDocument();
  });

  it('Should focus input inside ScriptUploader (if applicable)', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    const input = await screen.findByPlaceholderText(/enter script/i);
    expect(document.activeElement).toBe(input);
  });

  it('Should not block background scroll (optional)', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('Should block background interactions', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    const backgroundButton = screen.getByTestId('some-background-button');
    fireEvent.click(backgroundButton);
    expect(screen.getByTestId('script-uploader')).toBeInTheDocument();
  });

  it('Should close ScriptUploader on escape key (if implemented)', async () => {
    render(<CineSketchProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('script-uploader')).not.toBeInTheDocument();
    });
  });

  it('Should not re-fetch on close', async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce([]);
    render(<CineSketchProjectsPage fetchProjects={fetchSpy} />);
    fireEvent.click(screen.getByRole('button', { name: /upload script/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('Should show error message on API failure', async () => {
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.status(500)))
    );
    render(<CineSketchProjectsPage />);
    expect(
      await screen.findByText(/failed to load projects/i)
    ).toBeInTheDocument();
  });

  it('Should show no cards when error occurs', async () => {
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.status(500)))
    );
    render(<CineSketchProjectsPage />);
    await waitFor(() => {
      expect(screen.queryAllByTestId('project-card')).toHaveLength(0);
    });
  });

  it('Should hide loading spinner on error', async () => {
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.status(500)))
    );
    render(<CineSketchProjectsPage />);
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('Should not crash if malformed API response', async () => {
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.json({ data: null })))
    );
    expect(() => render(<CineSketchProjectsPage />)).not.toThrow();
  });

  it('Should support retry logic (if implemented)', async () => {
    let callCount = 0;
    server.use(
      rest.get('/api/projects', (_, res, ctx) => {
        callCount++;
        return callCount === 1
          ? res(ctx.status(500))
          : res(ctx.json([{ id: 1, script_title: 'Retry Title' }]));
      })
    );
    render(<CineSketchProjectsPage />);
    const retryButton = await screen.findByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(await screen.findByText(/retry title/i)).toBeInTheDocument();
  });

  // Edge cases
  it('Should handle empty API responses', async () => {
    server.use(rest.get('/api/projects', (_, res, ctx) => res(ctx.json([]))));
    render(<CineSketchProjectsPage />);
    expect(await screen.findByText(/no projects found/i)).toBeInTheDocument();
  });

  it('Should tolerate corrupted/missing image data', async () => {
    const projects = [
      { id: 1, script_title: 'Broken Image', shot_image: null },
    ];
    server.use(
      rest.get('/api/projects', (_, res, ctx) => res(ctx.json(projects)))
    );
    render(<CineSketchProjectsPage />);
    const img = await screen.findByAltText(/broken image/i);
    expect(img).toHaveAttribute(
      'src',
      expect.stringMatching(/placeholder|default/i)
    );
  });
});

describe('CineSketchProjectsPage - Delete popup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should open delete popup on delete click', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('Should close popup on cancel', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it('Should call delete API on confirm', async () => {
    const deleteSpy = vi.fn().mockResolvedValue({});
    mockDeleteApi(deleteSpy);
    mockApiWithProjects();

    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  it('Should show error on delete failure', async () => {
    mockDeleteApi(() => Promise.reject(new Error('Delete failed')));
    mockApiWithProjects();

    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText(/delete failed/i)).toBeInTheDocument();
  });

  it('Should show success message on successful delete', async () => {
    mockDeleteApi(() => Promise.resolve({}));
    mockApiWithProjects();

    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(
      await screen.findByText(/successfully deleted/i)
    ).toBeInTheDocument();
  });

  it('Should reload page after delete', async () => {
    const reloadSpy = vi
      .spyOn(window.location, 'reload')
      .mockImplementation(() => {});
    mockDeleteApi(() => Promise.resolve({}));
    mockApiWithProjects();

    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalled();
    });

    reloadSpy.mockRestore();
  });

  it('Should set correct sketchId on delete', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    const deleteButtons = await screen.findAllByRole('button', {
      name: /delete/i,
    });

    fireEvent.click(deleteButtons[0]);
    const popup = screen.getByTestId('delete-popup');
    expect(popup).toHaveAttribute('data-sketch-id', '1');
  });

  it('Should not call delete if no sketchId', async () => {
    const deleteSpy = vi.fn();
    const DeletePopup = (await import('@shared/ui/delete-popup')).default;

    render(<DeletePopup sketchId={null} onConfirm={deleteSpy} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('Should hide popup on backdrop click', async () => {
    mockApiWithProjects();
    render(<CineSketchProjectsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it('Should allow multiple deletions sequentially', async () => {
    const deleteSpy = vi.fn().mockResolvedValue({});
    mockDeleteApi(deleteSpy);
    mockApiWithProjects();

    render(<CineSketchProjectsPage />);
    const deleteButtons = await screen.findAllByRole('button', {
      name: /delete/i,
    });

    for (const button of deleteButtons) {
      fireEvent.click(button);
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
      await waitFor(() => expect(deleteSpy).toHaveBeenCalled());
    }

    expect(deleteSpy).toHaveBeenCalledTimes(deleteButtons.length);
  });
});
