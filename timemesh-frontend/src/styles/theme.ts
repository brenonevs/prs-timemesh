import { createTheme } from '@mui/material/styles';

// Obtendo as cores das variáveis de ambiente
const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || '#1976d2';
const secondaryColor = import.meta.env.VITE_SECONDARY_COLOR || '#9c27b0';

export const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: secondaryColor,
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
}); 