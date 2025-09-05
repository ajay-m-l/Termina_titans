import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import History from './components/History';
import DetailedReport from './components/DetailedReport';
import ZapPage from './pages/ZapPage'; // <-- Import ZAP page

const CURRENT_USER = 'Prateek-glitch';

function App() {
  return (
    <Router>
      <Box sx={{
        bgcolor: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        minHeight: '100vh',
        color: 'white',
        width: '100vw',
        maxWidth: '100%',
        p: 0,
        m: 0,
        position: 'relative',
      }}>
        {/* Enhanced Header */}
        <Box sx={{
          px: 4,
          pt: 3,
          pb: 3,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(0,0,0,0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '100%',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  🛡️
                </Box>
                <Typography variant="h4" component="h1" sx={{
                  mb: 0,
                  background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}>
                  Pentest App
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Navigation />
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 1.5,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  👤
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {CURRENT_USER}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.2 }}>
                    Security Analyst
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Main Content */}
        <Box sx={{
          px: 4,
          py: 4,
          width: '100%',
          maxWidth: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          <Routes>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/detailed-report/:scanId" element={<DetailedReport />} />
            <Route path="/detailed-report" element={<DetailedReport />} />
            <Route path="/zap" element={<ZapPage />} /> {/* <-- Add ZAP route */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;