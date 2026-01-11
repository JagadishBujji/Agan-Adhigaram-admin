import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import OrderRow from './OrderRow';

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
              <TableCell sx={{ color: '#F19E38' }} align="left">
                Book Ordered Time
              </TableCell>
            )}
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
            orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                type={type}
                updateOrders={updateOrders}
                showExtraColumns={false}
                showStatusActions={true}
                showTimeline={true}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
