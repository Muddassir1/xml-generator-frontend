import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import Iconify from 'src/components/iconify';
import { Autocomplete, Grid } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900, // increased width
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};


const createEmptyTariff = () => ({
  key: uuidv4(), // A unique key for React's rendering list
  isNew: true, // Flag to identify newly added tariffs
  code: '',
  desc: '',
  origin: '',
  qty: '',
  qtyUnit: '',
  cost: '',
  insurance: '',
  freight: '',
  invNumber: '',
  procedure: {
    code: '',
    importerNumber: '',
  },
});

export default function TariffFormModal({ open, onClose, onSave, existingTariffs = [], availableCodes = [] }) {
  const [tariffs, setTariffs] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      const populatedTariffs = existingTariffs.map(t => ({
        ...t,
        key: uuidv4(),
        isNew: false,
        isEditing: false,
      }));

      if (populatedTariffs.length === 0) {
        const firstNewTariff = createEmptyTariff();
        setTariffs([firstNewTariff]);
        setExpanded(firstNewTariff.key);
      } else {
        setTariffs(populatedTariffs);
        setExpanded(false);
      }
    }
  }, [open, existingTariffs]);

  const handleAccordionChange = (key) => (event, isExpanded) => {
    setExpanded(isExpanded ? key : false);
  };

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updated = [...tariffs];
    const [section, field] = name.split('.');

    if (field) {
      updated[index][section][field] = value;
    } else {
      updated[index][name] = value;
    }
    setTariffs(updated);
  };

  const handleAddTariff = () => {
    const newTariff = createEmptyTariff();
    setTariffs([...tariffs, newTariff]);
    setExpanded(newTariff.key);
  };

  const handleRemoveTariff = (key) => {
    setTariffs(tariffs.filter(t => t.key !== key));
  };

  const toggleEdit = (index) => {
    const updated = [...tariffs];
    updated[index].isEditing = !updated[index].isEditing;
    setTariffs(updated);
  };

  const handleSaveClick = () => {
    const cleaned = tariffs.map(({ key, isNew, isEditing, ...rest }) => rest);
    onSave(cleaned);
    onClose();
  };

  const handleDirectChange = (index, name, value) => {
    const updated = [...tariffs];
    const [section, field] = name.split('.');

    if (field) {
      updated[index][section][field] = value;
    } else {
      updated[index][name] = value;
    }

    setTariffs(updated);
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 4 }}>Manage Tariffs</Typography>

        {tariffs.map((tariff, index) => (
          <Accordion
            key={tariff.key}
            expanded={expanded === tariff.key}
            onChange={handleAccordionChange(tariff.key)}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0',
              mb: 2,
              overflow: 'hidden',
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                margin: 'auto',
              },
            }}
          >

            <AccordionSummary
              expandIcon={
                <Iconify
                  icon="eva:arrow-ios-downward-fill"
                  sx={{
                    fontSize: 20,
                    color: 'text.secondary',
                    transition: 'transform 0.3s ease',
                    transform: expanded === tariff.key ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              }
              sx={{
                px: 3,
                py: 2,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #f0f0f0',
                '& .MuiAccordionSummary-content': {
                  margin: 0,
                  alignItems: 'center',
                  fontWeight: 500,
                  color: 'text.primary',
                },
                '&:hover': {
                  bgcolor: '#f9fafb',
                },
              }}
            >


              <Typography sx={{ fontWeight: 600 }}>
                {`Tariff #${index + 1}${tariff.isNew ? ' (New)' : ''}`}
              </Typography>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {/*                 <IconButton onClick={(e) => { e.stopPropagation(); toggleEdit(index); }}>
                  <Iconify icon={tariff.isEditing ? 'eva:close-fill' : 'eva:edit-fill'} />
                </IconButton> */}
                <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveTariff(tariff.key); }} sx={{ color: 'error.main' }}>
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 3, py: 2 }}>
              <Box component="form">
                <Grid container spacing={2}>
                  {[
                    ['code', 'Tariff Code', 'select'],
                    ['desc', 'Description'],
                    ['origin', 'Origin Country'],
                    ['qty', 'Quantity', 'number'],
                    ['qtyUnit', 'Quantity Unit'],
                    ['cost', 'Cost', 'number'],
                    ['insurance', 'Insurance', 'number'],
                    ['freight', 'Freight', 'number'],
                    ['invNumber', 'Invoice Number'],
                    ['procedure.code', 'Procedure Code'],
                    ['procedure.importerNumber', 'Procedure Importer Number']
                  ].map(([name, label, type]) => (
                    <Grid item xs={12} sm={6} key={name}>
                      {type === 'select' ? (
                        <Autocomplete
                          options={availableCodes}
                          getOptionLabel={(option) => `${option.code} — ${option.description}`}
                          filterOptions={(options, state) =>
                            options.filter(
                              (option) =>
                                option.code.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                                option.description.toLowerCase().includes(state.inputValue.toLowerCase())
                            ).slice(0, 10)
                          }
                          value={availableCodes.find(opt => opt.code === tariff.code) || null}
                          onChange={(e, newValue) => {
                            handleDirectChange(index, 'code', newValue ? newValue.code : '');
                            handleDirectChange(index, 'desc', newValue ? newValue.description : '');
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Tariff Code" variant="outlined" fullWidth />
                          )}
                          renderOption={(props, option) => (
                            <li {...props} style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px' }}>
                              <span style={{ fontWeight: 600 }}>{option.code}</span>
                              <span style={{ fontSize: '0.85rem', color: '#555' }}>{option.description}</span>
                            </li>
                          )}
                          disableClearable
                        />


                      ) : (
                        <TextField
                          name={name}
                          label={label}
                          type={type || 'text'}
                          value={
                            name.includes('.')
                              ? tariff[name.split('.')[0]][name.split('.')[1]]
                              : tariff[name]
                          }
                          onChange={(e) => handleChange(index, e)}
                          fullWidth
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </AccordionDetails>

          </Accordion>
        ))}

        <Button startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAddTariff} sx={{ mt: 2 }}>
          Add Another Tariff
        </Button>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveClick} sx={{ ml: 2 }}>
            Save Tariffs
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}


TariffFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  existingTariffs: PropTypes.array,
  availableCodes: PropTypes.array, // 👈 add this
};

