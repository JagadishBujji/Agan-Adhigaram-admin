import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Button, Card, Stack, Chip, Tooltip, CircularProgress } from '@mui/material';
import { db } from '../../services/firebase';
import { successNotification, errorNotification } from '../../utils/notification';
import ModalTwoInputs from '../Modal/ModalTwoInputs';
import classes from './OrderTable.module.css';

// API base URL for Cloud Functions
const API_BASE_URL = 'https://us-central1-agan-adhigaram.cloudfunctions.net';

// Status color mapping
const statusColors = {
  booked: { bg: '#F19E38', label: 'BOOKED' },
  dispatched: { bg: '#2196F3', label: 'DISPATCHED' },
  delivered: { bg: '#4CAF50', label: 'DELIVERED' },
  cancelled: { bg: '#F44336', label: 'CANCELLED' },
};

/**
 * Reusable Order Row Component
 * @param {Object} order - The order data
 * @param {string} type - Order type filter (booked, dispatched, delivered, cancelled)
 * @param {Function} updateOrders - Callback to update order in parent state
 * @param {boolean} showExtraColumns - Show Address, Logistics, Qty columns in main row
 * @param {boolean} showStatusActions - Show status update buttons (Dispatched/Delivered)
 * @param {boolean} showTimeline - Show order tracking timeline
 */
