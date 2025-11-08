import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#0ea5e9',
    },
    background: {
      default: '#f5f6fb',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;
