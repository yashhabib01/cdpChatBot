import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';
import { sendMessage } from '../services/chatService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input);
      const botMessage = {
        text: response.response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // Subtract AppBar height
        position: 'relative'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
        }}
      >
        <Stack spacing={2}>
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </Stack>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2,
          display: 'flex',
          gap: 2,
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
          zIndex: 1,
          boxShadow: 3
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about CDPs..."
          disabled={isLoading}
          variant="outlined"
          size="medium"
        />
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={isLoading || !input.trim()}
          sx={{ alignSelf: 'center' }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default ChatInterface; 