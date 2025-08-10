import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import useDeclarationsApi from 'src/hooks/useDeclarationsApi';

// ----------------------------------------------------------------------

export default function DeclarationTableRow({ selected, row, handleClick, onSaveTariffs, onEdit, onManageTariffs, deleteDeclaration }) {
  const {
    id,
    importer,
    exporter,
    billNumber,
    packages,
    valuation,
    items,
  } = row;

  const [openMenu, setOpenMenu] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };


  const handleEditClick = () => {
    onEdit(row); // Call parent with full row for editing
    handleCloseMenu();
  };

  const handleDelete = async () => {
    try {
      await deleteDeclaration(row.id);
      handleCloseMenu();
    } catch (error) {
      console.error("Error deleting declaration:", error);
      alert('Error deleting the declaration.');
    }
  };


  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Typography variant="subtitle2" noWrap>
            {billNumber}
          </Typography>
        </TableCell>

        <TableCell>{importer.name}</TableCell>
        <TableCell>{exporter.name}</TableCell>
        <TableCell>{packages.pkgCount}</TableCell>
        <TableCell>{`${packages.grossWt} lbs`}</TableCell>
        <TableCell>${valuation.netCost}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openMenu}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 160 },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 1 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={onManageTariffs}>
          <Iconify icon="eva:layers-fill" sx={{ mr: 1, }} />
          Manage Tariffs
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Popover>

    </>
  );
}

DeclarationTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.any,
  handleClick: PropTypes.func,
  onSaveTariffs: PropTypes.func,
  onEdit: PropTypes.func,
  onManageTariffs: PropTypes.func,
};
