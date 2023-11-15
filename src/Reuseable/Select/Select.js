import * as React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect } from 'react';
import { db } from 'src/services/firebase';
import { useState } from 'react';
import { NativeSelect } from '@mui/material';

export default function BasicSelect({ label, name,  value, onChange }) {
  const [genres, setGenres] = useState();
  // const [genre,setGenre]=useState(value);
  console.log("value",value)
  useEffect(() => {
    const getGenreData = async () => {
      const docRef = doc(db, 'app', 'meta');
      const docSnap = await getDoc(docRef);
      const genreInfo = docSnap.data().genre;
      console.log("valueInfo",genreInfo,value)
      setGenres(genreInfo);
    };
    getGenreData();
  }, []);

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <NativeSelect  label={label} onChange={onChange} name={name} defaultValue={value}>
         {genres?.map((val) => (
            <option value={val} key={val}>
              {val.charAt(0).toUpperCase() + val.slice(1)}
              {/* {val} */}
            </option>
          ))}
         
          {/* {genres?.map((val,key)=>(
            <option value={val} key={val}>{val}</option>
           
            // <option value="humour">Humour</option>
            // <option value='horror'>Horror</option>
          ))} */}
          

        </NativeSelect>
        
      </FormControl>
    </Box>
  );
}
