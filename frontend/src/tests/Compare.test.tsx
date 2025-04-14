import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Compare from '../pages/Compare';
import { weatherAPI } from '../services/api';

jest.mock('../services/api');

describe('Compare Component', () => {
  const mockReports = [
    {
      timestamp: '2024-01-01T12:00:00Z',
      temperature: 25.5,
      humidity: 80,
      pressure: 1013,
      clouds: 30
    },
    {
      timestamp: '2024-01-02T12:00:00Z',
      temperature: 26.5,
      humidity: 75,
      pressure: 1012,
      clouds: 40
    }
  ];

  beforeEach(() => {
    (weatherAPI.getReportsByDates as jest.Mock).mockResolvedValue(mockReports);
  });

  it('renders the compare form', () => {
    render(<Compare />);
    expect(screen.getByText('Compare Weather Reports')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('fetches and displays weather reports when dates are selected', async () => {
    render(<Compare />);

    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2024-01-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2024-01-02' }
    });

    fireEvent.click(screen.getByText('Compare'));

    await waitFor(() => {
      expect(weatherAPI.getReportsByDates).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-02'
      );
    });

    expect(screen.getByText('25.5')).toBeInTheDocument();
    expect(screen.getByText('26.5')).toBeInTheDocument();
  });

  it('displays loading state while fetching data', async () => {
    render(<Compare />);

    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2024-01-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2024-01-02' }
    });

    fireEvent.click(screen.getByText('Compare'));

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles errors appropriately', async () => {
    (weatherAPI.getReportsByDates as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<Compare />);

    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2024-01-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2024-01-02' }
    });

    fireEvent.click(screen.getByText('Compare'));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch weather reports')).toBeInTheDocument();
    });
  });
}); 