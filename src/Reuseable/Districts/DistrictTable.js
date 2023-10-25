import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Stack } from '@mui/material';
import DistrictModal from '../Modal/DistrictModal';

function Row({ district, openModal }) {
  const [open, setOpen] = React.useState(false);

  const edit = {
    border: '1px solid #9F3239',
    color: '#9F3239',
    transition: '1s',
    '&: hover': {
      border: '1px solid #9F3239',
      color: '#9F3239',
      transition: '1s',
    },
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {district.id}
        </TableCell>
        <TableCell align="left">{district.isAvailable ? 'Yes' : 'No'}</TableCell>
        <TableCell align="left">Rs. {district.superFastDeliveryCharge}</TableCell>
        <TableCell align="left">Rs. {district.deliveryCharge}</TableCell>
        <TableCell align="left">{district.message}</TableCell>
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography variant="h6" gutterBottom component="div">
              Pincode
            </Typography>
            <Box sx={{ margin: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row">
                {/* <Typography>632007</Typography> */}
                {district.availablePincodes.length === 0 ? 'No Pincodes' : district.availablePincodes.join(', ')}
              </Stack>
              <Button
                sx={edit}
                variant="outlined"
                onClick={() => {
                  openModal(district);
                }}
              >
                Edit
              </Button>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      })
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
};

export default function DistrictTable({ districts, openModal }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table" sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#9F3239' }}>District Name</TableCell>
            <TableCell sx={{ color: '#9F3239' }} align="left">
              Available
            </TableCell>
            <TableCell sx={{ color: '#9F3239' }} align="left">
              Super Delivery charge
            </TableCell>
            <TableCell sx={{ color: '#9F3239' }} align="left">
              Delivery charge
            </TableCell>
            <TableCell sx={{ color: '#9F3239' }} align="left">
              Message
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {districts?.map((district) => (
            <Row key={district.id} district={district} openModal={openModal} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
