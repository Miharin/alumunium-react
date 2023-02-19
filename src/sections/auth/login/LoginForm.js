import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  // Link,
  Stack,
  IconButton,
  InputAdornment,
  TextField,
  // Checkbox
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// components
import Iconify from 'components/iconify';
import { useAuth } from 'store/index';

const auth = getAuth();
// ----------------------------------------------------------------------

export default function LoginForm() {
  const authState = useAuth((state) => state.auth);
  const setAuth = useAuth((state) => state.setAuth);
  const setUserCred = useAuth((state) => state.setUserCred);
  const setErrorCode = useAuth((state) => state.setErrorCode);
  const setErrorMessage = useAuth((state) => state.setErrorMessage);

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    signInWithEmailAndPassword(auth, authState.Username, authState.Password)
      .then((userCredential) => {
        // Signed in
        setUserCred(userCredential.user);
        navigate('/dashboard', { replace: true });
        // ...
      })
      .catch((error) => {
        setErrorCode(error.code);
        setErrorMessage(error.message);
      });

    // navigate('/dashboard', { replace: true });
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="Username" label="Username" onChange={(event) => setAuth(event.target)} />

        <TextField
          name="Password"
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
          onChange={(event) => setAuth(event.target)}
        />
      </Stack>

      <LoadingButton sx={{ mt: 5 }} fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
