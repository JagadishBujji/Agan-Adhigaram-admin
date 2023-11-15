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
import { Button, Stack } from '@mui/material';

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
          {order.logistics}
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
            <Typography variant="h6" gutterBottom component="div">
              Products Ordered
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
                {type === 'booked' ? (
                  <DeliveryModal orderId={order.id} />
                ) : type === 'inProgress' ? (
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
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderTable({ orders, type }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table" sx={{ minWidth: 1000 }}>
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
              In Time
            </TableCell>
            <TableCell sx={{ color: '#F19E38' }} align="left">
              Category
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
        <TableBody>{orders && orders?.map((order) => <Row key={order.id} order={order} type={type} />)}</TableBody>
      </Table>
    </TableContainer>
  );
}
