import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../store/slices/authSlice';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { authAPI } from '../services/api';

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try{
      let repsonse = await authAPI.logout();
      dispatch(logout());
      navigate('/login');
    }
    catch(error){
      console.error(error);}

  };

  if (!isAuthenticated) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Changi Airport Weather
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Current Weather
          </Button>
          <Button color="inherit" component={RouterLink} to="/history">
            History
          </Button>
          <Button color="inherit" component={RouterLink} to="/compare">
            Compare
          </Button>
        </Box>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 