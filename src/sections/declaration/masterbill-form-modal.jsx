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
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { airlines } from 'src/_mock/airlines';
import { packageTypes } from 'src/_mock/package_types';
import { ports } from 'src/_mock/ports';
import { shippingAgents } from 'src/_mock/shipping_agents';
import { vessels } from 'src/_mock/vessels';
import useDeclarationsApi from 'src/hooks/useDeclarationsApi';

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
    valuation: {
      netCost: '',
      netInsurance: '',
      netFreight: '',
    },
  });

  const [mode, setMode] = useState('AIR');
  const { users, exporters, fetchUsers, fetchExporters } = useDeclarationsApi();

  useEffect(() => {
    if (users.length === 0) fetchUsers();
    if (exporters.length === 0) fetchExporters();
  }, [users, exporters, fetchUsers, fetchExporters]);


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
    onSubmit(formData);
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
        valuation: {
          netCost: '',
          netInsurance: '',
          netFreight: '',
        },
      });
    }
  }, [open]);

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
                <TextField {...params} label="Shipping Port" variant="outlined" fullWidth />
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
              onChange={(e) => {handleChange('shipment.vesselCode', e.target.value); handleChange('shipment.voyageNo', '')}}
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
                onChange={(e) => {handleChange('shipment.voyageNo', e.target.value)}}
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

          {/* Packages */}
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
            label="Gross Weight"
            value={formData.packages.grossWt}
            onChange={(e) => handleChange('packages.grossWt', e.target.value)}
          />
          <TextField
            label="Gross Volume"
            value={formData.packages.grossVol}
            onChange={(e) => handleChange('packages.grossVol', e.target.value)}
          />
          <TextField
            label="Contents"
            value={formData.packages.contents}
            onChange={(e) => handleChange('packages.contents', e.target.value)}
          />

          {/* Valuation */}
          <TextField
            label="Net Cost"
            value={formData.valuation.netCost}
            onChange={(e) => handleChange('valuation.netCost', e.target.value)}
          />
          <TextField
            label="Net Insurance"
            value={formData.valuation.netInsurance}
            onChange={(e) =>
              handleChange('valuation.netInsurance', e.target.value)
            }
          />
          <TextField
            label="Net Freight"
            value={formData.valuation.netFreight}
            onChange={(e) =>
              handleChange('valuation.netFreight', e.target.value)
            }
          />

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
