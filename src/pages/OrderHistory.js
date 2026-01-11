import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  TableHead,
} from '@mui/material';
// components
import Scrollbar from '../components/scrollbar';
// sections
import { UserListToolbar } from '../sections/@dashboard/user';
import OrderRow from 'src/Reuseable/OrderTab/OrderRow';
import { collection, getDocs, query, where, orderBy as OB } from 'firebase/firestore';
import { db } from '../services/firebase';

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function OrderHistroy() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString();

    const formattedDate = `${month}/${day}/${year}`;

    setOrderType('day');
    setSelectedDate(currentDate);

    getFilteredOrders(formattedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFilteredOrders = (formattedDate) => {
    const startDate = new Date(formattedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(formattedDate);
    endDate.setHours(23, 59, 59, 999);

    const ordersRef = collection(db, 'orders');
    const filteredQuery = query(
      ordersRef,
      where('ordered_timestamp', '>=', startDate.getTime()),
      where('ordered_timestamp', '<=', endDate.getTime()),
      OB('ordered_timestamp', 'desc')
    );

    console.log('date:', formattedDate, startDate.getTime(), endDate.getTime());

    getDocs(filteredQuery)
      .then((querySnapshot) => {
        const arr = [];
        querySnapshot.forEach((doc) => {
          arr.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        console.log('arr:', arr);
        setOrders(arr);
      })
      .catch((error) => {
        console.log('Error getting orders:', error);
      });
  };

  // Update order locally (for email resend count, etc.)
  const updateOrders = (orderId, updatedData) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, ...updatedData } : o))
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const onDataChanged = (date) => {
    setSelectedDate(date);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    const formattedDate = `${month}/${day}/${year}`;
    console.log('date:', date, formattedDate);

    getFilteredOrders(formattedDate);
  };

  const exportOrders = () => {
    const formattedData = orders.map((order) => ({
      'Order Id': order.id,
      Name: order.userDetail.name,
      Phone: order.userDetail.phone,
      Address: `${order.userDetail.address}`,
      'Ordered DateTime': new Date(order.ordered_timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      Logistics: order.logistics,
      Quantity: order.total_qty,
      'Total Price(+ delivery fee)': `Rs. ${order.total_price}`,
      Status: order.status,
      'Ordered Products': order.ordered_books
        .map((book) => `${book.title} x ${book.qty} - Rs.${book.total_price}`)
        .join(' | '),
      'Delivery Fee': order.delivery_charge,
      'Delivery Date': order.deliveredDate
        ? new Date(order.deliveredDate).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '',
      'Cancel Date': order.cancelDate
        ? new Date(order.cancelDate).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '',
      'Cancel Reason': order.cancelReason,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const fileData = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear().toString();

    const formattedDate = `${day}/${month}/${year}`;
    saveAs(fileData, `${formattedDate}-orders.xlsx`);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  const filteredUsers = applySortFilter(orders, getComparator(order, orderBy), filterName);

  return (
    <>
      <Helmet>
        <title> Agan Adhigaram | Order History </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Orders History
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={0}
            filterName={filterName}
            onFilterName={handleFilterByName}
            orderType={orderType}
            setOrderType={setOrderType}
            selectedDate={selectedDate}
            setSelectedDate={onDataChanged}
            exportOrders={exportOrders}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#F19E38' }}>Order ID</TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      User Name
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Phone
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Address
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Book Ordered Time
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Logistics
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Qty
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Total Price
                    </TableCell>
                    <TableCell sx={{ color: '#F19E38' }} align="left">
                      Status
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orderItem) => (
                    <OrderRow
                      key={orderItem.id}
                      order={orderItem}
                      updateOrders={updateOrders}
                      showExtraColumns={true}
                      showStatusActions={false}
                      showTimeline={true}
                    />
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={10} />
                    </TableRow>
                  )}
                </TableBody>

                {filteredUsers.length <= 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={10} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            No Orders
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
