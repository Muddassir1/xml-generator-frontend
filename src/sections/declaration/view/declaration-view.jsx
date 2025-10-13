import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import useDeclarationsApi from 'src/hooks/useDeclarationsApi';
import TableNoData from '../table-no-data';
import DeclarationTableRow from '../declaration-table-row';
import DeclarationTableHead from '../declaration-table-head';
import TableEmptyRows from '../table-empty-rows';
import DeclarationFormModal from '../declaration-form-modal';
import TariffFormModal from '../tariff-form-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';
import MasterBillForm from '../masterbill-form-modal';

// ----------------------------------------------------------------------

export default function DeclarationPage() {
  const {
    declarations,
    loading,
    availableCodes,
    saveDeclaration,
    saveTariffs,
    generateXml,
    deleteDeclaration,
    deleteDeclarations,
    fetchDeclarations
  } = useDeclarationsApi();

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('billNumber');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [tariffModalOpen, setTariffModalOpen] = useState(false);
  const [masterBillFormOpen, setMasterBillFormOpen] = useState(false);
  const [activeTariffDeclaration, setActiveTariffDeclaration] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for Air, 1 for Ocean
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = declarations.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else {
      newSelected = [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when switching tabs
  };

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      setDeleting(true);
      
      // Delete all selected declarations in one API call
      await deleteDeclarations(selected);
      
      // Clear selection and close dialog
      setSelected([]);
      setDeleteDialogOpen(false);
      
      // Refresh the current tab's declarations
      const transportMode = activeTab === 0 ? 'AIR' : 'OCEAN';
      fetchDeclarations(transportMode);
      
    } catch (error) {
      console.error('Error deleting declarations:', error);
      alert('Error deleting declarations. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelBulkDelete = () => {
    setDeleteDialogOpen(false);
  };

  // Fetch declarations when tab changes and on initial load
  useEffect(() => {
    const transportMode = activeTab === 0 ? 'AIR' : 'OCEAN';
    fetchDeclarations(transportMode);
  }, [activeTab, fetchDeclarations]);

  const handleOpenModal = (declaration = null) => {
    if (declaration) {
      setSelectedDeclaration(declaration);
      setEditMode(true);
    } else {
      // For new declarations, set transport mode based on active tab
      const transportMode = activeTab === 0 ? 'AIR' : 'OCEAN';
      setSelectedDeclaration({ transportMode });
      setEditMode(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSaveDeclaration = async (newDeclaration) => {
    try {
      await saveDeclaration(newDeclaration);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving declaration:", error);
      alert('Error saving declaration.');
    }
  };

  const handleOpenTariffModal = (declaration) => {
    setActiveTariffDeclaration(declaration);
    setTariffModalOpen(true);
  };

  const handleCloseTariffModal = () => {
    setTariffModalOpen(false);
    setActiveTariffDeclaration(null);
  };

  const handleSaveTariffs = async (declarationId, newTariffs) => {

    // Check if total tariff cost is equal to the declaration net cost
    const totalTariffCost = newTariffs.reduce((sum, tariff) => sum + parseFloat(tariff.cost), 0);
    const { netCost } = { ...activeTariffDeclaration.valuation };
    if (parseFloat(totalTariffCost) !== parseFloat(netCost)) {
      alert(`The total cost of the items should be equal to the net cost of the declaration.`);
      return;
    }
    try {
      await saveTariffs(declarationId, newTariffs);
      handleCloseTariffModal()
    } catch (error) {
      console.error("Error saving tariffs:", error);
      alert('Error saving tariffs.');
    }
  };

  const handleGenerateXml = async (data) => {
    // data contains the form data from MasterBillForm
    try {
      const blob = await generateXml(data);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'SADEntry.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to generate XML:', error);
      alert(`Failed to generate XML: ${error.message}`);
    }
  };


  const dataFiltered = applyFilter({
    inputData: declarations,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const TABLE_HEAD = [
    { id: 'billNumber', label: 'Bill Number' },
    { id: 'importerNumber', label: 'Importer' },
    { id: 'exporterNumber', label: 'Exporter' },
    { id: 'pkgCount', label: 'Pkg Count' },
    { id: 'grossWt', label: 'Gross Wt' },
    { id: 'netCost', label: 'Net Cost' },
    { id: '' },
  ];

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Declarations</Typography>
        <Box>
          {selected.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="eva:trash-2-outline" />}
              onClick={handleBulkDelete}
              sx={{ mr: 2 }}
            >
              Delete Selected ({selected.length})
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={() => setMasterBillFormOpen(true)}
            sx={{ mr: 2 }}
          >
            Generate XML
          </Button>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => handleOpenModal()}
          >
            New Declaration
          </Button>
        </Box>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="transport mode tabs">
          <Tab label="Air" />
          <Tab label="Ocean" />
        </Tabs>
      </Card>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <DeclarationTableHead
                order={order}
                orderBy={orderBy}
                rowCount={declarations.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={TABLE_HEAD}
              />
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <DeclarationTableRow
                        key={row.id}
                        row={row}
                        selected={selected.indexOf(row.id) !== -1}
                        handleClick={(event) => handleClick(event, row.id)}
                        onSaveTariffs={handleSaveTariffs}
                        onEdit={handleOpenModal}
                        onManageTariffs={() => handleOpenTariffModal(row)}
                        deleteDeclaration={deleteDeclaration}
                      />
                    ))
                )}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, declarations.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={declarations.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <DeclarationFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDeclaration}
        editData={selectedDeclaration}
        onManageTariffs={() => handleOpenTariffModal(selectedDeclaration)}
      />

      {tariffModalOpen &&
        (<TariffFormModal
          open={tariffModalOpen}
          onClose={handleCloseTariffModal}
          onSave={(tariffsData) =>
            handleSaveTariffs(activeTariffDeclaration?.id, tariffsData)
          }
          existingTariffs={activeTariffDeclaration?.items || []}
          availableCodes={availableCodes}
        />
        )
      }

      <MasterBillForm
        open={masterBillFormOpen}
        onClose={() => setMasterBillFormOpen(false)}
        onSubmit={handleGenerateXml}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelBulkDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Selected Declarations
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {selected.length} selected declaration{selected.length > 1 ? 's' : ''}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelBulkDelete} 
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmBulkDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="eva:trash-2-outline" />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
