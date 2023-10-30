import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import { RecaptchaVerifier, getAuth, signInWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth';
import classes from './RegisterForm.module.css';

// ----------------------------------------------------------------------

export default function RegisterForm() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setCreds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const auth = getAuth();

  const loginHandler = () => {
    signInWithEmailAndPassword(auth, creds.email, creds.password)
      .then((userCredential) => {
        // Signed in
        const { user } = userCredential;
        navigate('/dashboard', { replace: true });
        console.log('user:', user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('signIn err:', error);
        alert(error.message);
      });
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="name" label="Name" type="text" />
        <TextField name="Phone " label="Phone Number" type="tel" />
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
        <TextField
          name="password"
          label="Confirm Password"
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
        {/* <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover" sx={{ color: '#9F3239' }}>
          Forgot password?
        </Link> */}
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
        Register
      </LoadingButton>
      <p className={classes.not}>
        Already register?{' '}
        <a href="login" className={classes.signup}>
          Sign in
        </a>
      </p>
    </>
  );
}
