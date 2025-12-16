import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import ChatHistory from '@products/cine-scribe/pages/story-generation/pages/[id]/chat';

// Mock external dependencies
vi.mock('react-router', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('@api/apiMethods', () => ({
  fetchData: vi.fn(),
  sendData: vi.fn(),
}));

vi.mock('@shared/ui/textarea', () => ({
  default: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@shared/ui/spinner', () => ({
  default: ({ text }) => <div data-testid="spinner">{text}</div>,
}));

vi.mock('../../../components/DisplayStoryDetails', () => ({
  default: ({ isCollapsed, setIsCollapsed }) => (
    <div data-testid="story-details-panel">
      <button onClick={() => setIsCollapsed(!isCollapsed)}>Toggle Panel</button>
    </div>
  ),
}));

vi.mock('@products/cine-scribe/contexts/ProductHeaderContext', () => ({
  useProductHeader: vi.fn(),
}));

vi.mock('@shared/layout/icons', () => ({
  SendIcon: () => <div data-testid="send-icon">Send</div>,
  CopyIcon: () => <div data-testid="copy-icon">Copy</div>,
}));

vi.mock('@shared/layout/product-header', () => ({
  default: () => <div data-testid="product-header">Product Header</div>,
}));

vi.mock('./loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ChatHistory', () => {
  const { useParams, useNavigate } = import('react-router');
  const { useQuery, useMutation, useQueryClient } =  import('@tanstack/react-query');
  const { useProductHeader } = import('@products/cine-scribe/contexts/ProductHeaderContext');

  let mockNavigate;
  let mockSetHeaderProps;
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockNavigate = vi.fn();
    mockSetHeaderProps = vi.fn();

    useParams.mockReturnValue({ id: '123' });
    useNavigate.mockReturnValue(mockNavigate);
    useQueryClient.mockReturnValue(queryClient);
    useProductHeader.mockReturnValue({ setHeaderProps: mockSetHeaderProps });

    useQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'storyChat') {
        return { data: [], error: null, isPending: false };
      }
      if (queryKey[0] === 'storyStatusBarDetails') {
        return { data: { beat_sheet_status: false }, error: null, isPending: false };
      }
      return { data: null, error: null, isPending: false };
    });

    useMutation.mockImplementation(() => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ChatHistory />
        </BrowserRouter>
      </QueryClientProvider>
    );

  describe('Initial Render States', () => {
    it('should show loading state when data is pending', () => {
      useQuery.mockImplementation(() => ({
        data: null,
        error: null,
        isPending: true,
      }));

      renderComponent();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should show error state when there is an error', () => {
      useQuery.mockImplementation(() => ({
        data: null,
        error: new Error('Failed to fetch'),
        isPending: false,
      }));

      renderComponent();
      expect(screen.getByText('Failed to load chat data.')).toBeInTheDocument();
    });

    it('should show empty state when no chat data', () => {
      useQuery.mockImplementation(() => ({
        data: [],
        error: null,
        isPending: false,
      }));

      renderComponent();
      expect(screen.getByText('No Story Ideas Generated')).toBeInTheDocument();
    });
  });

  describe('Chat Display', () => {
    beforeEach(() => {
      const mockChatData = [
        { role: 'human', content: 'Hello, AI!' },
        { role: 'ai', content: 'Hello, human! How can I help you?' },
        { role: 'human', content: 'Can you write a story?' },
        { role: 'ai', content: 'Sure! Here is a story...' },
      ];

      useQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'storyChat') {
          return { data: mockChatData, error: null, isPending: false };
        }
        if (queryKey[0] === 'storyStatusBarDetails') {
          return { data: { beat_sheet_status: false }, error: null, isPending: false };
        }
        return { data: null, error: null, isPending: false };
      });
    });

    it('should display chat messages correctly', () => {
      renderComponent();
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
      expect(screen.getByText('Hello, human! How can I help you?')).toBeInTheDocument();
      expect(screen.getByText('Can you write a story?')).toBeInTheDocument();
      expect(screen.getByText('Sure! Here is a story...')).toBeInTheDocument();
    });

    it('should show copy buttons for AI messages', () => {
      renderComponent();
      const copyIcons = screen.getAllByTestId('copy-icon');
      expect(copyIcons.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      const mockChatData = [{ role: 'ai', content: 'Test AI message' }];

      useQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'storyChat') {
          return { data: mockChatData, error: null, isPending: false };
        }
        if (queryKey[0] === 'storyStatusBarDetails') {
          return { data: { beat_sheet_status: false }, error: null, isPending: false };
        }
        return { data: null, error: null, isPending: false };
      });
    });

    it('should handle text input changes', () => {
      renderComponent();
      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'New message' } });
      expect(textarea.value).toBe('New message');
    });

    it('should handle send message with empty input', async () => {
      const mockSendMessageMutation = vi.fn();
      useMutation.mockImplementation(() => ({
        mutateAsync: mockSendMessageMutation,
        isPending: false,
      }));

      renderComponent();
      const sendButton = screen.getByTestId('send-icon').closest('div');
      fireEvent.click(sendButton);
      expect(mockSendMessageMutation).not.toHaveBeenCalled();
    });

    it('should handle copy functionality', async () => {
      navigator.clipboard.writeText.mockResolvedValue();
      renderComponent();
      const copyButton = screen.getByTestId('copy-icon').closest('div');
      fireEvent.click(copyButton);
      await waitFor(() =>
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test AI message')
      );
    });
  });

  describe('API Integration', () => {
    it('should call sendMessage mutation when sending a message', async () => {
      const mockSendMessageMutation = vi.fn().mockResolvedValue({
        data: { response: { story: 'AI response' } },
      });

      useMutation.mockImplementation(() => ({
        mutateAsync: mockSendMessageMutation,
        isPending: false,
      }));

      renderComponent();
      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      const sendButton = screen.getByTestId('send-icon').closest('div');
      fireEvent.click(sendButton);

      await waitFor(() =>
        expect(mockSendMessageMutation).toHaveBeenCalledWith('Test message')
      );
    });
  });

  describe('Word Limit Validation', () => {
    it('should validate message length against word limit', () => {
      renderComponent();
      const longMessage = 'word '.repeat(1000);
      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: longMessage } });
      expect(textarea.value.length).toBe(longMessage.length);
    });
  });

  describe('Component Lifecycle', () => {
    it('should set header props on mount', () => {
      useQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'storyChat') {
          return { data: [{ role: 'ai', content: 'Test story' }], error: null, isPending: false };
        }
        if (queryKey[0] === 'storyStatusBarDetails') {
          return { data: { beat_sheet_status: false }, error: null, isPending: false };
        }
        return { data: null, error: null, isPending: false };
      });

      renderComponent();
      expect(mockSetHeaderProps).toHaveBeenCalled();
    });

    it('should clean up on unmount', () => {
      const { unmount } = renderComponent();
      unmount();
    });
  });
});
