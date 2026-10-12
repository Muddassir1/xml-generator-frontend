import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { clients } from 'src/_mock/clients';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ----------------------------------------------------------------------

export default function ClientsPage() {
  const fileInputRef = useRef(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [uploadingClientId, setUploadingClientId] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [creatingOrderKey, setCreatingOrderKey] = useState(null);
  const [createdOrderKeys, setCreatedOrderKeys] = useState([]);

  const handleChooseInvoice = (clientId) => {
    setSelectedClientId(clientId);
    fileInputRef.current?.click();
  };

  const handleInvoiceSelected = async (event) => {
    const file = event.target.files?.[0];
    const clientId = selectedClientId;
    event.target.value = '';

    if (!file || !clientId) {
      setSelectedClientId(null);
      return;
    }

    setUploadingClientId(clientId);
    setUploadMessage(null);
    setInvoiceResult(null);
    setCreatedOrderKeys([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/clients/${clientId}/invoices`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload invoice');
      }

      const invoices = Array.isArray(result.invoices) ? result.invoices : [];
      setInvoiceResult({
        clientId,
        sourceFile: result.sourceFile,
        invoices,
      });
      setUploadMessage({
        severity: 'success',
        text: `Invoice uploaded successfully. ${invoices.length} order record(s) extracted.`,
      });
    } catch (error) {
      setUploadMessage({ severity: 'error', text: error.message });
    } finally {
      setUploadingClientId(null);
      setSelectedClientId(null);
    }
  };

  const handleCreateDeclaration = async (invoiceRow, orderIndex) => {
    const orderKey = `${invoiceRow.source_file}-${invoiceRow.order_number || orderIndex}`;
    setCreatingOrderKey(orderKey);
    setUploadMessage(null);

    try {
      if (!invoiceResult?.sourceFile) {
        throw new Error('The uploaded invoice filename is unavailable.');
      }

      const client = clients.find(
        (uploadedClient) => String(uploadedClient.id) === String(invoiceResult.clientId)
      );
      if (!client) {
        throw new Error('The client for this uploaded invoice could not be found.');
      }

      const billNumber = invoiceResult.sourceFile
        .replace(/^invoice_/i, '')
        .replace(/\.pdf$/i, '');
      const tariffs = (Array.isArray(invoiceRow.items) ? invoiceRow.items : []).map((item) => ({
        code: item.tariff?.code || '',
        desc: item.description || '',
        qty: '',
        cost: item.price ?? '',
        invNumber: '',
        procedureCode: '',
        procedure: { importerNumber: '' },
        qtyUnit: item.tariff?.unit || '',
        classification: item.tariff || null,
      }));

      const response = await fetch(`${API_URL}/declarations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transportMode: 'OCEAN',
          billNumber,
          importer: {
            id: client.id,
            number: client.number,
            name: client.name,
          },
          exporter: {},
          packages: {
            pkgCount: '',
            pkgType: '',
            grossWt: '',
            grossVol: '',
            contents: '',
          },
          valuation: {
            netCost: invoiceRow.grand_total_on_invoice ?? '',
            netInsurance: '',
            netFreight: '',
          },
          tariffs,
          comment: '',
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create declaration');
      }

      setCreatedOrderKeys((previous) => [...previous, orderKey]);
      setUploadMessage({ severity: 'success', text: 'Declaration created successfully.' });
    } catch (error) {
      setUploadMessage({ severity: 'error', text: error.message });
    } finally {
      setCreatingOrderKey(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Clients</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Clients</Typography>
        </Stack>

        {uploadMessage && (
          <Alert severity={uploadMessage.severity} sx={{ mb: 3 }}>
            {uploadMessage.text}
          </Alert>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleInvoiceSelected}
          hidden
        />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {clients.map((client) => (
                    <TableRow hover key={client.id}>
                      <TableCell component="th" scope="row">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                          disabled={uploadingClientId !== null}
                          onClick={() => handleChooseInvoice(client.id)}
                        >
                          {uploadingClientId === client.id ? 'Uploading...' : 'Upload Invoices'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>

        {invoiceResult && (
          <Stack spacing={2} mt={4}>
            <Typography variant="h5">Extracted Invoices</Typography>
            {invoiceResult.invoices.length ? (
              <Card>
                <Scrollbar>
                  <TableContainer sx={{ overflow: 'unset' }}>
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Source File</TableCell>
                          <TableCell>Order Number</TableCell>
                          <TableCell align="right">Grand Total</TableCell>
                          <TableCell align="right">Items</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoiceResult.invoices.map((invoiceRow, index) => {
                          const orderKey = `${invoiceResult.sourceFile}-${invoiceRow.order_index ?? index}`;
                          const itemCount = invoiceRow.items?.length ?? 0;
                          const wasCreated = createdOrderKeys.includes(orderKey);

                          return (
                            <TableRow hover key={orderKey}>
                              <TableCell>{invoiceResult.sourceFile}</TableCell>
                              <TableCell>{invoiceRow.order_number || 'Not detected'}</TableCell>
                              <TableCell align="right">
                                {invoiceRow.grand_total_on_invoice ?? 'Not detected'}
                              </TableCell>
                              <TableCell align="right">{itemCount}</TableCell>
                              <TableCell align="right">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Iconify icon="eva:plus-fill" />}
                                  disabled={creatingOrderKey !== null || wasCreated}
                                  onClick={() => handleCreateDeclaration(invoiceRow, index)}
                                >
                                  {wasCreated
                                    ? 'Declaration Created'
                                    : creatingOrderKey === orderKey
                                      ? 'Creating...'
                                      : 'Create Declaration'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>
              </Card>
            ) : (
              <Alert severity="info">No invoice orders were detected in this file.</Alert>
            )}
          </Stack>
        )}
      </Container>
    </>
  );
}