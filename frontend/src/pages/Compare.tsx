import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { weatherAPI } from '../services/api';
import { WeatherReport } from '../types/weather';
import { formatFullDateTime } from '../utils/time';

const Compare = () => {
  const [firstReports, setFirstReports] = useState<WeatherReport[]>([]);
  const [secondReports, setSecondReports] = useState<WeatherReport[]>([]);
  const [firstReport, setFirstReport] = useState<WeatherReport | null>(null);
  const [secondReport, setSecondReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstFromTime, setFirstFromTime] = useState('');
  const [firstToTime, setFirstToTime] = useState('');
  const [secondFromTime, setSecondFromTime] = useState('');
  const [secondToTime, setSecondToTime] = useState('');

  const fetchReports = async (fromTime: string, toTime: string, setReports: (reports: WeatherReport[]) => void) => {
    if (!fromTime || !toTime) {
      setReports([]);
      return;
    }

    const fromDate = new Date(fromTime);
    const toDate = new Date(toTime);

    if (fromDate > toDate) {
      setError('From date must be before To date');
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await weatherAPI.getByTimeRange(fromTime, toTime);
      if (data) {
        setReports(data.data);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstDateChange = async (fromTime: string, toTime: string) => {
    setFirstFromTime(fromTime);
    setFirstToTime(toTime);
    await fetchReports(fromTime, toTime, setFirstReports);
  };

  const handleSecondDateChange = async (fromTime: string, toTime: string) => {
    setSecondFromTime(fromTime);
    setSecondToTime(toTime);
    await fetchReports(fromTime, toTime, setSecondReports);
  };

  const handleClear = () => {
    setFirstReport(null);
    setSecondReport(null);
    setFirstFromTime('');
    setFirstToTime('');
    setSecondFromTime('');
    setSecondToTime('');
    setFirstReports([]);
    setSecondReports([]);
    setError(null);
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
      <Typography variant="h4" gutterBottom>
        Compare Weather Reports
      </Typography>

      <Paper sx={{ p: 0.5, mb: 0.3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              First Report
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="From"
                value={firstFromTime}
                onChange={(e) => handleFirstDateChange(e.target.value, firstToTime)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="datetime-local"
                label="To"
                value={firstToTime}
                onChange={(e) => handleFirstDateChange(firstFromTime, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Select First Report</InputLabel>
                <Select
                  value={firstReport?.id || ''}
                  onChange={(e) => {
                    const report = firstReports.find(r => r.id === e.target.value);
                    if (report) setFirstReport(report);
                  }}
                  label="Select First Report"
                >
                  {firstReports.map((report) => (
                    <MenuItem key={report.id} value={report.id}>
                      {formatFullDateTime(report.timestamp)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Second Report
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="From"
                value={secondFromTime}
                onChange={(e) => handleSecondDateChange(e.target.value, secondToTime)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="datetime-local"
                label="To"
                value={secondToTime}
                onChange={(e) => handleSecondDateChange(secondFromTime, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Select Second Report</InputLabel>
                <Select
                  value={secondReport?.id || ''}
                  onChange={(e) => {
                    const report = secondReports.find(r => r.id === e.target.value);
                    if (report) setSecondReport(report);
                  }}
                  label="Select Second Report"
                >
                  {secondReports.map((report) => (
                    <MenuItem key={report.id} value={report.id}>
                      {formatFullDateTime(report.timestamp)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleClear}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {firstReport && secondReport && !loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="center">Report 1</TableCell>
                <TableCell align="center">Report 2</TableCell>
                <TableCell align="center">Difference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell align="center">{formatFullDateTime(firstReport.timestamp)}</TableCell>
                <TableCell align="center">{formatFullDateTime(secondReport.timestamp)}</TableCell>
                <TableCell align="center">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Temperature (°C)</TableCell>
                <TableCell align="center">{firstReport.temp.toFixed(1)}</TableCell>
                <TableCell align="center">{secondReport.temp.toFixed(1)}</TableCell>
                <TableCell align="center" sx={{ 
                  color: secondReport.temp > firstReport.temp ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {(secondReport.temp - firstReport.temp).toFixed(1)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Humidity (%)</TableCell>
                <TableCell align="center">{firstReport.humidity.toFixed(1)}</TableCell>
                <TableCell align="center">{secondReport.humidity.toFixed(1)}</TableCell>
                <TableCell align="center" sx={{ 
                  color: secondReport.humidity > firstReport.humidity ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {(secondReport.humidity - firstReport.humidity).toFixed(1)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Pressure (hPa)</TableCell>
                <TableCell align="center">{firstReport.pressure.toFixed(1)}</TableCell>
                <TableCell align="center">{secondReport.pressure.toFixed(1)}</TableCell>
                <TableCell align="center" sx={{ 
                  color: secondReport.pressure > firstReport.pressure ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {(secondReport.pressure - firstReport.pressure).toFixed(1)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cloud Cover (%)</TableCell>
                <TableCell align="center">{firstReport.clouds.toFixed(1)}</TableCell>
                <TableCell align="center">{secondReport.clouds.toFixed(1)}</TableCell>
                <TableCell align="center" sx={{ 
                  color: secondReport.clouds > firstReport.clouds ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {(secondReport.clouds - firstReport.clouds).toFixed(1)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Compare; 