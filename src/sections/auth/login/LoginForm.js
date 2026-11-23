import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { auth, FUNCTIONS_BASE_URL } from 'src/services/firebase';

// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import {
  RecaptchaVerifier,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';
import classes from './LoginForm.module.css';
import { getUserById } from 'src/api/user';
import { errorNotification, successNotification } from 'src/utils/notification';
import { isValidEmail, isValidPassword } from 'src/utils/validation';
import { requestPasswordReset } from 'src/utils/passwordReset';

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
  const [sendingReset, setSendingReset] = useState(false);

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();
    const email = creds.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      errorNotification('Enter your email address above, then click Forgot password?');
      return;
    }
    if (sendingReset) return;
    setSendingReset(true);
    try {
      await requestPasswordReset(email, {
        baseUrl: FUNCTIONS_BASE_URL,
        fallback: (address) => sendPasswordResetEmail(auth, address),
      });
      // same answer whether or not the account exists
      successNotification(
        `If an account exists for ${email}, a password reset link has been sent. Please check your inbox and spam folder.`
      );
    } catch (err) {
      errorNotification(
        err.code === 'auth/too-many-requests'
          ? 'Too many requests. Please try again later.'
          : 'Please enter a valid email address.'
      );
    } finally {
      setSendingReset(false);
    }
  };

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
            if (result.success) {
              if (result.data.role === 'admin') {
                successNotification(result.message);
                dispatch(login(result.data))
                console.log('user',user)
                navigate('/dashboard/app', { replace: true });
              } else {
                // a customer account stayed signed in before and could open /dashboard directly;
                // the auth listener in routes.js shows the "no admin access" message
                signOut(auth);
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
        <Link
          component="button"
          type="button"
          variant="subtitle2"
          underline="hover"
          sx={{ color: '#9F3239' }}
          onClick={forgotPasswordHandler}
          disabled={sendingReset}
        >
          {sendingReset ? 'Sending...' : 'Forgot password?'}
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
