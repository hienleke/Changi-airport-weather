import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { weatherAPI } from '../services/api';
import { WeatherReport } from '../types/weather';
import { formatToChangiTimeWithDetails, formatToLocalTime } from '../utils/time';


const CurrentWeather: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherReport | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weatherAtDate, setWeatherAtDate] = useState<WeatherReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentWeather = async () => {
    try {
      setLoading(true);
      const data = await weatherAPI.getCurrent();
      setCurrentWeather(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch current weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentWeather();
  }, []);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    try {
      const data = await weatherAPI.getByDate(date);
      if (Array.isArray(data)) {
        setWeatherAtDate(data);
      } else {
        setWeatherAtDate([data]); // Handle case where single report is returned
      };
      setError(null);
    } catch (err) {
      setWeatherAtDate(null);
      setError('Failed to fetch weather for selected date');
    }
  };

  const formatTime = (timestamp: string) => {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          Changi Airport Time (UTC+8): {formatToChangiTimeWithDetails(timestamp)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your Local Time: {formatToLocalTime(timestamp)}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Current Weather
        </Typography>
        <IconButton 
          onClick={fetchCurrentWeather}
          color="primary"
          sx={{ 
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white'
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Weather
            </Typography>
            {currentWeather && (
              <Box>
                <Typography>Temperature: {currentWeather.temp}°C</Typography>
                <Typography>Humidity: {currentWeather.humidity}%</Typography>
                <Typography>Pressure: {currentWeather.pressure} hPa</Typography>
                <Typography>Cloud Cover: {currentWeather.clouds}%</Typography>
                {formatTime(currentWeather.timestamp)}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weather at Specific Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            {weatherAtDate && weatherAtDate.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell align="right">Temp (°C)</TableCell>
                      <TableCell align="right">Humidity (%)</TableCell>
                      <TableCell align="right">Pressure (hPa)</TableCell>
                      <TableCell align="right">Clouds (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weatherAtDate.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {formatToChangiTimeWithDetails(report.timestamp)}
                        </TableCell>
                        <TableCell align="right">{report.temp}</TableCell>
                        <TableCell align="right">{report.humidity}</TableCell>
                        <TableCell align="right">{report.pressure}</TableCell>
                        <TableCell align="right">{report.clouds}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No weather data available for this date</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurrentWeather; 