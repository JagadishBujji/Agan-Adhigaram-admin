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
import { db } from 'src/services/firebase';

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

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {order.id}
        </TableCell>
        <TableCell align="left">{order.userDetails.name}</TableCell>
        <TableCell align="left">{order.userDetails.mobile}</TableCell>
        <TableCell align="left">{`${order.userDetails.deliveryAddress.flatStreetName}, ${order.userDetails.deliveryAddress.landmark}, ${order.userDetails.deliveryAddress.deliveryArea}, ${order.userDetails.deliveryAddress.city} - ${order.userDetails.deliveryAddress.pincode}\n(${order.userDetails.deliveryAddress.mobileNo})`}</TableCell>
        <TableCell align="left">
          {order.timestamp.toDate().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </TableCell>
        <TableCell align="left" style={{ textTransform: 'capitalize' }}>
          {order.type}
        </TableCell>
        <TableCell align="left">{order.totalProducts}</TableCell>
        <TableCell align="left">Rs. {order.price.totalPrice}</TableCell>
        <TableCell align="left" style={{ textTransform: 'uppercase' }}>
          {order.status}
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              background: '#9F3239',
              color: '#fff',
              transition: '1s',
              '&:hover': { background: '#9F3239', color: '#fff', transition: '1s' },
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography variant="h6" gutterBottom component="div">
              Products Ordered
            </Typography>
            <Stack
              sx={{ margin: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              direction="row"
            >
              <Stack direction="row">
                <Typography>
                  {order.orderedProducts
                    .map(
                      (prod) =>
                        `${prod.name} (${prod.quantity} ${prod.unit}) x ${prod.noOfItems} - Rs.${prod.totalPrice}`
                    )
                    .join(' | ')}{' '}
                  |{' '}
                  <b>
                    Delivery Fee: Rs.
                    {order.type === 'superfast' ? order.price.superFastDeliveryCharge : order.price.deliveryCharge}
                  </b>
                </Typography>
              </Stack>
            </Stack>
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
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      OB('timestamp', 'desc')
    );

    console.log('date:', formattedDate, startDate, endDate);

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
      Name: order.userDetails.name,
      Phone: order.userDetails.mobile,
      Address: `${order.userDetails.deliveryAddress.flatStreetName}, ${order.userDetails.deliveryAddress.landmark}, ${order.userDetails.deliveryAddress.deliveryArea}, ${order.userDetails.deliveryAddress.city} - ${order.userDetails.deliveryAddress.pincode}\n(${order.userDetails.deliveryAddress.mobileNo})`,
      'Ordered DateTime': order.timestamp.toDate().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      Category: order.type,
      Quantity: order.totalProducts,
      'Total Price(+ delivery fee)': `Rs. ${order.price.totalPrice}`,
      Status: order.status,
      'Ordered Products': order.orderedProducts
        .map((prod) => `${prod.name} (${prod.quantity} ${prod.unit}) x ${prod.noOfItems} - Rs.${prod.totalPrice}`)
        .join(' | '),
      'Delivery Fee': order.type === 'superfast' ? order.price.superFastDeliveryCharge : order.price.deliveryCharge,
      'Delivery Date': order.deliveredDate
        ? order.deliveredDate.toDate().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '',
      'Delivery Boy': `${order.deliveryBoyDetails.name} (${order.deliveryBoyDetails.mobile})`,
      'Cancel Date': order.cancelDate
        ? order.cancelDate.toDate().toLocaleString('en-IN', {
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

    const formattedDate = `${month}/${day}/${year}`;
    saveAs(fileData, `${formattedDate}-orders.xlsx`);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  const filteredUsers = applySortFilter(orders, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

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
                    <TableCell sx={{ color: '#9F3239' }}>Order ID</TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      User Name
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      Phone
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      Address
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      In Time
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      Category
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      Qty
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
                      Total Price
                    </TableCell>
                    <TableCell sx={{ color: '#9F3239' }} align="left">
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

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
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
