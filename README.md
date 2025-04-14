# Changi Airport Weather Report System

A full-stack application for monitoring and analyzing weather data at Changi Airport.

## Features

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
token:1
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

## Setup and Running Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Redis
- OpenWeather API key

### Step 1: Environment Setup

#### Backend Setup
1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment example file:
```bash
cp .env.example .env
```

3. Configure backend `.env` file:
```plaintext
# Database Configuration
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/weather

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# OpenWeather API
OPENWEATHER_API_KEY=your_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy environment example file:
```bash
cp .env.example .env
```

3. Configure frontend `.env` file:
```plaintext
REACT_APP_API_URL=http://localhost:3001
```

### Step 2: Database and Redis Setup

1. Start PostgreSQL:
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=weather -p 5432:5432 -d postgres

# Or using local PostgreSQL
# Create database
createdb weather
```

2. Start Redis:
```bash
# Using Docker
docker run --name redis -p 6379:6379 -d redis

# Or using local Redis
# Install and start Redis service
```

### Step 3: Backend Setup and Run

1. Install dependencies:
```bash
cd backend
npm install
```

2. Build the backend:
```bash
npm run build
```

3. Start the backend server:
```bash
npm run start
```

The backend will be available at: http://localhost:3001

### Step 4: Frontend Setup and Run

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend development server:
```bash
npm run start
```

The frontend will be available at: http://localhost:3000

### Step 5: Verify Setup

1. Check backend is running:
```bash
curl http://localhost:3001/health
```

2. Check frontend is running:
- Open http://localhost:3000 in your browser
- You should see the login page

### Development Workflow

1. **Backend Development**:
```bash
cd backend
npm run dev  # For development with hot reload
```

2. **Frontend Development**:
```bash
cd frontend
npm start    # For development with hot reload
```

### Production Deployment

1. **Backend Production**:
```bash
cd backend
npm run build
npm run start
```

2. **Frontend Production**:
```bash
cd frontend
npm run build
npm run start
```

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

## Authentication and Token Management

### Token Structure
```typescript
interface JWTToken {
  userId: string;
  email: string;
  role: string;
  iat: number;    // Issued at timestamp
  exp: number;    // Expiration timestamp
}
```

### Login Flow
1. **User Login**
   - User submits email and password
   - Backend validates credentials
   - JWT token is generated with 24-hour expiration
   - Token is stored in Redis with user session data
   - Token is returned to frontend

2. **Token Storage**
   - Frontend stores localStorage
   - Token is included in Authorization header for all API requests

3. **Session Management**
   - Redis stores active sessions with user token
   - Session TTL matches token expiration

### Logout Flow
1. **User Logout**
   - Frontend calls logout endpoint
   - Backend invalidates token in Redis
   - Session data is cleared
   - Frontend clears token from memory
   - User is redirected to login page

### Security Measures
- Tokens are signed with JWT_SECRET
- Tokens include expiration timestamp
- Redis stores active sessions for quick validation
- Rate limiting on login attempts
- Password hashing with bcrypt
- HTTPS required for all requests

### Error Handling
- Invalid token: 401 Unauthorized
- Expired token: 401 Unauthorized
- Invalid credentials: 403 Forbidden
- Rate limit exceeded: 429 Too Many Requests

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.