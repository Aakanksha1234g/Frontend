import CreatePitchCraft from '@components/pitch-craft/layouts/create-pitch-craft';
import { apiRequest } from '@utils/api-client';

// Mock API request
vi.mock('@utils/api-client', () => ({
  apiRequest: vi.fn(),
}));

const mockSetIsPitchCraftInputOpen = vi.fn();

const renderComponent = () => {
  render(
    <BrowserRouter>
      <CreatePitchCraft
        setIsPitchCraftInputOpen={mockSetIsPitchCraftInputOpen}
      />
    </BrowserRouter>
  );
};

describe('CreatePitchCraft Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all required input fields', () => {
    renderComponent();

    expect(screen.getByText(/Pitch Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Plot Synopsis/i)).toBeInTheDocument();
    expect(screen.getByText(/Genres/i)).toBeInTheDocument();
    expect(screen.getByText(/Themes/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Pitch Craft/i)).toBeInTheDocument();
  });

  test('shows validation errors when submitting empty form', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/Generate Pitch Craft/i));

    await waitFor(() => {
      expect(screen.getByText(/Pitch title is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/At least one genre is required/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/At least one theme is required/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Plot synopsis is required/i)
      ).toBeInTheDocument();
    });
  });

  test('submits form successfully when all fields are valid', async () => {
    apiRequest.mockResolvedValueOnce({ response: { pitch_id: '123' } });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Enter your pitch title/i), {
      target: { value: 'My Startup Pitch' },
    });

    fireEvent.change(screen.getByPlaceholderText(/Type your idea/i), {
      target: { value: 'A brilliant AI-powered investment platform.' },
    });

    // Simulate selecting genres
    const genreInput = screen
      .getByLabelText(/Genres/i)
      .nextSibling.querySelector('input');
    fireEvent.change(genreInput, { target: { value: 'Sci-Fi' } });
    fireEvent.keyDown(genreInput, { key: 'Enter', code: 'Enter' });

    // Simulate selecting themes
    const themeInput = screen
      .getByLabelText(/Themes/i)
      .nextSibling.querySelector('input');
    fireEvent.change(themeInput, { target: { value: 'Innovation' } });
    fireEvent.keyDown(themeInput, { key: 'Enter', code: 'Enter' });

    fireEvent.click(screen.getByText(/Generate Pitch Craft/i));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/create_pitchdeck',
          method: 'POST',
          body: expect.objectContaining({
            pitch_title: 'My Startup Pitch',
            pitch_plot: 'A brilliant AI-powered investment platform.',
            pitch_genre: expect.any(String),
            pitch_key_elements: expect.any(String),
          }),
        })
      );
    });
  });

  test('disables submit button and shows loading state during submission', async () => {
    let resolvePromise;
    apiRequest.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePromise = resolve;
        })
    );

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Enter your pitch title/i), {
      target: { value: 'My Startup Pitch' },
    });

    fireEvent.change(screen.getByPlaceholderText(/Type your idea/i), {
      target: { value: 'An AI tool that generates pitch decks.' },
    });

    const genreInput = screen
      .getByLabelText(/Genres/i)
      .nextSibling.querySelector('input');
    fireEvent.change(genreInput, { target: { value: 'Tech' } });
    fireEvent.keyDown(genreInput, { key: 'Enter', code: 'Enter' });

    const themeInput = screen
      .getByLabelText(/Themes/i)
      .nextSibling.querySelector('input');
    fireEvent.change(themeInput, { target: { value: 'Automation' } });
    fireEvent.keyDown(themeInput, { key: 'Enter', code: 'Enter' });

    fireEvent.click(screen.getByText(/Generate Pitch Craft/i));

    expect(screen.getByText(/Generating.../i)).toBeDisabled();

    await waitFor(() => resolvePromise({ response: { pitch_id: '123' } }));
  });

  test('calls close handler when x is clicked', () => {
    renderComponent();

    const closeButton = screen.getByText('x');
    fireEvent.click(closeButton);

    expect(mockSetIsPitchCraftInputOpen).toHaveBeenCalledWith(false);
  });

  test('shows API error in console if submission fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiRequest.mockRejectedValueOnce(new Error('API Error'));

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Enter your pitch title/i), {
      target: { value: 'Broken Pitch' },
    });

    fireEvent.change(screen.getByPlaceholderText(/Type your idea/i), {
      target: { value: 'Something that will fail.' },
    });

    const genreInput = screen
      .getByLabelText(/Genres/i)
      .nextSibling.querySelector('input');
    fireEvent.change(genreInput, { target: { value: 'Fantasy' } });
    fireEvent.keyDown(genreInput, { key: 'Enter', code: 'Enter' });

    const themeInput = screen
      .getByLabelText(/Themes/i)
      .nextSibling.querySelector('input');
    fireEvent.change(themeInput, { target: { value: 'Risk' } });
    fireEvent.keyDown(themeInput, { key: 'Enter', code: 'Enter' });

    fireEvent.click(screen.getByText(/Generate Pitch Craft/i));

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating pitch deck:',
        expect.any(Error)
      )
    );

    consoleSpy.mockRestore();
  });
});
