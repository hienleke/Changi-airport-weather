# Changi Airport Weather Report System

A full-stack application for monitoring and analyzing weather data at Changi Airport.

## Features

- Real-time weather monitoring with automatic updates
- Historical weather data analysis with date range selection
- Weather data comparison between two different time periods
- User authentication and authorization with JWT
- Redis caching for improved performance
- Responsive UI with Material-UI
- Timezone-aware weather reporting (Singapore Time - UTC+8)

## Tech Stack

### Frontend
- React with TypeScript
- Redux for state management
- Material-UI for UI components
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express
- PostgreSQL for data storage
- Redis for caching and session management
- JWT for authentication
- OpenWeather API integration

## Product Flow

### Weather Data Flow
1. **Data Collection**
   - System fetches current weather data from OpenWeather API
   - Data is stored in PostgreSQL database

2. **Data Caching**
   - Current weather data is cached in Redis for 1 minutes
   - Session login user store in Redis
   - Cache invalidation occurs when new data is fetched

3. **Data Retrieval**
   - Frontend requests weather data through API endpoints
   - Backend checks Redis cache first
   - If cache miss, data is fetched from database
   - If database miss, data is fetched from OpenWeather API

### User Flow
1. **Authentication**
   - User registers/login with email and password
   - JWT token is issued and stored in Redis
   - Token is used for subsequent API requests

2. **Weather Monitoring**
   - Users can view current weather data
   - Historical data can be queried by date
   - Weather comparison between two time periods
   - All data is displayed in Singapore timezone

## Caching Mechanism

### Redis Cache Structure
```typescript
// Current Weather Cache
{
  key: 'current_weather',
  value: WeatherReport,
  ttl: 300 // 5 minutes
}

// Historical Weather Cache
{
  key: `weather:${date}`,
  value: WeatherReport[],
  ttl: 3600 // 1 hour
}

// User Session Cache
{
  key: `session:${userId}`,
  value: SessionData,
  ttl: 86400 // 24 hours
}
```

### Cache Invalidation
- Current weather cache is invalidated every 5 minutes
- Historical data cache is invalidated when new data is fetched
- User session cache is invalidated on logout
- Manual cache clearing through admin interface

## Project Structure

```
changi-weather/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── hooks/          # Custom hooks
│   └── public/             # Static files
│
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   └── tests/              # Backend tests
│
└── docker/                 # Docker configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- PostgreSQL
- Redis
- OpenWeather API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/changi-weather.git
cd changi-weather
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

3. Update environment variables:
```bash
# Backend .env
OPENWEATHER_API_KEY=your_api_key
REDIS_URL=redis://redis:6379
POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/weather
JWT_SECRET=your_jwt_secret

# Frontend .env
REACT_APP_API_URL=http://localhost:3001
```

4. Start the services using Docker:
```bash
docker-compose up --build
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

## API Documentation

### Authentication
- POST /auth/register - Register new user
- POST /auth/login - User login
- GET /auth/validate - Validate token
- POST /auth/logout - User logout

### Weather Data
- GET /weather/current - Get current weather (cached for 5 minutes)
- GET /weather/history?date=YYYY-MM-DD - Get historical data (cached for 1 hour)
- GET /weather/compare?date1=YYYY-MM-DD&date2=YYYY-MM-DD - Compare weather data

## Security Features

- JWT-based authentication with Redis session storage
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure environment variables

## Performance Optimizations

- Redis caching for weather data
- Database indexing on timestamp and weather metrics
- Efficient API response compression
- Lazy loading of components
- Memoization of expensive calculations
- Automatic cache invalidation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 