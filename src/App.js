import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';
import './styles.css';
import SpinnerWithBackdrop from './Reuseable/Spinner/SpinnerWithBackdrop';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <SpinnerWithBackdrop />
          <ScrollToTop />
          <StyledChart />
          <Router />
          <ToastContainer />
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
