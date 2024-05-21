import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

const App = () => {
  const [inputDriveFolderID, setInputDriveFolderID] = useState('');
  const [outputDriveFolderID, setOutputDriveFolderID] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressLog, setProgressLog] = useState([]);
  const [excelFileLink, setExcelFileLink] = useState('');

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/folders/progress');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.message === 'Task completed') {
        setExcelFileLink(data.excelFileLink);
        setLoading(false);
      } else {
        setProgressLog((prevLog) => [...prevLog, data]);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgressLog([]);
    setExcelFileLink('');

    try {
      await axios.post('https://toplaintextbe.onrender.com/api/folders', {
        inputDriveFolderID,
        outputDriveFolderID,
      });
    } catch (error) {
      console.error('Error sending data:', error);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Google Drive Folder Selector
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box marginBottom={2}>
          <TextField
            fullWidth
            label="Input Drive Folder ID"
            value={inputDriveFolderID}
            onChange={(e) => setInputDriveFolderID(e.target.value)}
            required
          />
        </Box>
        <Box marginBottom={2}>
          <TextField
            fullWidth
            label="Output Drive Folder ID"
            value={outputDriveFolderID}
            onChange={(e) => setOutputDriveFolderID(e.target.value)}
            required
          />
        </Box>
        <Box marginBottom={2}>
          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            Submit
          </Button>
        </Box>
        {loading && (
          <Box marginBottom={2}>
            <Typography variant="h6">Processing...</Typography>
          </Box>
        )}
        <Box marginBottom={2}>
          <Typography variant="h6">Progress Log:</Typography>
          <List>
            {progressLog.map((log, index) => (
              <ListItem key={index}>
                <ListItemText primary={`Source: ${log.sourceFileName} , Destination: ${log.destinationFileName}`} />
              </ListItem>
            ))}
          </List>
        </Box>
        {excelFileLink && (
          <Box marginBottom={2}>
            <Typography variant="h6">
              <a href={excelFileLink} target="_blank" rel="noopener noreferrer">Download Excel File</a>
            </Typography>
          </Box>
        )}
      </form>
    </Container>
  );
};

export default App;
