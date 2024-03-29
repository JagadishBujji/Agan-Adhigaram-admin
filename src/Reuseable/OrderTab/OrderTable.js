import { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import ModalTwoInputs from '../Modal/ModalTwoInputs';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Card, Stack } from '@mui/material';
import { db } from '../../services/firebase';
import classes from './OrderTable.module.css';

function Row({ order, type, updateOrders }) {
  const [open, setOpen] = useState(false);

  const updateStatus = (data, status, closeModal) => {
    const confirmation = window.confirm('Are you sure to proceed?');
    if (confirmation) {
      // console.log('data: ', data, order, status);
      const orderDetail = doc(db, 'orders', order.id);
      let updatedData = {
        status,
      };
      if (status === 'dispatched') {
        updatedData.dispatched_timestamp = new Date().getTime();
      } else if (status === 'delivered') {
        updatedData.delivered_timestamp = new Date().getTime();
      }
      if (data && (data.input1 || data.input2)) {
        updatedData.logistics = {
          name: data.input1,
          number: data.input2,
        };
      }
      updateDoc(orderDetail, updatedData)
        .then(() => {
          alert('Successfully updated');
          updateOrders(order.id, updatedData);
          if (status !== 'delivered') {
            closeModal();
          }
        })
        .catch((e) => console.log(e));
    }
  };

  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }

  const dispatched = {
    background: '#F19E38',
    color: '#fff',
    '&:hover': {
      background: '#F19E38',
      color: '#fff',
    },
  };

  const delivered = {
    background: '#50C878',
    color: '#fff',
    '&:hover': {
      background: '#50C878',
      color: '#fff',
    },
  };
  function customTime(n) {
    const storeDate = new Date(n).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return storeDate;
  }

  // async function handleDeliveryBtn() {
  //   // const orderDetail = doc(db, 'orders', order.id);
  //   // const deliveryTime = { };
  //   // await updateDoc(orderDetail, deliveryTime);
  //   // updateOrders(order.id, deliveryTime);
  //   updateStatus(null, 'delivered');
  // }
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {order.id}
        </TableCell>
        <TableCell align="left">{order.userDetail.name}</TableCell>
        <TableCell align="left">{order.userDetail.phone}</TableCell>

        {type === 'booked' ? (
          <TableCell align="left">{customTime(order.ordered_timestamp)}</TableCell>
        ) : type === 'dispatched' ? (
          <TableCell align="left">{customTime(order.dispatched_timestamp)}</TableCell>
        ) : type === 'delivered' ? (
          <TableCell align="left">{customTime(order.delivered_timestamp)}</TableCell>
        ) : type === 'cancelled' ? (
          <TableCell sx={{ color: '#F19E38' }} align="left">
            {customTime(order.dispatched_timestamp)}
          </TableCell>
        ) : (
          <>
            <TableCell align="left">{customTime(order.ordered_timestamp)}</TableCell>
          </>
        )}

        {/* <TableCell align="left">
          {new Date(order.ordered_timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </TableCell> */}
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

                {order.status === 'booked' ? (
                  <ModalTwoInputs
                    title="Logistics Details"
                    btnTitle="Dispatched"
                    label1="Logistic Name"
                    label2="Logistic Number (Tracking No.)"
                    updateOrders={updateOrders}
                    order={order}
                    handleSubmit={(inputs, closeModal) => {
                      updateStatus(inputs, 'dispatched', closeModal);
                    }}
                  />
                ) : order.status === 'dispatched' ? (
                  <Button sx={delivered} variant="contained" onClick={() => updateStatus(null, 'delivered')}>
                    Delivered
                  </Button>
                ) : null}
              </Stack>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
                  <Card sx={{ padding: '10px', mb: 1, width: '100%' }}>
                    <Typography>
                      <b className={classes.addres}>Address :</b>
                      <span>{`${order.userDetail.address}, ${order.userDetail.city}, ${order.userDetail.state}, ${order.userDetail.country} - ${order.userDetail.pincode}`}</span>
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
                <>
                  <div>
                    <div className="row">
                      <div className={`col-12 col-md-10 ${classes.hhGrayBox} ${classes.pt45} ${classes.pb20} `}>
                        <div className={classes.container}>
                          <div className={`${classes.orderTracking} ${classes.completed}`}>
                            <span className={classes.isComplete}></span>
                            <p>
                              Ordered <br />
                              <span>{customTime(order.ordered_timestamp)}</span>
                            </p>
                          </div>
                          <div
                            className={`${classes.orderTracking} ${
                              order.status === 'dispatched' && classes.completed
                            } ${order.status === 'delivered' && classes.completed}`}
                          >
                            <span className={classes.isComplete}></span>
                            <p>
                              Dispatched <br />
                              <span>{order.dispatched_timestamp ? customTime(order.dispatched_timestamp) : ''}</span>
                            </p>
                          </div>
                          <div
                            className={`${classes.orderTracking} ${order.status === 'delivered' && classes.completed} `}
                          >
                            <span className={classes.isComplete}></span>
                            <p>
                              Delivered <br />
                              <span>{order.delivered_timestamp ? customTime(order.delivered_timestamp) : ''}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </div>
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
                      {console.log('book in order', book)}
                      <TableCell component="th" scope="row">
                        {book.title}({book.title_tamil})
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
            {/* {order.status === 'booked' ? (
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
                )} */}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderTable({ orders, type, updateOrders }) {
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
            {type === 'booked' ? (
              <TableCell sx={{ color: '#F19E38' }} align="left">
                Book Ordered Time
              </TableCell>
            ) : type === 'dispatched' ? (
              <TableCell sx={{ color: '#F19E38' }} align="left">
                Book Dispatched Time
              </TableCell>
            ) : type === 'delivered' ? (
              <TableCell sx={{ color: '#F19E38' }} align="left">
                Book Delivered Time
              </TableCell>
            ) : type === 'cancelled' ? (
              <TableCell sx={{ color: '#F19E38' }} align="left">
                Book Cancelled Time
              </TableCell>
            ) : (
              <>
                <TableCell sx={{ color: '#F19E38' }} align="left">
                  Book Ordered Time
                </TableCell>
              </>
            )}
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
        <TableBody>
          {orders &&
            orders?.map((order) => <Row key={order.id} order={order} type={type} updateOrders={updateOrders} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
