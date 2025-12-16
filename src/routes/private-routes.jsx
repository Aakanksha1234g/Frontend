import { Navigate, Outlet } from 'react-router';
import { isAuthenticated } from '@shared/utils/cookie-store';

export default function PrivateRoutes() {
  let hasToken = isAuthenticated();
  return hasToken ? <Outlet /> : <Navigate to="/login" replace />;
}
