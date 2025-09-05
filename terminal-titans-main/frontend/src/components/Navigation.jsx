import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Returns true if current path matches (also handles /dashboard route)
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (path === '/detailed-report') {
      // Consider /detailed-report and /detailed-report/:scanId as active
      return location.pathname.startsWith('/detailed-report');
    }
    return location.pathname === path;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <Button
        variant="text"
        onClick={() => navigate('/dashboard')}
        sx={{
          color: isActive('/dashboard') ? 'white' : '#666',
          backgroundColor: isActive('/dashboard') ? '#2a2a2a' : 'transparent',
          fontWeight: isActive('/dashboard') ? 700 : 500,
          textTransform: 'none',
          fontSize: '1rem',
          px: 3,
          py: 1.5,
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: isActive('/dashboard') ? '#2a2a2a' : 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        Dashboard
      </Button>
      <Button
        variant="text"
        onClick={() => navigate('/history')}
        sx={{
          color: isActive('/history') ? 'white' : '#666',
          backgroundColor: isActive('/history') ? '#2a2a2a' : 'transparent',
          fontWeight: isActive('/history') ? 700 : 500,
          textTransform: 'none',
          fontSize: '1rem',
          px: 3,
          py: 1.5,
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: isActive('/history') ? '#2a2a2a' : 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        History
      </Button>
      <Button
        variant="text"
        onClick={() => navigate('/detailed-report')}
        sx={{
          color: isActive('/detailed-report') ? 'white' : '#666',
          backgroundColor: isActive('/detailed-report') ? '#2a2a2a' : 'transparent',
          fontWeight: isActive('/detailed-report') ? 700 : 500,
          textTransform: 'none',
          fontSize: '1rem',
          px: 3,
          py: 1.5,
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: isActive('/detailed-report') ? '#2a2a2a' : 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        Detailed Report
      </Button>
    </Box>
  );
}