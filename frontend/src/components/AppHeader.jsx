import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const AppHeader = () => {
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <ChatIcon sx={{ mr: 2 }} />
        <Box>
          <Typography variant="h6" component="h1">
            CDP Support Assistant
          </Typography>
          <Typography variant="subtitle2">
            Ask me anything about Segment, mParticle, Lytics, or Zeotap
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 