export default function OrderRow({
  order,
  type,
  updateOrders,
  showExtraColumns = false,
  showStatusActions = true,
  showTimeline = true,
}) {
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Format currency
  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }

  // Format timestamp
  function customTime(n) {
    if (!n) return '';
    return new Date(n).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Copy Order ID to clipboard
  const handleCopyOrderId = () => {
    navigator.clipboard
      .writeText(order.id)
      .then(() => {
        successNotification('Order ID copied to clipboard!');
      })
      .catch(() => {
        errorNotification('Failed to copy Order ID');
      });
  };

  // Download Invoice PDF
  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/downloadInvoice?orderId=${order.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download invoice');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      successNotification('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      errorNotification(error.message || 'Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  // Resend Invoice Email
  const handleResendInvoice = async () => {
    const confirmation = window.confirm(`Resend invoice email to ${order.userDetail.email}?`);
    if (!confirmation) return;

    setIsResending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resendInvoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invoice');
      }
      successNotification(`Invoice sent to ${data.sentTo}`);
      // Update local order data to reflect the resend
      if (updateOrders) {
        updateOrders(order.id, {
          invoiceResentAt: Date.now(),
          invoiceResentCount: data.resentCount,
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
      errorNotification(error.message || 'Failed to resend invoice');
    } finally {
      setIsResending(false);
    }
  };

  // Update order status
  const updateStatus = (data, status, closeModal) => {
    const confirmation = window.confirm('Are you sure to proceed?');
    if (confirmation) {
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
          if (updateOrders) {
            updateOrders(order.id, updatedData);
          }
          if (status !== 'delivered' && closeModal) {
            closeModal();
          }
        })
        .catch((e) => console.log(e));
    }
  };

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

  // Determine which timestamp to show based on type
  const getDisplayTime = () => {
    if (type === 'booked') return customTime(order.ordered_timestamp);
    if (type === 'dispatched') return customTime(order.dispatched_timestamp);
    if (type === 'delivered') return customTime(order.delivered_timestamp);
    if (type === 'cancelled') return customTime(order.dispatched_timestamp);
    return customTime(order.ordered_timestamp);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* Order ID with Copy Button */}
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.id.slice(0, 8)}...</span>
            <Tooltip title="Copy Order ID">
              <IconButton size="small" onClick={handleCopyOrderId} sx={{ padding: '2px' }}>
                <ContentCopyIcon sx={{ fontSize: 16, color: '#666' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>

        {/* User Name */}
        <TableCell align="left">{order.userDetail.name}</TableCell>

        {/* Phone */}
        <TableCell align="left">{order.userDetail.phone}</TableCell>

        {/* Extra Columns for OrderHistory */}
        {showExtraColumns && <TableCell align="left">{order.userDetail.address}</TableCell>}

        {/* Time */}
        <TableCell align="left">{getDisplayTime()}</TableCell>

        {/* Extra Columns for OrderHistory */}
        {showExtraColumns && (
          <TableCell align="left" style={{ textTransform: 'capitalize' }}>
            {order.logistics ? `${order.logistics.name}-${order.logistics.number}` : 'NIL'}
          </TableCell>
        )}
        {showExtraColumns && <TableCell align="left">{order.total_qty}</TableCell>}

        {/* Total Price */}
        <TableCell align="left">Rs. {order.total_price}</TableCell>

        {/* Status Chip */}
        <TableCell align="left">
          <Chip
            label={statusColors[order.status]?.label || order.status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: statusColors[order.status]?.bg || '#888',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </TableCell>

        {/* Expand Button */}
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

      {/* Expanded Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={showExtraColumns ? 12 : 8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
                <Typography variant="h6" gutterBottom component="div">
                  Order Detail
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Download Invoice Button */}
                  {order.status !== 'cancelled' && (
                    <Tooltip title="Download Invoice">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />}
                        onClick={handleDownloadInvoice}
                        disabled={isDownloading}
                        sx={{
                          borderColor: '#9C27B0',
                          color: '#9C27B0',
                          '&:hover': { borderColor: '#7B1FA2', backgroundColor: 'rgba(156, 39, 176, 0.04)' },
                        }}
                      >
                        Invoice
                      </Button>
                    </Tooltip>
                  )}

                  {/* Email Status Chip */}
                  {order.status !== 'cancelled' && (
                    <Tooltip title={order.isConfirmationEmailSent ? 'Email sent successfully' : 'Email not sent'}>
                      <Chip
                        icon={order.isConfirmationEmailSent ? <CheckCircleIcon /> : <CancelIcon />}
                        label={order.isConfirmationEmailSent ? 'Email Sent' : 'Not Sent'}
                        size="small"
                        sx={{
                          backgroundColor: order.isConfirmationEmailSent ? '#E8F5E9' : '#FFEBEE',
                          color: order.isConfirmationEmailSent ? '#2E7D32' : '#C62828',
                          '& .MuiChip-icon': {
                            color: order.isConfirmationEmailSent ? '#2E7D32' : '#C62828',
                          },
                        }}
                      />
                    </Tooltip>
                  )}

                  {/* Resend Email Button */}
                  {order.status !== 'cancelled' && (
                    <Tooltip title={`Resend invoice to ${order.userDetail.email}`}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={isResending ? <CircularProgress size={16} /> : <EmailIcon />}
                        onClick={handleResendInvoice}
                        disabled={isResending}
                        sx={{
                          borderColor: '#1976D2',
                          color: '#1976D2',
                          '&:hover': { borderColor: '#1565C0', backgroundColor: 'rgba(25, 118, 210, 0.04)' },
                        }}
                      >
                        {order.invoiceResentCount ? `Resend (${order.invoiceResentCount})` : 'Resend'}
                      </Button>
                    </Tooltip>
                  )}

                  {/* Status Action Buttons */}
                  {showStatusActions && order.status === 'booked' && (
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
                  )}
                  {showStatusActions && order.status === 'dispatched' && (
                    <Button sx={delivered} variant="contained" onClick={() => updateStatus(null, 'delivered')}>
                      Delivered
                    </Button>
                  )}
                </Stack>
              </Stack>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
                  <Card sx={{ padding: '10px', mb: 1, width: '100%' }}>
                    <Typography>
                      <b className={classes.addres}>Address :</b>
                      <span>
                        {order.userDetail.address}
                        {order.userDetail.city && `, ${order.userDetail.city}`}
                        {order.userDetail.state && `, ${order.userDetail.state}`}
                        {order.userDetail.country && `, ${order.userDetail.country}`}
                        {order.userDetail.pincode && ` - ${order.userDetail.pincode}`}
                      </span>
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

                {/* Order Tracking Timeline */}
                {showTimeline && (
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
                          <div className={`${classes.orderTracking} ${order.status === 'delivered' && classes.completed}`}>
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
                )}
              </div>

              {/* Ordered Books Table */}
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
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
