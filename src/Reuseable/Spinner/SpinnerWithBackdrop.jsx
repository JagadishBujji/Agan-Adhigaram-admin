import { useSelector } from 'react-redux';
import { selectIsLoading } from 'src/store/userSlice';

const { Backdrop, CircularProgress } = require('@mui/material');

const SpinnerWithBackdrop = () => {
  const open = useSelector(selectIsLoading);

  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 10000 }} open={open}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default SpinnerWithBackdrop;
