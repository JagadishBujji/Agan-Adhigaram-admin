import { Navigate, useNavigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import SettingPage from './pages/SettingPage';
import CategoriesPage from './pages/CategoriesPage';
import Products from './pages/Products';
import District from './pages/District';
import { useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, authentication } from './services/firebase';
import { AuthContext } from './context/auth-context';
import OrderHistory from './pages/OrderHistory';
import RegisterPage from './pages/RegisterPage';
import { getUserById } from './api/user';
import { useDispatch, useSelector } from 'react-redux';
import { errorNotification } from './utils/notification';
import { login, logout, selectIsAuthenticated } from './store/userSlice';

// ----------------------------------------------------------------------

export default function Router() {
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [authChecked, setAuthChecked] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(authentication, (user) => {
  //     console.log('user:', user);
  //     if (user) {
  //       authCtx.setMyUser(user);
  //       authCtx.setLoggedInHandler();
  //       navigate('/dashboard', { replace: true });
  //     } else {
  //       navigate('/login', { replace: true });
  //     }
  //   });

  //   return () => {
  //     // Unsubscribe the onAuthStateChanged listener when the component unmounts
  //     unsubscribe();
  //   };
  // }, []);


  useEffect(()=>{
    const unsubscribe=onAuthStateChanged(auth,async( user)=>{
      console.log("user in auth",user)
      if(user){
        const {uid}=user;
        console.log('uid',uid)
        getUserById(uid,(result)=>{
          if(result.success){
            dispatch(login(result.data));
            setAuthChecked(true)
          }
          else{
            errorNotification(result.err.message)
          }
        })
      }
      else{
        dispatch(logout())
        setAuthChecked(true);
      }
    })
    return unsubscribe;
  },[])


  console.log("isAuthenticated",isAuthenticated)
  
  const AuthenticatedRoute = ({ element, ...rest }) =>
    isAuthenticated ? element : <Navigate to="/login" />;




  const routes = useRoutes([
    {
      path: '/dashboard',
      element: (
        // authCtx.isLoggedIn ?
        // <DashboardLayout />
        <AuthenticatedRoute element={<DashboardLayout />} key="wishlist" />
      ),
      children: [
        // { element: <Navigate to="/dashboard/app" />, index: true },
        { element: <Navigate to="/dashboard/orders" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        // { path: 'orders', element: <OrdersPage /> },
        { path: 'order-histroy', element: <OrderHistory /> },
        { path: 'categories', element: <CategoriesPage /> },
        { path: 'categories/:id/products', element: <Products /> },
        // { path: 'districts', element: <District /> },
        // { path: 'blog', element: <BlogPage /> },
        // { path: 'settings', element: <SettingPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'register',
      element: <RegisterPage />,
    },
    {
      element:
       <AuthenticatedRoute element={<SimpleLayout /> } key="wishlist" />,
      children: [
        // { element: <Navigate to="/dashboard/app" />, index: true },
        { element: <Navigate to="/dashboard/orders" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
