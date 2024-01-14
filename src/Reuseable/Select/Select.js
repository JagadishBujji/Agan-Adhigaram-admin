import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { NativeSelect } from '@mui/material';

export default function BasicSelect({ label, name, value, values, onChange, required }) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id={label}>{label}</InputLabel>
        <NativeSelect label={label} onChange={onChange} name={name} value={value} required={required}>
          <option value="">--Select--</option>
          {values?.map((val) => (
            <option value={val} key={val}>
              {val.charAt(0).toUpperCase() + val.slice(1)}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
    </Box>
  );
}
