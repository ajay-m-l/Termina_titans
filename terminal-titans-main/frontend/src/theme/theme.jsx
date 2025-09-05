import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#666666',
    },
    background: {
      default: '#212121',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbb',
    },
  },
  components: {
    MuiBox: {
      styleOverrides: {
        root: {
          '&.main-container': {
            backgroundColor: '#212121',
            minHeight: '100vh',
            color: 'white',
            padding: '24px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          '&.Mui-selected': {
            color: '#fff',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h4: {
          color: '#ffffff',
          marginBottom: '16px',
        },
      },
    },
  },
});