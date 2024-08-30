import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#283593',  // Strong navy blue
    },
    secondary: {
      main: '#ff7043',  // Coral
    },
    background: {
      default: '#fafafa',  // Very light gray
      paper: '#ffffff',  // White for paper elements
    },
    text: {
      primary: '#212121',  // Dark gray for primary text
      secondary: '#757575',  // Medium gray for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',  // Keep button text normal case
    },
  },
});

export default theme;
