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
import { countries } from 'src/_mock/countries';
import useDeclarationsApi from 'src/hooks/useDeclarationsApi';
import { Autocomplete } from '@mui/material';
import TariffFormModal from './tariff-form-modal';


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
  exporter: {
    id: '',
    number: '',
    name: '',
    address: '',
    city: '',
    state: '',
    postalcode: '',
    country: '',
    phone: ''
  },
  billNumber: '',
  transportMode: 'AIR', // Default to AIR
  packages: {
    pkgCount: '',
    pkgType: '',
    grossWt: '',
    grossVol: '',
    contents: '',
  },
  valuation: {
    netCost: '',
    netInsurance: '',
    netFreight: '',
  },
};

export default function DeclarationFormModal({ open, onClose, onSave, editData, onManageTariffs }) {
  const [formData, setFormData] = useState(initialFormData);

  const [selectedImporter, setSelectedImporter] = useState(null);
  const [selectedExporter, setSelectedExporter] = useState(null);
  const [isNewImporter, setIsNewImporter] = useState(false);
  const [isNewExporter, setIsNewExporter] = useState(false);
  const [isNewExporterNoTin, setIsNewExporterNoTin] = useState(false);
  const [tariffModalOpen, setTariffModalOpen] = useState(false);
  const [existingTariffs, setExistingTariffs] = useState([]);
  const [availableCodes, setAvailableCodes] = useState([]);
  const { users, exporters, fetchUsers, fetchExporters, saveTariffs } = useDeclarationsApi();

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchExporters();
      fetchAvailableCodes();
    }
  }, [open]);

  const fetchAvailableCodes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tariffs');
      setAvailableCodes(response.data || []);
    } catch (error) {
      console.error('Error fetching available codes:', error);
      setAvailableCodes([]);
    }
  };

  const handleSelectImporter = (value) => {

    if (value === 'new') {
      setIsNewImporter(true);
      setSelectedImporter(null);
      setFormData(prev => ({
        ...prev,
        importer: { id: null, number: '', name: '' }
      }));
    } else {
      const user = users.find(u => u.id === value.id);
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
      setIsNewExporterNoTin(false);
    } else {
      const user = exporters.find(u => u.id === value);
      setIsNewExporter(false);
      setSelectedExporter(value);
      setFormData(prev => ({
        ...prev,
        exporter: { id: user?.id, number: user?.tin, name: user?.name }
      }));
      // If exporter has no TIN but has address fields, show the address fields by default for editing
      const hasAddress = user && (user.address || user.city || user.state || user.postalcode || user.country || user.phone);
      const hasTin = user && !!user.tin;
      setIsNewExporterNoTin(!hasTin && !!hasAddress);
    }
  };



  // Populate form when editing
  useEffect(() => {
    if (editData) {
      // Check if this is a new declaration (only has transportMode) or existing declaration
      if (editData.id) {
        // Existing declaration - populate all data
        setFormData({
          ...initialFormData,
          ...editData,
          importer: { ...initialFormData.importer, ...editData.importer },
          exporter: { ...initialFormData.exporter, ...editData.exporter },
          packages: { ...initialFormData.packages, ...editData.packages },
          valuation: { ...initialFormData.valuation, ...editData.valuation },
          transportMode: editData.transportMode || 'AIR',
        });
        setExistingTariffs(editData.items || []);
        // If the exporter in editData has address fields but no TIN, open the address fields for editing
        const exporterHasAddress = editData.exporter && (editData.exporter.address || editData.exporter.city || editData.exporter.state || editData.exporter.postalcode || editData.exporter.country || editData.exporter.phone);
        const exporterHasTin = editData.exporter && !!editData.exporter.number;
        setIsNewExporterNoTin(!exporterHasTin && !!exporterHasAddress);
      } else {
        // New declaration - only set transport mode
        setFormData({
          ...initialFormData,
          transportMode: editData.transportMode || 'AIR',
        });
        setExistingTariffs([]);
      }
    } else {
      setSelectedExporter(null);
      setSelectedImporter(null);
      setIsNewExporter(false);
      setIsNewExporterNoTin(false);
      setIsNewImporter(false);
      setFormData(initialFormData);
      setExistingTariffs([]);
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
      setSelectedImporter(editData.importer);
    }
    if (editData?.exporter?.id) {
      setSelectedExporter(editData.exporter.id);
    }
  }, [editData]);

  const handleSaveClick = async () => {
    // Include tariffs in the data for new declarations
    const dataToSave = editData?.id
      ? formData
      : { ...formData, tariffs: existingTariffs };

    await onSave(dataToSave);
    setFormData(initialFormData);
    setExistingTariffs([]);
    if (isNewImporter) {
      fetchUsers();
      setIsNewImporter(false); // Reset only here
    }
    if (isNewExporter) {
      fetchExporters();
      setIsNewExporter(false); // Reset only here
    }
    if (isNewExporterNoTin) {
      fetchExporters();
      setIsNewExporterNoTin(false); // Reset only here
    }
  };

  const handleOpenTariffModal = () => {
    setTariffModalOpen(true);
  };

  const handleCloseTariffModal = () => {
    setTariffModalOpen(false);
  };

  const handleSaveTariffs = async (tariffsData) => {
    try {
      // Check if total tariff cost is equal to the declaration net cost
      const totalTariffCost = tariffsData.reduce((sum, tariff) => sum + parseFloat(tariff.cost || 0), 0);
      const netCost = parseFloat(formData.valuation.netCost || 0);
      const totalRounded = parseFloat(totalTariffCost.toFixed(2));
      const netRounded = parseFloat(parseFloat(netCost).toFixed(2));
      if (totalRounded !== netRounded) {
        alert(`The total cost of the items should be equal to the net cost of the declaration.`);
        return;
      }

      if (editData?.id) {
        // Update existing declaration's tariffs
        await saveTariffs(editData.id, tariffsData);
        setExistingTariffs(tariffsData);
      } else {
        // For new declarations, just store the tariffs locally
        setExistingTariffs(tariffsData);
      }

      handleCloseTariffModal();
    } catch (error) {
      console.error("Error saving tariffs:", error);
      alert('Error saving tariffs.');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            {editData ? 'Edit Declaration' : 'Add New Declaration'}
          </Typography>
          <Stack spacing={2} mt={2}>
            <Typography variant="subtitle1">General</Typography>

            {/* Transport Mode Display */}
            <Box sx={{
              p: 2,
              bgcolor: formData.transportMode === 'AIR' ? 'primary.50' : 'secondary.50',
              borderRadius: 1,
              border: 1,
              borderColor: formData.transportMode === 'AIR' ? 'primary.200' : 'secondary.200'
            }}>
              <Typography variant="body2" color="text.secondary">
                Transport Mode: <strong>{formData.transportMode === 'AIR' ? 'Air' : 'Ocean'}</strong>
              </Typography>
            </Box>

            <TextField name="billNumber" label="Bill Number" value={formData.billNumber} onChange={handleChange} />
            {/* Importer Section */}
            {!isNewImporter ? (
              <>
                <FormControl fullWidth>
                  <Autocomplete
                    value={selectedImporter || null}
                    onChange={(e, value) => handleSelectImporter(value)}
                    options={users}
                    filterOptions={(options, state) =>
                      options.filter(
                        (option) =>
                          option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                      ).slice(0, 10)
                    }
                    getOptionLabel={(option) => option.name || ''}
                    renderInput={(params) => <TextField {...params} label="Importer" />}
                  />
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
            {!isNewExporter && !isNewExporterNoTin ? (
              <>
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel>Exporter</InputLabel>
                  <Select
                    value={selectedExporter || ''}
                    label="Exporter"
                    onChange={(e) => handleSelectExporter(e.target.value)}
                  >
                    {exporters.filter(exporter => exporter.uid === selectedImporter?.id).map(user => (
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
                <Typography
                  variant="body2"
                  sx={{ mt: 1, cursor: 'pointer', color: 'primary.main' }}
                  onClick={() => {
                    setIsNewExporterNoTin(true);
                    setSelectedExporter(null);
                    setFormData(prev => ({
                      ...prev,
                      exporter: {
                        id: null,
                        number: '',
                        name: '',
                        address: '',
                        city: '',
                        state: '',
                        postalcode: '',
                        country: '',
                        phone: ''
                      }
                    }));
                  }}
                >
                  + Create Exporter (no TIN)
                </Typography>
              </>
            ) : isNewExporter ? (
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
            ) : (
              // Address Fields
              <>
                <TextField
                  name="exporter.name"
                  label="Exporter Name"
                  value={formData.exporter.name || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mt: 3 }}
                />
                <TextField
                  name="exporter.address"
                  label="Address"
                  value={formData.exporter.address || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                />
                <TextField
                  name="exporter.city"
                  label="City"
                  value={formData.exporter.city || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mt: 2 }}
                />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    name="exporter.state"
                    label="State"
                    inputProps={{ maxLength: 3 }}
                    value={formData.exporter.state || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    name="exporter.postalcode"
                    label="Postal Code"
                    value={formData.exporter.postalcode || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Country</InputLabel>
                    <Select
                      name="exporter.country"
                      value={formData.exporter.country || ''}
                      label="Country"
                      onChange={handleChange}
                    >
                      {countries.map((c) => (
                        <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    name="exporter.phone"
                    label="Phone"
                    value={formData.exporter.phone || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, cursor: 'pointer', color: 'text.secondary' }}
                  onClick={() => setIsNewExporterNoTin(false)}
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

            <Button variant="contained" onClick={handleOpenTariffModal} sx={{ mt: 2 }}>
              Manage Tariffs
            </Button>

            <Box marginTop={10} display="flex" justifyContent="flex-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveClick} sx={{ ml: 2 }}>
                {editData?.id ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>

      <TariffFormModal
        open={tariffModalOpen}
        onClose={handleCloseTariffModal}
        onSave={handleSaveTariffs}
        existingTariffs={existingTariffs}
        availableCodes={availableCodes}
      />
    </>
  );
}