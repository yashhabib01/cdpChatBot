import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import AppHeader from './components/AppHeader';
import ChatInterface from './components/ChatInterface';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <ChatInterface />
      </Container>
    </ThemeProvider>
  );
}

export default App;
