import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#ff5722',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 500,
    },
    body2: {
      color: 'textSecondary',
    },
  },
});

export default theme;
