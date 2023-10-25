import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function DateSelect({ orderType, setOrderType }) {
  const handleChange = (event) => {
    setOrderType(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120, mr: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Order Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={orderType}
          label="Order date"
          onChange={handleChange}
        >
          {/* <MenuItem value="None">None</MenuItem> */}
          <MenuItem value="day">Day</MenuItem>
          {/* <MenuItem value="month">Month</MenuItem> */}
        </Select>
      </FormControl>
    </Box>
  );
}
