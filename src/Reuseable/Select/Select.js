import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect({ label, name, values, value, onChange }) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select value={value} label={label} onChange={onChange} name={name}>
          {values?.map((val) => (
            <MenuItem value={val.value} key={val.value}>
              {val.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
