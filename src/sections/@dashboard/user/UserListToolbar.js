import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment } from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import DateSelect from 'src/Reuseable/Select/DateSelect';
import DatePicker from 'src/Reuseable/Date/ResponsiveDatePickers';
import Date from 'src/Reuseable/Date/ResponsiveDatePickers';
import Datepic from 'src/Reuseable/Date/ResponsiveDatePickers';
import DatePickerOpenTo from 'src/Reuseable/Date/ResponsiveDatePickers';
import ServerRequestDatePicker from 'src/Reuseable/Date/ResponsiveDatePickers';
import ViewsDatePicker from 'src/Reuseable/Date/ResponsiveDatePickers';
import ResponsiveDatePickers from 'src/Reuseable/Date/ResponsiveDatePickers';
import ResponsiveDatePicker from 'src/Reuseable/Date/ResponsiveDatePickers';

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function UserListToolbar({
  numSelected,
  filterName,
  onFilterName,
  orderType,
  setOrderType,
  selectedDate,
  setSelectedDate,
  exportOrders,
}) {
  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'center',
      }}
    >
      {/* {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <StyledSearch
          value={filterName}
          onChange={onFilterName}
          placeholder="Search user..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      )} */}
      {/* <StyledSearch
        value={filterName}
        onChange={onFilterName}
        placeholder="Search user..."
        startAdornment={
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
          </InputAdornment>
        }
      /> */}

      <DateSelect orderType={orderType} setOrderType={setOrderType} />
      <ResponsiveDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {/* {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Excel">
          <IconButton>
            <Iconify icon="vscode-icons:file-type-excel" />
          </IconButton>
        </Tooltip>
      )} */}
      <Tooltip title="Excel">
        <IconButton onClick={exportOrders}>
          <Iconify icon="vscode-icons:file-type-excel" />
        </IconButton>
      </Tooltip>
    </StyledRoot>
  );
}
