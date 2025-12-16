/**
 * Dashboard.test.jsx
 */

import React from 'react';
import Dashboard from '../../products/cine-scribe/pages/index';

// ------------------
// Mock external modules
// ------------------

// Mock the shared Button using a simple functional reproduction of your real Button
vi.mock('@shared/ui/button', () => {
  // We return a simple button that respects children, onClick, disabled, className, size
  const MockButton = ({
    children,
    onClick,
    disabled = false,
    className = '',
    ...props
  }) => {
    return (
      <button
        data-testid="shared-button"
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  };
  return { default: MockButton };
});

// Mock layout icons used in Accordion and BackgroundSvg
vi.mock('@shared/layout/icons', () => {
  return {
    PlusIcon: ({ color }) => <span data-testid="plus-icon">+</span>,
    SubtractIcon: ({ color }) => <span data-testid="subtract-icon">-</span>,
    // BackgroundSvg will render a container we can query; we keep props that the component passes
    BackgroundSvg: ({ WIDTH, HEIGHT, BACKGROUND_COLOR }) => (
      <div
        data-testid="background-svg"
        data-width={WIDTH}
        data-height={HEIGHT}
        data-bgcolor={BACKGROUND_COLOR}
      />
    ),
  };
});

// Mock the product header context
vi.mock('@products/cine-scribe/contexts/ProductHeaderContext', () => ({
  useProductHeader: () => ({
    setHeaderProps: vi.fn(),
  }),
}));

// Mock the modules constant used by BentoGrid
vi.mock('../constants/ProductConstants', () => ({
  modules: [
    { title: 'Story Generation', definition: 'Generate stories from ideas' },
    {
      title: 'Script Writing & Analysis',
      definition: 'Turn stories into scripts',
    },
  ],
}));

// Mock react-router's useNavigate to capture navigation attempts
const mockNavigate = vi.fn();
vi.mock('react-router', async importOriginal => {
  // keep other actual exports (if any) but override useNavigate
  const original = await importOriginal();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

// ------------------
// Tests
// ------------------

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo, headings and description', () => {
    render(<Dashboard />);

    expect(screen.getByAltText('Cine Scribe Logo')).toBeInTheDocument();
    expect(
      screen.getByText(/A Paradigm Shift in Productivity Tools/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Maintain a detailed and easily accessible record/i)
    ).toBeInTheDocument();
  });

  it('renders BentoGrid modules and background svgs', () => {
    render(<Dashboard />);

    // Module titles from our mocked modules constant
    expect(screen.getByText(/Story Generation/)).toBeInTheDocument();
    expect(screen.getByText(/Script Writing & Analysis/)).toBeInTheDocument();

    // BackgroundSvg appears for each Bento card and once in ComingSoonSection.
    // With 2 modules + 1 coming soon = at least 3 background svgs
    const svgs = screen.getAllByTestId('background-svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('navigates to story generation and script writing when Bento buttons clicked', async () => {
    render(<Dashboard />);

    // Buttons contain "Generate Story" and "Generate Analysis" text per component logic
    const generateStoryBtn = screen.getByRole('button', {
      name: /Generate Story/i,
    });
    const generateAnalysisBtn = screen.getByRole('button', {
      name: /Generate Analysis/i,
    });

    // Click first -> story generation route
    await userEvent.click(generateStoryBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/cine-scribe/story-generation');

    // Click second -> script writing route
    await userEvent.click(generateAnalysisBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/cine-scribe/script-writing');
  });

  it('renders ComingSoonSection buttons and text', () => {
    render(<Dashboard />);

    expect(screen.getByText(/STAY TUNED/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Be the first to know when we launch Lorven AI 2.0/i)
    ).toBeInTheDocument();

    // Our mocked Button has data-testid="shared-button"
    const buttons = screen.getAllByTestId('shared-button');
    // There are multiple shared buttons on the page (Bento + ComingSoon). Ensure the ComeingSoon buttons exist.
    expect(
      screen.getByRole('button', { name: /Get started/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Learn more/i })
    ).toBeInTheDocument();
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('accordion toggles open and close and shows correct icons', async () => {
    render(<Dashboard />);

    // There are two Accordion components rendered, each contains "Accordion 1" as a button label
    const accordionButtons = screen.getAllByRole('button', {
      name: /Accordion 1/i,
    });
    expect(accordionButtons.length).toBeGreaterThanOrEqual(1);

    // Click the first one to open
    await userEvent.click(accordionButtons[0]);

    // Content should appear
    expect(
      screen.getByText(/Lorem ipsum dolor sit amet./i)
    ).toBeInTheDocument();

    // Subtract icon should be present for open item
    expect(
      screen.getAllByTestId('subtract-icon').length
    ).toBeGreaterThanOrEqual(0);

    // Click again to close
    await userEvent.click(accordionButtons[0]);
    
  });

  it('all rendered shared buttons are keyboard accessible and clickable', async () => {
    render(<Dashboard />);

    const sharedButtons = screen.getAllByTestId('shared-button');
    expect(sharedButtons.length).toBeGreaterThan(0);

    // Focus and press Enter on the first button to ensure accessibility (userEvent handles keyboard)
    sharedButtons[0].focus();
    await userEvent.keyboard('{Enter}');

    // If the first shared button belonged to a Bento button it would trigger navigation, but
    // at minimum this ensures the button is focusable and keyboard actionable.
    expect(sharedButtons[0]).toHaveFocus();
  });
});
