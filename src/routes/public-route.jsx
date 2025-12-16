import { Navigate } from 'react-router';
import { isAuthenticated } from '@shared/utils/cookie-store';

const PublicRoute = ({ children }) => {
  // Adjust this selector to your auth state
  const isAuthenticated2 = isAuthenticated();
  if (isAuthenticated2) {
    // Redirect to home or any protected route
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
