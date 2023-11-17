import * as React from 'react';
import PropTypes from 'prop-types';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import DeliveryModal from '../Modal/DeliveryModal';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Card, Stack } from '@mui/material';
import classes from './OrderTable.module.css';

function Row({ order, type }) {
  const [open, setOpen] = React.useState(false);

  const handleDelivery = () => {
    const confirmation = window.confirm('Do you want to change the status from In-Progress to Delivered?');
    if (confirmation) {
      const deliveredDetails = doc(db, 'orders', order.id);
      updateDoc(deliveredDetails, {
        deliveredDate: new Date(),
        status: 'delivered',
      })
        .then(() => {
          alert('Successfully updated');
        })
        .catch((err) => console.log(err));
    }
  };

  const TAX_RATE = 0.07;

  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }

  function priceRow(qty, unit) {
    return qty * unit;
  }

  function createRow(desc, qty, unit) {
    const price = priceRow(qty, unit);
    return { desc, qty, unit, price };
  }

  function subtotal(items) {
    return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
  }

  const rows = [
    createRow('Paperclips (Box)', 100, 1.15),
    createRow('Paper (Case)', 10, 45.99),
    createRow('Waste Basket', 2, 17.99),
  ];

  const invoiceSubtotal = subtotal(rows);
  const invoiceTaxes = TAX_RATE * invoiceSubtotal;
  const invoiceTotal = invoiceTaxes + invoiceSubtotal;

  const booked = {
    background: '#F19E38',
    color: '#fff',
    '&:hover': {
      background: '#F19E38',
      color: '#fff',
    },
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {order.id}
        </TableCell>
        <TableCell align="left">{order.userDetail.name}</TableCell>
        <TableCell align="left">{order.userDetail.phone}</TableCell>
        {/* <TableCell align="left">{`${order.userDetail.address}`}</TableCell> */}
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
        {/* <TableCell align="left" style={{ textTransform: 'capitalize' }}>
          {order.logistics}
        </TableCell> */}
        {/* <TableCell align="left">{order.total_qty}</TableCell> */}
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

                <Button sx={booked} variant="contained">
                  Booked
                </Button>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
                <Card sx={{padding: "10px", mb: 1, width: "100%"}}>
                  <Typography>
                    <b className={classes.addres}>Address :</b><span>103, 4th street, krs nagar, katpadi - 632007</span>
                  </Typography>
                  <Typography>
                    <b className={classes.addres}>logistics :</b>
                    <span>103, 4th street, krs nagar, katpadi - 632007</span>
                  </Typography>
                  <Typography>
                    <b className={classes.addres}>Qty :</b><span>103, 4th street, krs nagar, katpadi - 632007</span>
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
                    <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tax</TableCell>
                    <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                    <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Delivery charge</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            {/* <Typography variant="h6" gutterBottom component="div">
              Products Ordered~
            </Typography>
            <Stack
              sx={{ margin: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              direction="row"
            >
              <Stack direction="row">
                <Typography>
                  {order.ordered_books
                    .map((book) => `${book.title} x ${book.qty} - Rs.${book.total_price}`)
                    .join(' | ')}{' '}
                  | <b>Delivery Fee: Rs. {order.delivery_charge}</b>
                </Typography>
              </Stack>
              <Box>
                {order.status === 'booked' ? (
                  <DeliveryModal orderId={order.id} />
                ) : order.status === 'dispatched' ? (
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#F19E38', color: '#fff' }}
                    onClick={handleDelivery}
                  >
                    Delivered
                  </Button>
                ) : (
                  ''
                )}
              </Box>
            </Stack> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderTable({ orders, type }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table" sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#F19E38' }}>Order ID</TableCell>
            <TableCell sx={{ color: '#F19E38' }} align="left">
              User Name
            </TableCell>
            <TableCell sx={{ color: '#F19E38' }} align="left">
              Phone
            </TableCell>
            {/* <TableCell sx={{ color: '#F19E38' }} align="left">
              Address
            </TableCell> */}
            <TableCell sx={{ color: '#F19E38' }} align="left">
              In Time
            </TableCell>
            {/* <TableCell sx={{ color: '#F19E38' }} align="left">
              Logistics
            </TableCell> */}
            {/* <TableCell sx={{ color: '#F19E38' }} align="left">
              Qty
            </TableCell> */}
            <TableCell sx={{ color: '#F19E38' }} align="left">
              Total Price
            </TableCell>
            <TableCell sx={{ color: '#F19E38' }} align="left">
              Status
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{orders && orders?.map((order) => <Row key={order.id} order={order} type={type} />)}</TableBody>
      </Table>
    </TableContainer>
  );
}
