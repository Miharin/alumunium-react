import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from 'layouts/dashboard';
// import SimpleLayout from 'layouts/simple';
//
import BlogPage from 'pages/BlogPage';
import UserPage from 'pages/UserPage';
import LoginPage from 'pages/LoginPage';
import Page404 from 'pages/Page404';
import ProductsPage from 'pages/ProductsPage';
import DashboardAppPage from 'pages/DashboardAppPage';
import { useAuth } from 'store/index';

// ----------------------------------------------------------------------

export default function Router() {
  const userCred = useAuth((state) => state.userCredentials);
  let routePath;
  if (userCred.uid !== undefined) {
    routePath = [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { element: <Navigate to="/dashboard/app" />, index: true },
          { path: 'app', element: <DashboardAppPage /> },
          { path: 'user', element: <UserPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'blog', element: <BlogPage /> },
        ],
      },
      {
        path: '/login',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/404',
        element: <Page404 />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ];
  } else {
    routePath = [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ];
  }
  const routes = useRoutes(routePath);
  return routes;
}
