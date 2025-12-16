import { QueryClient } from '@tanstack/react-query';
import { showToast } from '@shared/utils/toast-service';

// Customize this as needed for your project


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'always',
       onError: error => {
        showToast(
          error?.response?.data?.message ||
            error?.message ||
            'Query CLient : Operation failed',
          'error',
          5000
        );
      },
      
    },
    mutations: {
      retry: 0,
      networkMode: 'always',
      onError: error => {
        showToast(
          error?.response?.data?.message ||
            error?.message ||
            'Query CLient : Operation failed',
          'error',
          5000
        );
      },
      
    },
  },
});



export default queryClient;
