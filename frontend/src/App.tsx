import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppSelector, useAppDispatch } from './hooks/useRedux';
import { checkAuth } from './store/slices/authSlice';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import History from './pages/History';
import CurrentWeather from './pages/CurrentWeather';
import Compare from './pages/Compare';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <CurrentWeather /> : <Navigate to="/login" />} />
        <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />
        <Route path="/compare" element={isAuthenticated ? <Compare /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App; 