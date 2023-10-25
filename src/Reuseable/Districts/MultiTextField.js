// import * as React from 'react';
// import Chip from '@mui/material/Chip';
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
// import Stack from '@mui/material/Stack';

// export default function MultiTextField({ pincodes, pincodeHandler }) {
//   return (
//     <Stack spacing={3}>
//       <Autocomplete
//         multiple
//         id="tags-outlined"
//         options={pincodes}
//         getOptionLabel={(option) => option}
//         filterSelectedOptions
//         renderInput={(params) => (
//           <TextField {...params} label="Add Pincode" onChange={pincodeHandler} name="pincodes" />
//         )}
//         fullWidth
//       />
//     </Stack>
//   );
// }
import React from 'react';
import { TextField, Chip } from '@mui/material';

const MultiTextField = ({ chips, inputValue, handleInputChange, handleKeyPress, handleDeleteChip }) => (
  <div>
    <TextField
      label="Enter pincodes"
      variant="outlined"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
    />
    <div>
      {chips.map((chip, index) => (
        <Chip key={index} label={chip} onDelete={() => handleDeleteChip(index)} style={{ margin: '0.5rem' }} />
      ))}
    </div>
  </div>
);

export default MultiTextField;
