import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TableHead,
  Collapse,
  Box,
} from '@mui/material';
import OrderTabs from 'src/Reuseable/OrderTab/OrderTabs';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import OrderTable from 'src/Reuseable/OrderTab/OrderTable';
import { collection, getDocs, query, where, orderBy as OB } from 'firebase/firestore';
import { db } from '../services/firebase';
import classes from './OrderHistory.module.css';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Order Id', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

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

function Row({ order }) {
  const [open, setOpen] = useState(false);

  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {order.id}
        </TableCell>
        <TableCell align="left">{order.userDetail.name}</TableCell>
        <TableCell align="left">{order.userDetail.phone}</TableCell>
        <TableCell align="left">{`${order.userDetail.address}`}</TableCell>
        <TableCell align="left">
          {new Date(order.ordered_timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </TableCell>
        <TableCell align="left" style={{ textTransform: 'capitalize' }}>
          {order.logistics ? `${order.logistics.name}-${order.logistics.number}` : 'NIL'}
        </TableCell>
        <TableCell align="left">{order.total_qty}</TableCell>
        <TableCell align="left">Rs. {order.total_price}</TableCell>
        <TableCell align="left" style={{ textTransform: 'uppercase' }}>
          {order.status}
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              background: '#F19E38',
              color: '#fff',
              transition: '1s',
              '&:hover': { background: '#F19E38', color: '#fff', transition: '1s' },
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
                <Typography variant="h6" gutterBottom component="div">
                  Order Detail
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
                <Card sx={{ padding: '10px', mb: 1, width: '100%' }}>
                  <Typography>
                    <b className={classes.addres}>Address :</b>
                    <span>{order.userDetail.address}</span>
                  </Typography>
                  <Typography>
                    <b className={classes.addres}>Logistics :</b>
                    <span>{order.logistics ? `${order.logistics.name}-${order.logistics.number}` : 'NIL'}</span>
                  </Typography>
                  <Typography>
                    <b className={classes.addres}>Total Quantity :</b>
                    <span>{order.total_qty}</span>
                  </Typography>
                </Card>
              </Stack>
              <Table size="medium" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Genre</TableCell>
                    <TableCell align="right">Author</TableCell>
                    <TableCell align="right">Book Format</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.ordered_books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell component="th" scope="row">
                        {book.title}
                      </TableCell>
                      <TableCell>{book.genre}</TableCell>
                      <TableCell align="right">{book.author}</TableCell>
                      <TableCell align="right">{book.book_format}</TableCell>
                      <TableCell align="right">{book.item_price}</TableCell>
                      <TableCell align="right">{book.qty}</TableCell>
                      <TableCell align="right">{book.total_price}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell rowSpan={4} />
                    <TableCell rowSpan={4} />
                    <TableCell rowSpan={4} />
                    <TableCell rowSpan={4} />
                    <TableCell colSpan={2}>Subtotal</TableCell>
                    <TableCell align="right">{ccyFormat(order.total_item_price)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tax</TableCell>
                    <TableCell align="right">{`${order.tax_percentage} %`}</TableCell>
                    <TableCell align="right">{ccyFormat(order.price_tax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Delivery charge</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">{order.delivery_charge}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="right">{ccyFormat(order.total_price)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderHistroy() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

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

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
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
      // 'Delivery Boy': `${order.deliveryBoyDetails.name} (${order.deliveryBoyDetails.mobile})`,
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

  // const isNotFound = !filteredUsers.length && !!filterName;

  // console.log('isNotFound: ', isNotFound, filteredUsers.length);

  return (
    <>
      <Helmet>
        <title> Daily Meat | Orders </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Orders History
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
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
                {/* <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={orders.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                /> */}
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
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                    <Row key={order.id} order={order} />
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {filteredUsers.length <= 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            No Orders
                          </Typography>

                          {/* <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography> */}
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

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}
