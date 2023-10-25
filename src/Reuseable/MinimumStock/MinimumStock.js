import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function MinimumStock({ name, value, onChangeHandler }) {
  return (
    <FormControl>
      <FormLabel id="demo-radio-buttons-group-label" sx={{ color: '#637381' }}>
        Minimum Stock
      </FormLabel>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        // defaultValue="unlimited"
        value={value === -1 ? 'unlimited' : 'limited'}
        name={name}
        onChange={onChangeHandler}
      >
        <FormControlLabel value="unlimited" control={<Radio />} label="Unlimited" />
        <FormControlLabel value="limited" control={<Radio />} label="Limited" />
      </RadioGroup>
    </FormControl>
  );
}
