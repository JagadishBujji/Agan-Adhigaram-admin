import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { auth } from 'src/services/firebase';

// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import { RecaptchaVerifier, getAuth, signInWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth';
import classes from './LoginForm.module.css';
import { getUserById } from 'src/api/user';
import { errorNotification, successNotification } from 'src/utils/notification';
import { isValidEmail, isValidPassword } from 'src/utils/validation';

import {login} from 'src/store/userSlice';
// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({
    email: '',
    password: '',
  });
  const dispatch=useDispatch()


  const [showPassword, setShowPassword] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setCreds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const auth = getAuth();

  const loginHandler = () => {
    const { email, password } = creds;
    if (isValidEmail(email) && isValidPassword(password)) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const { user } = userCredential;

          console.log('user:', user.uid);
          getUserById(user.uid, (result) => {
            console.log('userDetails', result);
            const role = result.data.role;
            if (result.success) {
              if (role === 'admin') {
                successNotification(result.message);
                dispatch(login(result.data))
                console.log('user',user)
                navigate('/dashboard/app', { replace: true });
              } else {
                errorNotification('You dont have access');
              }
            } else {
              errorNotification(result.err.message);
            }
          });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('signIn err:', error);
          alert(error.message);
        });
    } else {
      errorNotification('Invalid Email/Password');
      console.log('Invalid  Email/Password');
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="email" label="Email address" value={creds.email} onChange={onChangeHandler} />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={creds.password}
          onChange={onChangeHandler}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        {/* <Checkbox name="remember" label="Remember me" /> */}
        <Link variant="subtitle2" underline="hover" sx={{ color: '#9F3239' }}>
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        sx={{
          color: '#fff',
          background: '#F19E38',
          '&:hover': {
            color: '#F19E38',
            border: '1px solid #F19E38',
            background: 'transparent',
          },
        }}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        onClick={loginHandler}
      >
        Login
      </LoadingButton>
      {/* <p className={classes.not}>
        Not register in Agan Adhigaram ?{' '}
        <a href="register" className={classes.signup}>
          Sign up
        </a>
      </p> */}
    </>
  );
}
