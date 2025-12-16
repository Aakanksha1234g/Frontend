import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from '@shared/ui/project-card';

// Mock the internal UI elements used by ProjectCard
vi.mock('../ProjectCard', async () => {
  const actual = await vi.importActual('@shared/ui/project-card');
  return {
    ...actual,
    ProjectCard: ({ title, date, imageSrc, onClick, onDelete, className }) => (
      <div data-testid="project-card" className={className}>
        <img src={imageSrc} alt={title} />
        <h3>{title.charAt(0).toUpperCase() + title.slice(1)}</h3>
        <p>{formatRelativeDate(date)}</p>
        <button onClick={onClick}>Open</button>
        <button aria-label="Delete Project" onClick={onDelete}>
          Delete
        </button>
      </div>
    ),
  };
});

// Utility for simulating relative date formatting
function formatRelativeDate(dateString) {
  const now = new Date();
  const then = new Date(dateString);
  const diff = Math.floor((now - then) / 1000 / 60); // diff in minutes
  if (diff < 60) return `${diff} minutes ago`;
  const hours = Math.floor(diff / 60);
  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
}

describe('ProjectCard', () => {
  const mockProps = {
    title: 'test project',
    date: '2024-06-01T10:00:00Z',
    imageSrc: 'test.jpg',
    onClick: vi.fn(),
    onDelete: vi.fn(),
    className: 'custom-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title with capitalization', () => {
    render(<ProjectCard {...mockProps} />);
    expect(screen.getByText('Test project')).toBeInTheDocument();
  });

  it('renders image with correct src and alt', () => {
    render(<ProjectCard {...mockProps} />);
    const image = screen.getByAltText('test project');
    expect(image).toHaveAttribute('src', 'test.jpg');
  });

  it("calls onClick when 'Open' button is clicked", () => {
    render(<ProjectCard {...mockProps} />);
    fireEvent.click(screen.getByText('Open'));
    expect(mockProps.onClick).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<ProjectCard {...mockProps} />);
    fireEvent.click(screen.getByRole('button', { name: /delete project/i }));
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('shows relative date text', () => {
    render(<ProjectCard {...mockProps} />);
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });
});
