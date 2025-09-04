import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { airlines } from 'src/_mock/airlines';
import { packageTypes } from 'src/_mock/package_types';
import { ports } from 'src/_mock/ports';
import { shippingAgents } from 'src/_mock/shipping_agents';
import { vessels } from 'src/_mock/vessels';
import useDeclarationsApi from 'src/hooks/useDeclarationsApi';
import Iconify from 'src/components/iconify';


export default function MasterBillForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    // importer: { id: '', number: '' },
    exporter: { id: '', number: '' },
    consignment: {
      departureDate: '',
      arrivalDate: '',
      exportCountry: '',
      importCountry: '',
      shippingPort: '',
      dischargePort: '',
      transportMode: '',
    },
    shipment: {
      vesselCode: '',
      voyageNo: '',
      shippingAgent: '',
      billNumber: '',
    },
    packages: {
      pkgCount: '',
      pkgType: '',
      grossWt: '',
      grossVol: '',
      contents: '',
    },
    containers: [
      {
        containerType: '',
        containerNumber: '',
        dockReceipt: '',
        marksNumbers: '',
        sealNumber: '',
        volume: '',
        weight: '',
      }
    ],
  });

  const [mode, setMode] = useState('AIR');
  const { users, exporters, fetchUsers, fetchExporters, masterBill, fetchMasterBill } = useDeclarationsApi();

  useEffect(() => {
    if (open) {
      if (users.length === 0) fetchUsers();
      if (exporters.length === 0) fetchExporters();
    }
  }, [users, exporters, fetchUsers, fetchExporters]);

  useEffect(() => {
    if (open)
      fetchMasterBill();
  }, [open])

  useEffect(() => {
    if (masterBill && open) {
      setFormData({
        exporter: masterBill.exporter || { id: '', number: '' },
        consignment: {
          departureDate: masterBill.consignment?.departureDate || '',
          arrivalDate: masterBill.consignment?.arrivalDate || '',
          exportCountry: masterBill.consignment?.exportCountry || '',
          importCountry: masterBill.consignment?.importCountry || '',
          shippingPort: masterBill.consignment?.shippingPort || '',
          dischargePort: masterBill.consignment?.dischargePort || '',
          transportMode: masterBill.consignment?.transportMode || '',
        },
        shipment: {
          vesselCode: masterBill.shipment?.vesselCode || '',
          voyageNo: masterBill.shipment?.voyageNo || '',
          shippingAgent: masterBill.shipment?.shippingAgent || '',
          billNumber: masterBill.shipment?.billNumber || '',
        },
        packages: {
          pkgCount: masterBill.packages?.pkgCount || '',
          pkgType: masterBill.packages?.pkgType || '',
          grossWt: masterBill.packages?.grossWt || '',
          grossVol: masterBill.packages?.grossVol || '',
          contents: masterBill.packages?.contents || '',
        },
        containers: masterBill.containers && masterBill.containers.length > 0
          ? masterBill.containers
          : [{
            containerType: '',
            containerNumber: '',
            dockReceipt: '',
            marksNumbers: '',
            sealNumber: '',
            volume: '',
            weight: '',
          }],
      });

      // Set the mode based on transport mode
      if (masterBill.consignment?.transportMode) {
        setMode(masterBill.consignment.transportMode);
      }
    }
  }, [masterBill, open]);


  const handleChange = (path, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSelectUser = (type, userId) => {
    const userList = type === 'importer' ? users : exporters;
    const selectedUser = userList.find((u) => u.id === userId);
    setFormData((prev) => ({
      ...prev,
      [type]: {
        id: userId,
        number: selectedUser?.tin || '',
      },
    }));
  };

  const handleSubmit = () => {
    console.log(formData)
    const containerData = [...formData.containers];
    const payload = { ...formData, containers: [] };
    containerData.forEach(container => {
      if (container.containerType !== "") {
        payload.containers.push(container)
      }
    });
    onSubmit(payload);
  };

  useEffect(() => {
    if (!open) {
      setFormData({
        // importer: { id: '', number: '' },
        exporter: { id: '', number: '' },
        consignment: {
          departureDate: '',
          arrivalDate: '',
          exportCountry: '',
          importCountry: '',
          shippingPort: '',
          dischargePort: '',
          transportMode: '',
        },
        shipment: {
          vesselCode: '',
          voyageNo: '',
          shippingAgent: '',
          billNumber: '',
        },
        packages: {
          pkgCount: '',
          pkgType: '',
          grossWt: '',
          grossVol: '',
          contents: '',
        },
        containers: [
          {
            containerType: '',
            containerNumber: '',
            dockReceipt: '',
            marksNumbers: '',
            sealNumber: '',
            volume: '',
            weight: '',
          }
        ],

      });
    }
  }, [open]);

  // Add these helper functions
  const addContainer = () => {
    setFormData(prev => ({
      ...prev,
      containers: [
        ...prev.containers,
        {
          containerType: '',
          containerNumber: '',
          dockReceipt: '',
          marksNumbers: '',
          sealNumber: '',
          volume: '',
          weight: '',
        }
      ]
    }));
  };

  const removeContainer = (index) => {
    setFormData(prev => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index)
    }));
  };

  const handleContainerChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      containers: prev.containers.map((container, i) =>
        i === index ? { ...container, [field]: value } : container
      )
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Master Bill Form</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <FormControl fullWidth>
            <InputLabel>How are the goods being transported</InputLabel>
            <Select
              value={formData.consignment.transportMode}
              label="Transport Mode"
              onChange={(e) => { setMode(e.target.value); handleChange('consignment.transportMode', e.target.value); }}
            >
              <MenuItem value="AIR">Air</MenuItem>
              <MenuItem value="SEA">Ocean</MenuItem>
            </Select>
          </FormControl>
          {/* Importer */}
          {/*  <FormControl fullWidth>
            <InputLabel>Importer</InputLabel>
            <Select
              value={formData.importer.id}
              label="Importer"
              onChange={(e) => handleSelectUser('importer', e.target.value)}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Importer Number"
            value={formData.importer.number}
            onChange={(e) => handleChange('importer.number', e.target.value)}
            disabled={!!users.find((u) => u.id === formData.importer.id)?.tin}
          /> */}

          {/* Exporter */}
          <FormControl fullWidth>
            <InputLabel>Exporter</InputLabel>
            <Select
              value={formData.exporter.id}
              label="Exporter"
              onChange={(e) => handleSelectUser('exporter', e.target.value)}
            >
              {exporters.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Exporter Number"
            value={formData.exporter.number}
            onChange={(e) => handleChange('exporter.number', e.target.value)}
            disabled={!!exporters.find((u) => u.id === formData.exporter.id)?.tin}
          />

          {/* Consignment */}
          <TextField
            label="Departure Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.consignment.departureDate}
            onChange={(e) =>
              handleChange('consignment.departureDate', e.target.value)
            }
          />
          <TextField
            label="Arrival Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.consignment.arrivalDate}
            onChange={(e) =>
              handleChange('consignment.arrivalDate', e.target.value)
            }
          />


          <FormControl fullWidth>
            <Autocomplete
              options={ports}
              filterOptions={(options, state) => {
                const filtered = options.filter((option) => {
                  if (mode === 'AIR') {
                    return option.type === 'Airport' || option.type === 'Port and Airport';
                  }
                  if (mode === 'SEA') {
                    return option.type === 'Port' || option.type === 'Port and Airport';
                  }
                  return true;
                });

                return filtered
                  .filter(
                    (option) =>
                      option.description.toLowerCase().includes(state.inputValue.toLowerCase())
                  )
                  .slice(0, 20);
              }}
              getOptionLabel={(option) => option.description}
              value={ports.find(opt => opt.code === formData.consignment.shippingPort) || null}
              onChange={(e, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  consignment: {
                    ...prev.consignment,
                    shippingPort: newValue ? newValue.code : ''
                  }
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Overseas Port" variant="outlined" fullWidth />
              )}
              disableClearable
            />


          </FormControl>

          {/* Shipment */}
          <FormControl fullWidth>
            <InputLabel>{mode === "AIR" ? "Airline" : "Vessel Name"}</InputLabel>
            <Select
              value={formData.shipment.vesselCode}
              label={mode === "AIR" ? "Airline" : "Vessel Name"}
              onChange={(e) => { handleChange('shipment.vesselCode', e.target.value); handleChange('shipment.voyageNo', '') }}
            >
              {(mode === "AIR" ? airlines : vessels).map((u) => (
                <MenuItem key={u.code} value={u.code}>
                  {mode === "AIR" ? u.name : u.description}
                </MenuItem>
              ))}

            </Select>
          </FormControl>

          {mode === "AIR" && (
            <FormControl fullWidth>
              <InputLabel>Flight Number</InputLabel>
              <Select
                value={formData.shipment.voyageNo}
                label="Select Flight"
                onChange={(e) => { handleChange('shipment.voyageNo', e.target.value) }}
              >
                {airlines.find(item => item.code === formData.shipment.vesselCode)?.flights.map((u) => (
                  <MenuItem key={u.route} value={u.number}>
                    {u.route}
                  </MenuItem>
                ))}

              </Select>
            </FormControl>
          )}

          {mode === "SEA" && (
            <TextField
              label="Voyage No"
              value={formData.shipment.voyageNo}
              onChange={(e) => handleChange('shipment.voyageNo', e.target.value)}
            />
          )}

          <FormControl fullWidth>
            <InputLabel>Shipping Agent</InputLabel>
            <Select
              value={formData.shipment.shippingAgent}
              label="Shipping Agent"
              onChange={(e) => handleChange('shipment.shippingAgent', e.target.value)}
            >
              {shippingAgents.map((u) => (
                <MenuItem key={u.code} value={u.code}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Bill Number"
            value={formData.shipment.billNumber}
            onChange={(e) => handleChange('shipment.billNumber', e.target.value)}
          />

          {/* Packages Section */}
          <Box mt={2}>
            <Divider />
            <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'text.secondary' }}>
              Package Information
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Package Count"
                value={formData.packages.pkgCount}
                onChange={(e) => handleChange('packages.pkgCount', e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Package Type</InputLabel>
                <Select
                  name="packages.pkgType"
                  value={formData.packages.pkgType}
                  onChange={(e) => handleChange('packages.pkgType', e.target.value)}
                  label="Package Type"
                >
                  {packageTypes.map((type) => (
                    <MenuItem key={type.code} value={type.code}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Weight"
                value={formData.packages.grossWt}
                onChange={(e) => handleChange('packages.grossWt', e.target.value)}
              />
              <TextField
                label="Cubic Feet"
                value={formData.packages.grossVol}
                onChange={(e) => handleChange('packages.grossVol', e.target.value)}
              />
              <TextField
                label="Contents"
                value={formData.packages.contents}
                onChange={(e) => handleChange('packages.contents', e.target.value)}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          {/* Containers Section */}
          <Box mt={2}>
            <Divider />
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Container Information
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={addContainer}
                size="small"
              >
                Add Container
              </Button>
            </Box>

            {formData.containers.map((container, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="between" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Container {index + 1}
                  </Typography>
                  {formData.containers.length > 1 && (
                    <IconButton
                      onClick={() => removeContainer(index)}
                      color="error"
                      size="small"
                    >
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  )}
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                  {/* First Row */}
                  <Box display="flex" gap={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>Container Type</InputLabel>
                      <Select
                        value={container.containerType}
                        label="Container Type"
                        onChange={(e) => handleContainerChange(index, 'containerType', e.target.value)}
                      >
                        <MenuItem value="22TC">20FT TRAILER CONTAINER (22TC)</MenuItem>
                        <MenuItem value="45BK">45FT BULK CONTAINER (45BK)</MenuItem>
                        <MenuItem value="20RF">20FT REFRIGERATED CONTAINER (20RF)</MenuItem>
                        <MenuItem value="20FF">20FT FLAT RACK PLATFORM (20FF)</MenuItem>
                        <MenuItem value="20TK">20FT TANK CONTAINER (20TK)</MenuItem>
                        <MenuItem value="20CT">20FT GENERAL PURPOSE CONTAINER (20CT)</MenuItem>
                        <MenuItem value="45RF">45FT REEFER HIGHCUBE CONTAINER (45RF)</MenuItem>
                        <MenuItem value="40TK">40FT TANK CONTAINER (40TK)</MenuItem>
                        <MenuItem value="40RF">40FT REFERIGERATED CONTAINER (40RF)</MenuItem>
                        <MenuItem value="40FF">40FT FLAT RACK PLATFORM (40FF)</MenuItem>
                        <MenuItem value="40HC">40FT HIGH CUBE CONTAINER (40HC)</MenuItem>
                        <MenuItem value="45HC">45FT HIGH CUBE CONTAINER (45HC)</MenuItem>
                        <MenuItem value="20PA">20FT REFRIGERATED CONTAINER (20PA)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Container Number"
                      value={container.containerNumber}
                      onChange={(e) => handleContainerChange(index, 'containerNumber', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  {/* Second Row */}
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Dock Receipt"
                      value={container.dockReceipt}
                      onChange={(e) => handleContainerChange(index, 'dockReceipt', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Marks and Numbers"
                      value={container.marksNumbers}
                      onChange={(e) => handleContainerChange(index, 'marksNumbers', e.target.value)}
                      sx={{ flex: 1 }}
                    />

                    <TextField
                      label="Seal Number"
                      value={container.sealNumber}
                      onChange={(e) => handleContainerChange(index, 'sealNumber', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  {/* Third Row */}
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Volume"
                      value={container.volume}
                      onChange={(e) => handleContainerChange(index, 'volume', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Weight"
                      value={container.weight}
                      onChange={(e) => handleContainerChange(index, 'weight', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Box sx={{ flex: 1 }} /> {/* Empty space for alignment */}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <Box mt={2}>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}