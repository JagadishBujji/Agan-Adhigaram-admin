import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { collection, getDocsFromServer } from 'firebase/firestore';
import {
  Button,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { db } from '../services/firebase';
import { errorNotification } from '../utils/notification';

const formatDateTime = (ms) =>
  ms
    ? new Date(ms).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

// emails saved by the "Subscribe our newsletter" box on the website
export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDocsFromServer(collection(db, 'newsletter_subscribers'))
      .then((snapshot) =>
        setSubscribers(snapshot.docs.map((d) => d.data()).sort((a, b) => b.subscribed_at - a.subscribed_at))
      )
      .catch((e) => {
        console.log('newsletter subscribers: ', e);
        errorNotification('Could not load the subscribers, please refresh the page');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const exportSubscribers = () => {
    const rows = subscribers.map((s) => ({ Email: s.email, 'Subscribed On': formatDateTime(s.subscribed_at) }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Subscribers');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      'newsletter-subscribers.xlsx'
    );
  };

  return (
    <>
      <Helmet>
        <title> Agan Adhigaram | Newsletter </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Newsletter Subscribers ({subscribers.length})</Typography>
          <Button variant="contained" onClick={exportSubscribers} disabled={!subscribers.length}>
            Download Excel
          </Button>
        </Stack>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#F19E38' }}>Email</TableCell>
                  <TableCell sx={{ color: '#F19E38' }}>Subscribed On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.email}>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{formatDateTime(s.subscribed_at)}</TableCell>
                  </TableRow>
                ))}
                {!subscribers.length && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                      {isLoading ? 'Loading...' : 'No subscribers yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </>
  );
}
