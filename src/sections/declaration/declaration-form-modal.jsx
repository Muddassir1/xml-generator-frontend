import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import axios from 'axios';
import { packageTypes } from 'src/_mock/package_types';
import useDeclarationsApi from 'src/hooks/useDeclarationsApi';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const initialFormData = {
  importer: { id: '', number: '' },
  exporter: { id: '', number: '' },
  billNumber: '2',
  packages: {
    pkgCount: '2',
    pkgType: '',
    grossWt: '2',
    grossVol: '2',
    contents: '2',
  },
  valuation: {
    netCost: '2',
    netInsurance: '2',
    netFreight: '2',
  },
};

export default function DeclarationFormModal({ open, onClose, onSave, editData }) {
  const [formData, setFormData] = useState(initialFormData);

  const [selectedImporter, setSelectedImporter] = useState(null);
  const [selectedExporter, setSelectedExporter] = useState(null);
  const [isNewImporter, setIsNewImporter] = useState(false);
  const [isNewExporter, setIsNewExporter] = useState(false);
  const { users, exporters, fetchUsers, fetchExporters } = useDeclarationsApi();

  useEffect(() => {
    if (users.length === 0) fetchUsers();
    if (exporters.length === 0) fetchExporters();
  }, [users, exporters, fetchUsers, fetchExporters]);

  const handleSelectImporter = (value) => {
    if (value === 'new') {
      setIsNewImporter(true);
      setSelectedImporter(null);
      setFormData(prev => ({
        ...prev,
        importer: { id: null, number: '', name: '' }
      }));
    } else {
      const user = users.find(u => u.id === value);
      setIsNewImporter(false);
      setSelectedImporter(value);
      setFormData(prev => ({
        ...prev,
        importer: { id: user?.id, number: user?.tin, name: user?.name }
      }));
    }
  };

  const handleSelectExporter = (value) => {
    if (value === 'new') {
      setIsNewExporter(true);
      setSelectedExporter(null);
      setFormData(prev => ({
        ...prev,
        exporter: { id: null, number: '', name: '' }
      }));
    } else {
      const user = exporters.find(u => u.id === value);
      setIsNewExporter(false);
      setSelectedExporter(value);
      setFormData(prev => ({
        ...prev,
        exporter: { id: user?.id, number: user?.tin, name: user?.name }
      }));
    }
  };



  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        ...initialFormData,
        ...editData,
        importer: { ...initialFormData.importer, ...editData.importer },
        exporter: { ...initialFormData.exporter, ...editData.exporter },
        packages: { ...initialFormData.packages, ...editData.packages },
        valuation: { ...initialFormData.valuation, ...editData.valuation },
      });
    } else {
      setSelectedExporter(null);
      setSelectedImporter(null);
      setIsNewExporter(false);
      setIsNewImporter(false);
      setFormData(initialFormData);
    }
  }, [editData, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const [section, field] = name.split('.');

    if (field) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (editData?.importer?.id) {
      setSelectedImporter(editData.importer.id);
    }
    if (editData?.exporter?.id) {
      setSelectedExporter(editData.exporter.id);
    }
  }, [editData]);

  const handleSaveClick = async () => {
    await onSave(formData);
    setFormData(initialFormData);
    if (isNewImporter) {
      fetchUsers();
      setIsNewImporter(false); // Reset only here
    }
    if (isNewExporter) {
      fetchExporters();
      setIsNewExporter(false); // Reset only here
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          {editData ? 'Edit Declaration' : 'Add New Declaration'}
        </Typography>
        <Stack spacing={2} mt={2}>
          <Typography variant="subtitle1">General</Typography>
          <TextField name="billNumber" label="Bill Number" value={formData.billNumber} onChange={handleChange} />
          {/* Importer Section */}
          {!isNewImporter ? (
            <>
              <FormControl fullWidth>
                <InputLabel>Importer</InputLabel>
                <Select
                  value={selectedImporter || ''}
                  label="Importer"
                  onChange={(e) => handleSelectImporter(e.target.value)}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedImporter && (
                <TextField
                  name="importer.number"
                  label="Importer TIN"
                  value={formData.importer.number || ''}
                  onChange={handleChange}
                  disabled={!!users.find(u => u.id === selectedImporter)?.tin}
                  sx={{ mt: 2 }}
                />
              )}

              <Typography
                variant="body2"
                sx={{ mt: 1, cursor: 'pointer', color: 'primary.main' }}
                onClick={() => {
                  setIsNewImporter(true);
                  setSelectedImporter(null);
                  setFormData(prev => ({
                    ...prev,
                    importer: { id: null, number: '', name: '' }
                  }));
                }}
              >
                + Add New Importer
              </Typography>
            </>
          ) : (
            <>
              <TextField
                name="importer.name"
                label="Importer Name"
                value={formData.importer.name || ''}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="importer.number"
                label="Importer TIN"
                value={formData.importer.number || ''}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <Typography
                variant="body2"
                sx={{ mt: 1, cursor: 'pointer', color: 'text.secondary' }}
                onClick={() => setIsNewImporter(false)}
              >
                ← Back to existing importers
              </Typography>
            </>
          )}

          {/* Exporter Section */}
          {!isNewExporter ? (
            <>
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel>Exporter</InputLabel>
                <Select
                  value={selectedExporter || ''}
                  label="Exporter"
                  onChange={(e) => handleSelectExporter(e.target.value)}
                >
                  {exporters.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedExporter && (
                <TextField
                  name="exporter.number"
                  label="Exporter TIN"
                  value={formData.exporter.number || ''}
                  onChange={handleChange}
                  disabled={!!exporters.find(u => u.id === selectedExporter)?.tin}
                  sx={{ mt: 2 }}
                />
              )}

              <Typography
                variant="body2"
                sx={{ mt: 1, cursor: 'pointer', color: 'primary.main' }}
                onClick={() => {
                  setIsNewExporter(true);
                  setSelectedExporter(null);
                  setFormData(prev => ({
                    ...prev,
                    exporter: { id: null, number: '', name: '' }
                  }));
                }}
              >
                + Add New Exporter
              </Typography>
            </>
          ) : (
            <>
              <TextField
                name="exporter.name"
                label="Exporter Name"
                value={formData.exporter.name || ''}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 3 }}
              />
              <TextField
                name="exporter.number"
                label="Exporter TIN"
                value={formData.exporter.number || ''}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
              <Typography
                variant="body2"
                sx={{ mt: 1, cursor: 'pointer', color: 'text.secondary' }}
                onClick={() => setIsNewExporter(false)}
              >
                ← Back to existing exporters
              </Typography>
            </>
          )}



          <Typography variant="subtitle1" mt={2}>Consignments</Typography>
          <TextField name="packages.pkgCount" label="Package Count" type="number" value={formData.packages.pkgCount} onChange={handleChange} />
          <FormControl fullWidth>
            <InputLabel>Package Type</InputLabel>
            <Select
              name="packages.pkgType"
              value={formData.packages.pkgType}
              onChange={handleChange}
              label="Package Type"
            >
              {packageTypes.map((type) => (
                <MenuItem key={type.code} value={type.code}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField name="packages.grossWt" label="Gross Weight" type="number" value={formData.packages.grossWt} onChange={handleChange} />
          <TextField name="packages.grossVol" label="Gross Volume" type="number" value={formData.packages.grossVol} onChange={handleChange} />
          <TextField name="packages.contents" label="Contents" value={formData.packages.contents} onChange={handleChange} />

          <Typography variant="subtitle1" mt={2}>Financial</Typography>
          <TextField name="valuation.netCost" label="Net Cost" type="number" value={formData.valuation.netCost} onChange={handleChange} />
          <TextField name="valuation.netInsurance" label="Net Insurance" type="number" value={formData.valuation.netInsurance} onChange={handleChange} />
          <TextField name="valuation.netFreight" label="Net Freight" type="number" value={formData.valuation.netFreight} onChange={handleChange} />

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveClick} sx={{ ml: 2 }}>
              {editData ? 'Update' : 'Save'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
}