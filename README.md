# Emergency Response System

A real-time emergency response system with vehicle dispatch using Node.js, Express, React, and MongoDB.

## Architecture

```
react-emergency-system/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── config.js    # Configuration (API URL, map settings)
│   │   └── App.jsx      # Main app component
│   ├── .env.example     # Environment variables template
│   └── package.json
├── server/              # Node.js/Express backend
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.IO configuration
│   ├── .env.example     # Environment variables template
│   └── package.json
├── .gitignore           # Global git ignore rules
└── README.md            # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- OpenRouteService API key

## Setup Instructions

### 1. Backend Setup

```bash
cd server

# Copy environment file and fill in your credentials
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

**Required environment variables:**
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `ORS_API_KEY`: OpenRouteService API key for routing
- `ALLOWED_ORIGINS`: Comma-separated CORS allowed origins (default: http://localhost:3000,http://localhost:5000)
- `NODE_ENV`: Environment (development/production)

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### 2. Frontend Setup

```bash
cd client

# Copy environment file
cp .env.example .env

# Edit .env if needed (for different API URL or map coordinates)
```

**Optional environment variables:**
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)
- `REACT_APP_DEFAULT_LAT`: Default map latitude (default: 17.385)
- `REACT_APP_DEFAULT_LNG`: Default map longitude (default: 78.4867)
- `REACT_APP_DEFAULT_ZOOM`: Map zoom level (default: 13)

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Build for production
npm run build
```

## API Endpoints

### Requests
- `POST /api/request-emergency` - Create emergency request
- `POST /api/cancel-request/:id` - Cancel a request
- `GET /api/vehicles` - Get all vehicles

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles/update-status/:id` - Update vehicle status

## Security Notes

⚠️ **Never commit .env files to version control!**

The project includes `.gitignore` rules to prevent accidental commits:
- Environment files (.env, .env.local, etc.)
- Dependencies (node_modules)
- Build artifacts

## Features

- ✅ Real-time vehicle dispatch
- ✅ Live vehicle tracking on map
- ✅ Multiple emergency types (ambulance, police, fire)
- ✅ ETA calculation
- ✅ Route visualization
- ✅ Admin dashboard for vehicle status management

## Troubleshooting

### "Cannot GET /admin"
This is expected. The routing is based on URL pathname checking. Use direct links:
- Home: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`

### API Connection Issues
1. Check that backend is running on the configured port
2. Verify `REACT_APP_API_URL` in client `.env` matches backend port
3. Check `ALLOWED_ORIGINS` in server `.env` includes client URL

### Database Connection Failed
1. Verify MongoDB connection string is correct
2. Check IP whitelist in MongoDB Atlas
3. Ensure MongoDB credentials are accurate

## Development

### Running Tests
Currently no test suite configured. Tests can be added via:
```bash
npm test
```

### Code Quality
- Use consistent file extensions (.jsx for React components)
- All configurations should use environment variables
- API URLs should be imported from `config.js`
- Map coordinates should use config constants

## License

ISC
