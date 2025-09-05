import React, { useState, useEffect } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function History() {
  const [scans, setScans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/scan/history');
      const data = await response.json();
      setScans(data);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: '#2a2a2a', borderRadius: 2, p: 3 }}>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        Scan History
      </Typography>
      {scans.map((scan) => (
        <Accordion 
          key={scan.id}
          sx={{
            bgcolor: '#1a1a1a',
            color: 'white',
            mb: 1,
            '&:before': {
              display: 'none'
            },
            '&:hover': {
              cursor: 'pointer',
              bgcolor: '#222'
            }
          }}
          onClick={() => navigate(`/detailed-report/${scan.id}`)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
            <Typography sx={{ color: '#bbb' }}>
              Scan on {new Date(scan.timestamp).toLocaleString()} - Target: {scan.target_url}
            </Typography>
          </AccordionSummary>
        </Accordion>
      ))}
    </Box>
  );
}