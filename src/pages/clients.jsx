import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { clients } from 'src/_mock/clients';

import Scrollbar from 'src/components/scrollbar';

export default function ClientsPage() {
  return (
    <>
      <Helmet>
        <title>Clients</title>
      </Helmet>

      <Container>
        <Typography variant="h4" mb={5}>
          Clients
        </Typography>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Importer ID</TableCell>
                    <TableCell>TIN</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow hover key={client.id}>
                      <TableCell component="th" scope="row">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.id}</TableCell>
                      <TableCell>{client.number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Container>
    </>
  );
}
