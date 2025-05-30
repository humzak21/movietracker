# Movie Tracker - Full-Stack Application

A modern, interactive movie tracking application built with React frontend and Node.js backend, deployed on Railway.

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd movietracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:backend
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp .env.example backend/.env
   ```
   
   Fill in your actual values in both `.env` files:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `TMDB_API_KEY` - Your TMDB API key

4. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

## 🚂 Railway Deployment

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Manual Deployment

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Connect your GitHub repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your movie tracker repository

3. **Configure environment variables**
   
   In Railway dashboard, go to your project → Variables tab and add:
   
   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   TMDB_API_KEY=your_tmdb_api_key
   FRONTEND_URL=https://your-app-name.railway.app
   ```

4. **Deploy**
   - Railway will automatically detect the Node.js app
   - It will run `npm run start:production` which builds the frontend and starts the backend
   - Your app will be available at `https://your-app-name.railway.app`

### Environment Variables Setup

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` for Railway | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `TMDB_API_KEY` | The Movie Database API key | ✅ |
| `FRONTEND_URL` | Your Railway app URL (for CORS) | ✅ |

## 🏗️ Project Structure

```
movietracker/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── backend/               # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── config/           # Configuration files
├── public/               # Static assets
├── dist/                 # Built frontend (generated)
├── railway.json          # Railway configuration
├── Procfile              # Process configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build frontend for production
- `npm run start` - Start production server
- `npm run start:production` - Build and start production (used by Railway)

### Frontend Only
- `npm run dev:frontend` - Start frontend development server
- `npm run preview` - Preview built frontend

### Backend Only
- `npm run dev:backend` - Start backend development server

## 🔧 API Endpoints

### Movies
- `GET /api/movies` - Get all movies
- `POST /api/movies` - Add a new movie
- `PUT /api/movies/:id` - Update a movie
- `DELETE /api/movies/:id` - Delete a movie

### TMDB Integration
- `GET /api/tmdb/search/movie?query=<title>` - Search movies
- `GET /api/tmdb/movie/:id` - Get movie details

### Health Check
- `GET /health` - Server health status

## 🗄️ Database

This application uses Supabase as the database. Make sure you have:

1. A Supabase project created
2. The movies table set up with proper schema
3. Row Level Security (RLS) configured if needed

## 🎬 Features

- **Movie Management**: Add, edit, delete, and view movies
- **TMDB Integration**: Automatic movie data fetching from The Movie Database
- **Interactive Charts**: Visualize your movie statistics
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live data synchronization with Supabase

## 🚨 Troubleshooting

### Common Issues

1. **Build fails on Railway**
   - Check that all environment variables are set
   - Ensure Node.js version is 18+ (specified in package.json engines)

2. **API calls fail**
   - Verify CORS settings in backend/server.js
   - Check that FRONTEND_URL matches your Railway domain

3. **Database connection issues**
   - Verify Supabase credentials
   - Check Supabase project status

### Development Issues

1. **Frontend can't connect to backend**
   - Ensure backend is running on port 3001
   - Check CORS configuration

2. **Environment variables not loading**
   - Verify .env files exist in both root and backend directories
   - Restart development servers after changing .env

## 📝 License

MIT License - see LICENSE file for details