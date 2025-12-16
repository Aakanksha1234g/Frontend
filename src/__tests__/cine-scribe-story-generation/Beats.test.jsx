/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BeatSheet from '@products/cine-scribe/pages/story-generation/pages/[id]/beats';
import { vi } from 'vitest';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import { useNavigate, useParams } from 'react-router';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';

// 🧩 Mock external hooks & modules
vi.mock('@tanstack/react-query');
vi.mock('@api/apiMethods');
vi.mock('@products/cine-scribe/contexts/ProductHeaderContext');
vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useBlocker: () => ({ state: 'unblocked' }),
}));

// 🧩 Default mocks for dependencies
const mockNavigate = vi.fn();
const mockSetHeaderProps = vi.fn();

useNavigate.mockReturnValue(mockNavigate);
useParams.mockReturnValue({ id: '123' });
useProductHeader.mockReturnValue({ setHeaderProps: mockSetHeaderProps });

describe('BeatSheet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

//   test('renders loading state', () => {
//     useQuery
//       .mockReturnValueOnce({
//         data: [],
//         isPending: true,
//         isError: false,
//         error: null,
//         refetch: vi.fn(),
//       })
//       .mockReturnValueOnce({
//         data: {},
//         isPending: false,
//         isError: false,
//         error: null,
//         refetch: vi.fn(),
//       });
  
//     render(<BeatSheet />);
//     expect(screen.getByText(/Checking Beat sheet/i).toBeInTheDocument());
//   });
  
  test('renders error state', () => {
    useQuery
      .mockReturnValueOnce({
        data: [],
        isPending: false,
        isError: true,
        error: new Error('Failed'),
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: {},
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });
  
    render(<BeatSheet />);
    expect(screen.getByText(/failed to load beats/i)).toBeInTheDocument();
  });
  

  test('renders beats when API succeeds', async () => {
    // Mock beats query
    useQuery
      .mockReturnValueOnce({
        data: [
          { id: 1, text: 'First Beat' },
          { id: 2, text: 'Second Beat' },
        ],
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      })
      // Mock story status query
      .mockReturnValueOnce({
        data: { oneliners_status: false },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

    useMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });
    useQueryClient.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData: vi.fn() });

    render(<BeatSheet />);

    expect(await screen.findByText(/first beat/i)).toBeInTheDocument();
    expect(await screen.findByText(/second beat/i)).toBeInTheDocument();
  });

  test('renders no beats message when API returns empty list', async () => {
    useQuery
      .mockReturnValueOnce({
        data: [],
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: { oneliners_status: true },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

    render(<BeatSheet />);
    expect(await screen.findByText(/no beats generated/i)).toBeInTheDocument();
  });

  test('triggers generateOneLiners mutation when header button clicked', async () => {
    const mockMutate = vi.fn();

    useQuery
      .mockReturnValueOnce({
        data: [{ id: 1, text: 'Sample Beat' }],
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: { oneliners_status: false },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

    useMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    useQueryClient.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData: vi.fn() });

    render(<BeatSheet />);

    // Wait for header setup
    await waitFor(() => expect(mockSetHeaderProps).toHaveBeenCalled());

    // Simulate clicking the header button
    const headerProps = mockSetHeaderProps.mock.calls[0][0];
    headerProps.onButtonClick();

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
