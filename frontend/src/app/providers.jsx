import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import queryClient from '@/lib/query-client.js';
import theme from '@/app/theme.js';
import { SessionProvider } from '@/features/auth/context/session-context.jsx';

const AppProviders = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <SessionProvider>
          {children}
        </SessionProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  </QueryClientProvider>
);

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
