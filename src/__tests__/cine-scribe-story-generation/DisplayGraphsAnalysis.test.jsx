// // DisplayGraphsAnalysis.test.jsx
// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import { useQuery } from '@tanstack/react-query';
// import DisplayGraphsAnalysis from '@products/cine-scribe/pages/script-writing/pages/[id]/DisplayGraphsAnalysis';

// // mock the useQuery hook from react-query
// jest.mock('@tanstack/react-query', () => ({
//   useQuery: jest.fn(),
// }));

// describe('DisplayGraphsAnalysis', () => {
//   beforeEach(() => {
//     // reset mocks before each test so they don't affect the next one
//     jest.clearAllMocks();
//   });

//   test('renders loading state', () => {
//     // mock loading state
//     useQuery.mockReturnValue({
//       isLoading: true,
//       isError: false,
//       data: null,
//       error: null,
//     });

//     render(<DisplayGraphsAnalysis />);

//     // expect loading message
//     expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
//   });

//   test('renders error message when API fails', () => {
//     // mock error state
//     useQuery.mockReturnValue({
//       isLoading: false,
//       isError: true,
//       data: null,
//       error: { message: 'Network Error' },
//     });

//     render(<DisplayGraphsAnalysis />);

//     // expect error message to show
//     expect(screen.getByText(/Error: Network Error/i)).toBeInTheDocument();
//   });

//   test('renders "No data available" when API returns empty data', () => {
//     // mock successful API call but no data
//     useQuery.mockReturnValue({
//       isLoading: false,
//       isError: false,
//       data: { results: [] },
//       error: null,
//     });

//     render(<DisplayGraphsAnalysis />);

//     // expect "no data" message
//     expect(screen.getByText(/No data available/i)).toBeInTheDocument();
//   });
// });
