import {
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

export default function MasterBillForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    importer: { id: '', number: '' },
    exporter: { id: '', number: '' },
    finance: '',
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

  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:3001/users')
      .then(res => setUsers(res.data))
      .catch(console.error);
  }, []);

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
    const selectedUser = users.find((u) => u.id === userId);
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
        importer: { id: '', number: '' },
        exporter: { id: '', number: '' },
        finance: '',
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
          {/* Importer */}
          <FormControl fullWidth>
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
          />

          {/* Exporter */}
          <FormControl fullWidth>
            <InputLabel>Exporter</InputLabel>
            <Select
              value={formData.exporter.id}
              label="Exporter"
              onChange={(e) => handleSelectUser('exporter', e.target.value)}
            >
              {users.map((u) => (
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
            disabled={!!users.find((u) => u.id === formData.exporter.id)?.tin}
          />

          {/* Finance */}
          <TextField
            label="Finance"
            value={formData.finance}
            onChange={(e) => handleChange('finance', e.target.value)}
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
          <TextField
            label="Export Country"
            value={formData.consignment.exportCountry}
            onChange={(e) =>
              handleChange('consignment.exportCountry', e.target.value)
            }
          />
          <TextField
            label="Import Country"
            value={formData.consignment.importCountry}
            onChange={(e) =>
              handleChange('consignment.importCountry', e.target.value)
            }
          />
          <TextField
            label="Shipping Port"
            value={formData.consignment.shippingPort}
            onChange={(e) =>
              handleChange('consignment.shippingPort', e.target.value)
            }
          />
          <TextField
            label="Discharge Port"
            value={formData.consignment.dischargePort}
            onChange={(e) =>
              handleChange('consignment.dischargePort', e.target.value)
            }
          />
          <TextField
            label="Transport Mode"
            value={formData.consignment.transportMode}
            onChange={(e) =>
              handleChange('consignment.transportMode', e.target.value)
            }
          />

          {/* Shipment */}
          <TextField
            label="Vessel Code"
            value={formData.shipment.vesselCode}
            onChange={(e) => handleChange('shipment.vesselCode', e.target.value)}
          />
          <TextField
            label="Voyage No"
            value={formData.shipment.voyageNo}
            onChange={(e) => handleChange('shipment.voyageNo', e.target.value)}
          />
          <TextField
            label="Shipping Agent"
            value={formData.shipment.shippingAgent}
            onChange={(e) =>
              handleChange('shipment.shippingAgent', e.target.value)
            }
          />
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
