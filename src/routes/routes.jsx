import Layout from '../Layout';
import PrivateRoutes from './private-routes';

import PublicRoute from './public-route';
import LoginPage from '@global-pages/login';
import SignupPage from '@global-pages/signup';

import Home from '@shared/layout/Home';
import EditProfilePage from '@global-pages/profile';
import GlobalErrorPage from '@shared/components/GlobalErrorPage';
import CineScribeLayout from '@products/cine-scribe/layout/CineScribeLayout';

import {
  cineScribeRoutes,
  sceneEvaluationRoutes,
  cineSketchRoutes,
  pitchCraftRoutes,
} from './route-groups';

import { Link } from 'react-router';
import NotFoundRedirect from '@shared/NotFoundRedirect';

const routes = [
  {
    path: '/',
    element: (
      <PublicRoute>
        <div className="flex flex-col items-center justify-center h-screen bg-primary-gray-100 text-center">
          Welcome to LORVEN AI
          <Link className="button-primary" to="/login">
            Login
          </Link>
        </div>
      </PublicRoute>
    ),
    errorElement: <GlobalErrorPage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
    errorElement: <GlobalErrorPage />,
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
    errorElement: <GlobalErrorPage />,
  },

  {
    element: <Layout />,
    errorElement: <GlobalErrorPage />,
    children: [
      {
        element: <PrivateRoutes />,
        errorElement: <GlobalErrorPage />,
        children: [
          {
            path: '/home',
            element: <Home />,
            errorElement: <GlobalErrorPage />,
          },
          {
            path: '/edit-profile',
            element: <EditProfilePage />,
            errorElement: <GlobalErrorPage />,
          },
          {
            path: '/cine-scribe',
            element: <CineScribeLayout />,
            errorElement: <GlobalErrorPage />,
            children: cineScribeRoutes.map(route => ({
              ...route,
              errorElement: <GlobalErrorPage />,
            })),
          },
          {
            path: '/cine-scribe',
            element: <CineScribeLayout />,
            errorElement: <GlobalErrorPage />,
            children: sceneEvaluationRoutes.map(route => ({
              ...route,
              errorElement: <GlobalErrorPage />,
            })),
          },
         
          // Removed CineSketch route for client testing
          // ...cineSketchRoutes .map(route => ({
          //   ...route,
          //   errorElement: <GlobalErrorPage />,
          // })),
          ...pitchCraftRoutes.map(route => ({
            ...route,
            errorElement: <GlobalErrorPage />,
          })),
        ],
      },
    ],
  },
  {
    path: '/not-found',
    element: <NotFoundRedirect />,
    errorElement: <GlobalErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
    errorElement: <GlobalErrorPage />,
  },
];

export default routes;
