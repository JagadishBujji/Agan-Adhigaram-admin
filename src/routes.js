import { Navigate, useRoutes } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
// services & store
import { auth } from './services/firebase';
import { getUserById } from './api/user';
import { errorNotification } from './utils/notification';
import { login, logout, selectIsAuthenticated } from './store/userSlice';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Page404 = lazy(() => import('./pages/Page404'));
const DashboardAppPage = lazy(() => import('./pages/DashboardAppPage'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const BookManagement = lazy(() => import('./pages/BookManagement'));

// Loading component for Suspense
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

// ----------------------------------------------------------------------

export default function Router() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        getUserById(uid, (result) => {
          if (result.success) {
            dispatch(login(result.data));
            setAuthChecked(true);
          } else {
            errorNotification(result.err.message);
          }
        });
      } else {
        dispatch(logout());
        setAuthChecked(true);
      }
    });
    return unsubscribe;
  }, [dispatch]);

  const AuthenticatedRoute = ({ element }) => (isAuthenticated ? element : <Navigate to="/login" />);

  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <AuthenticatedRoute element={<DashboardLayout />} />,
      children: [
        { element: <Navigate to="/dashboard/order-histroy" />, index: true },
        { path: 'app', element: <Suspense fallback={<PageLoader />}><DashboardAppPage /></Suspense> },
        { path: 'order-histroy', element: <Suspense fallback={<PageLoader />}><OrderHistory /></Suspense> },
        { path: 'orders', element: <Navigate to="/dashboard/order-histroy" /> },
        { path: 'book-management', element: <Suspense fallback={<PageLoader />}><BookManagement /></Suspense> },
      ],
    },
    {
      path: 'login',
      element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
    },
    {
      path: 'register',
      element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>,
    },
    {
      element: <AuthenticatedRoute element={<SimpleLayout />} />,
      children: [
        { element: <Navigate to="/dashboard/order-histroy" />, index: true },
        { path: '404', element: <Suspense fallback={<PageLoader />}><Page404 /></Suspense> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  // Wait until auth state is checked before rendering routes
  if (!authChecked) {
    return <PageLoader />;
  }

  return routes;
}
