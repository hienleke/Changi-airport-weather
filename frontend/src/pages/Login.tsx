import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setAuthenticated, setLoading, setError } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import { TextField, Button, Box, Typography, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error, isLoading } = useAppSelector((state) => state.auth);

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: string) => {
    if (newMode !== null) {
      setIsRegisterMode(newMode === 'register');
      dispatch(setError(null));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      if (isRegisterMode) {
        await authAPI.register(email, password);
        dispatch(setError(null));
        setIsRegisterMode(false); // Switch back to login mode after successful registration
      } else {
        await authAPI.login(email, password);
        dispatch(setAuthenticated(true));
        dispatch(setError(null));
        navigate('/');
      }
    } catch (error) {
      dispatch(setError(isRegisterMode ? 'Registration failed' : 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {isRegisterMode ? 'Register' : 'Login'}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={isRegisterMode ? 'register' : 'login'}
          exclusive
          onChange={handleModeChange}
          aria-label="auth mode"
        >
          <ToggleButton value="login" aria-label="login mode">
            Login
          </ToggleButton>
          <ToggleButton value="register" aria-label="register mode">
            Register
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading 
            ? (isRegisterMode ? 'Registering...' : 'Logging in...') 
            : (isRegisterMode ? 'Register' : 'Login')}
        </Button>
      </form>
    </Box>
  );
};

export default Login; 