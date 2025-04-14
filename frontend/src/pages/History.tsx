import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  TablePagination,
  Grid,
  Button,
  Container,
} from '@mui/material';
import { weatherAPI } from '../services/api';
import { WeatherReport } from '../types/weather';
import { formatToChangiTimeWithDetails } from '../utils/time';


interface FilterState {
  date: string;
  temp: string;
  humidity: string;
  pressure: string;
  clouds: string;
}

const History: React.FC = () => {
  const [reports, setReports] = useState<WeatherReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterState>({
    date: '',
    temp: '',
    humidity: '',
    pressure: '',
    clouds: ''
  });
  const [total, setTotal] = useState(0);

  const fetchHistory = async (params: any = {}) => {
    try {
      setLoading(true);
      const { data, total } = await weatherAPI.getHistory({
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
        ...params
      });
      setReports(data);
      setTotal(total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchHistory({
      date: filters.date,
      temp: filters.temp,
      humidity: filters.humidity,
      pressure: filters.pressure,
      clouds: filters.clouds
    });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchHistory({
      date: filters.date,
      temp: filters.temp,
      humidity: filters.humidity,
      pressure: filters.pressure,
      clouds: filters.clouds
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(0);
    fetchHistory({
      date: filters.date,
      temp: filters.temp,
      humidity: filters.humidity,
      pressure: filters.pressure,
      clouds: filters.clouds
    });
  };

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPage(0);
    fetchHistory({
      date: filters.date,
      temp: filters.temp,
      humidity: filters.humidity,
      pressure: filters.pressure,
      clouds: filters.clouds
    });
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      temp: '',
      humidity: '',
      pressure: '',
      clouds: ''
    });
    setPage(0);
    fetchHistory();
  };

 

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Weather History
        </Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '0.5rem' }}>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temperature (°C)"
                type="number"
                value={filters.temp}
                onChange={(e) => handleFilterChange('temp', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Humidity (%)"
                type="number"
                value={filters.humidity}
                onChange={(e) => handleFilterChange('humidity', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pressure (hPa)"
                type="number"
                value={filters.pressure}
                onChange={(e) => handleFilterChange('pressure', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cloud Cover (%)"
                type="number"
                value={filters.clouds}
                onChange={(e) => handleFilterChange('clouds', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={clearFilters} size="small">
                  Clear Filters
                </Button>
                <Button variant="contained" onClick={applyFilters} size="small">
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => handleSort('timestamp')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Changi Time {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('temp')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Temperature (°C) {sortBy === 'temp' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('pressure')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Pressure (hPa) {sortBy === 'pressure' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('humidity')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Humidity (%) {sortBy === 'humidity' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('clouds')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Cloud Cover (%) {sortBy === 'clouds' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {formatToChangiTimeWithDetails(report.timestamp)}
                    </TableCell>
                    <TableCell>{report.temp}</TableCell>
                    <TableCell>{report.pressure}</TableCell>
                    <TableCell>{report.humidity}</TableCell>
                    <TableCell>{report.clouds}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count} records`}
          />
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Showing {Math.min(page * rowsPerPage + 1, total)} to {Math.min((page + 1) * rowsPerPage, total)} of {total} records
        </Typography>
      </Box>
    </Container>
  );
};

export default History; 