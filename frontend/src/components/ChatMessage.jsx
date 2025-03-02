import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const ChatMessage = ({ message }) => {
  const theme = useTheme();
  const isUser = message.isUser;

  // Function to format text with code blocks and markdown
  const formatText = (text) => {
    if (!text) return [];

    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```)/);

    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith('```')) {
        const code = part.slice(3, -3);
        return (
          <Paper
            key={index}
            sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              my: 1,
              fontFamily: 'monospace',
              overflow: 'auto',
              '& pre': {
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }
            }}
          >
            <pre>{code}</pre>
          </Paper>
        );
      }

      // Handle bold text and line breaks
      const formattedText = part
        .split('\n')
        .map((line, i) => {
          // Handle bold text
          const boldParts = line.split(/(\*\*.*?\*\*)/);
          return (
            <React.Fragment key={i}>
              {boldParts.map((boldPart, j) => {
                if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                  return (
                    <Typography
                      key={j}
                      component="span"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {boldPart.slice(2, -2)}
                    </Typography>
                  );
                }
                return <span key={j}>{boldPart}</span>;
              })}
              {i < part.split('\n').length - 1 && <br />}
            </React.Fragment>
          );
        });

      return (
        <Typography key={index} variant="body1" component="div">
          {formattedText}
        </Typography>
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: 1
      }}
    >
      {!isUser && (
        <SmartToyIcon 
          color="primary" 
          sx={{ alignSelf: 'flex-start', mt: 1 }}
        />
      )}
      <Paper
        elevation={1}
        sx={{
          maxWidth: '80%',
          p: 2,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'white' : 'text.primary'
        }}
      >
        {formatText(message.text)}
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            mt: 1,
            opacity: 0.7
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Paper>
      {isUser && (
        <PersonIcon 
          color="primary" 
          sx={{ alignSelf: 'flex-start', mt: 1 }}
        />
      )}
    </Box>
  );
};

export default ChatMessage; 