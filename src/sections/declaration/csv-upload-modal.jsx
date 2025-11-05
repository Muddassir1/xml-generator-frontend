import PropTypes from 'prop-types';
import * as React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import Iconify from '../../components/iconify';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function CsvUploadModal({ open, onClose }) {
  const [transportMode, setTransportMode] = React.useState('OCEAN');
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please select a CSV file');
      setFile(null);
    } else {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('transportMode', transportMode);

    try {
      const response = await fetch(`${API_URL}/declarations/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Successfully uploaded ${data.createdCount} declarations`);
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to show new declarations
        }, 2000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Declarations CSV</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Select Transport Mode
          </Typography>
          <RadioGroup
            row
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
          >
            <FormControlLabel value="OCEAN" control={<Radio />} label="Ocean" />
            <FormControlLabel value="AIR" control={<Radio />} label="Air" />
          </RadioGroup>
        </Box>

        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            component="label"
            htmlFor="raised-button-file"
            startIcon={<Iconify icon="eva:upload-fill" />}
          >
            Select CSV File
            <input
              id="raised-button-file"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".csv"
            />
          </Button>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpload} variant="contained" disabled={!file}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CsvUploadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};