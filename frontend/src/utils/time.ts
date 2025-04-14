import moment from 'moment-timezone';

export const CHANGI_TIMEZONE = 'Asia/Singapore';

export const formatToChangiTime = (timestamp: string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return moment.utc(timestamp).tz(CHANGI_TIMEZONE).format(format);
};

export const formatToChangiTimeWithDetails = (timestamp: string): string => {
  return moment.utc(timestamp).tz(CHANGI_TIMEZONE).format('DD MMM YYYY HH:mm:ss');
};

export const formatToLocalTime = (timestamp: string): string => {
  return moment.utc(timestamp).local().format('DD MMM YYYY HH:mm:ss');
};

export const formatFullDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Singapore'
  };
  return date.toLocaleString('en-US', options);
}; 