#### **Display Projects Page**

- Displays a list of projects with their respective project names, project descriptions.
- Two components used in the projects: FilterControls and PaginationControls.
- FilterControls component allows users to filter projects by project name, project description, and project status.

  props: {
  query: string;                      // Current search query (for project name or description)
  onQueryChange: (value: string) => void;  // Callback to update search query

  pageSize: number;                  // Current selected page size
  onPageSizeChange: (value: number) => void; // Callback to update page size

  filter?: string;                   // Current selected filter (e.g., project status)
  onFilterChange?: (value: string) => void; // Callback to update filter

  filtersList?: string[];           // List of filter options (e.g., ['All', 'Draft', 'Completed'])
  perPageList?: number[];           // List of per-page size options (e.g., [5, 10, 20])
  }

  Example usage:

  <FilterControls
  query={query}
  onQueryChange={setQuery}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  filter={filter}
  onFilterChange={setFilter}
  filtersList={['All', 'Draft', 'Completed']}
  perPageList={[5, 10, 20]}
  />
- PaginationControls component allows users to navigate between pages of projects.

  props: {
  pagination: Pagination;            // Pagination object containing current page, total pages, and total
  onPageChange: (page: number) => void;  // Callback to update current page
  }

  pagination: {
  currentPage: number;   // Current page number
  totalPages: number;    // Total number of pages
  totalCount: number;    // Total count of items
  };

  #### **Error Handling**

1. Frontend Error Handling

   - If the user loses internet connection after the application has loaded, the useNetworkStatus.jsx hook along with the Network.jsx component (wrapped inside `<NetworkWrapper>`) will detect and display a lost connection message.
   - If the user navigates to a route that doesn't exist in the frontend, they will be redirected to not-found.jsx.
   - Error Boundary [src/shared/components/ErrorBoundary.jsx]
   App is using React Router v6+ with createBrowserRouter and declarative route elements, like:
    {
      path: '/home',
      element: <Home />
      errorElement: <GlobalErrorPage />,
    }
    These route-level components are rendered inside the RouterProvider, not directly as children of ErrorBoundary, so if an error occurs in one of those routes, it bypasses the ErrorBoundary that wraps around RouterProvider.
   

   
2. Backend Error Handling
   (Defined in .src/api/apiClient.js)

   - If the application is unable to connect to the backend, the frontend will display a toast message indicating that the connection was lost.
   - If the application is unable to connect to the correct backend URL, the frontend will display a toast message indicating a connection timeout.
   - If the backend returns a 200 response, the frontend will display the response data and a toast message indicating the request was successful.
   - If the backend returns a 401 error, the frontend will redirect to the login page.
   - If the backend returns a 404 error, the frontend will display a custom error page indicating that the requested resource was not found.
   - If the backend returns a 500 error, the frontend will display a toast message indicating that an error occurred from our end.
