# Movie Tracker Backend

A Node.js/Express backend that integrates TMDB API with Supabase database to provide a comprehensive movie tracking service.

## Features

- 🎬 **TMDB Integration**: Fetch comprehensive movie data from The Movie Database
- 🗄️ **Supabase Database**: Store movies, ratings, directors, and genres
- 🔍 **Advanced Search**: Search movies by title, director, genre, or description
- 📊 **Statistics**: Generate movie watching statistics and analytics
- 🚀 **Batch Operations**: Process multiple movies efficiently
- 🛡️ **Rate Limiting**: Built-in API protection and TMDB rate limit compliance
- ⚡ **RESTful API**: Clean, well-documented API endpoints

## Prerequisites

- Node.js 18+ 
- Supabase account and project
- TMDB API key

## Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp env.example .env
```

Edit `.env` with your credentials:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

3. **Database Setup**
```bash
# Run database migration
npm run migrate

# Seed with your existing CSV data (optional)
npm run seed
```

4. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Database Schema

### Tables

- **movies**: Core movie data from TMDB
- **directors**: Director information
- **genres**: Movie genres
- **user_ratings**: Your personal movie ratings (1-5 and 0-100 scale)
- **movie_directors**: Many-to-many relationship between movies and directors
- **movie_genres**: Many-to-many relationship between movies and genres

### Key Fields

Movies include:
- TMDB ID, title, release date, runtime
- Overview, poster/backdrop paths
- TMDB ratings, popularity, budget/revenue
- IMDb ID, homepage, status

Ratings include:
- User rating (1-5 scale)
- Detailed rating (0-100 scale)
- Watch date, rewatch flag, notes

## API Endpoints

### Movies

#### `GET /api/movies`
Get all movies with ratings, directors, and genres
```javascript
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Dark Knight",
      "release_date": "2008-07-18",
      "runtime": 152,
      "poster_url": "https://image.tmdb.org/t/p/w500/...",
      "ratings": [
        {
          "user_rating": 5,
          "detailed_rating": 95,
          "watch_date": "2024-01-15",
          "is_rewatch": false
        }
      ],
      "directors": [
        { "name": "Christopher Nolan" }
      ],
      "genres": [
        { "name": "Action" },
        { "name": "Crime" }
      ]
    }
  ],
  "count": 1
}
```

#### `GET /api/movies/:id`
Get single movie by ID

#### `POST /api/movies/add`
Add a new movie from TMDB
```javascript
// Request body
{
  "title": "Inception",
  "year": 2010,  // optional
  "userRating": 4.5,
  "detailedRating": 88,
  "watchDate": "2024-01-20",
  "isRewatch": false
}
```

#### `POST /api/movies/batch-add`
Add multiple movies at once
```javascript
// Request body
{
  "movies": [
    {
      "title": "Inception",
      "userRating": 4.5,
      "detailedRating": 88,
      "watchDate": "2024-01-20"
    },
    {
      "title": "Interstellar", 
      "userRating": 5,
      "detailedRating": 92,
      "watchDate": "2024-01-21"
    }
  ]
}
```

#### `POST /api/movies/:id/rating`
Add or update a rating for an existing movie
```javascript
// Request body
{
  "userRating": 4.5,
  "detailedRating": 88,
  "watchDate": "2024-01-20",
  "isRewatch": true,
  "notes": "Even better on second viewing"
}
```

#### `GET /api/movies/search?q=query`
Search your movie database
```javascript
// Example: /api/movies/search?q=christopher%20nolan
```

#### `GET /api/movies/stats`
Get movie statistics
```javascript
// Response
{
  "success": true,
  "data": {
    "totalMovies": 150,
    "totalRatings": 165,
    "uniqueMovies": 150,
    "averageUserRating": 4.2,
    "averageDetailedRating": 78.5,
    "ratingDistribution": {
      "5": 45,
      "4": 62,
      "3": 31,
      "2": 12,
      "1": 5
    },
    "genreDistribution": {
      "Action": 35,
      "Drama": 42,
      "Comedy": 28
    },
    "rewatchCount": 15
  }
}
```

### TMDB Integration

#### `GET /api/tmdb/search?q=query&year=2010`
Search TMDB for movies (doesn't add to your database)

#### `GET /api/tmdb/trending?timeWindow=week`
Get trending movies from TMDB

#### `GET /api/tmdb/genres`
Get all movie genres from TMDB

### System

#### `GET /health`
Health check endpoint

## Usage Examples

### Adding a movie you watched
```javascript
const response = await fetch('http://localhost:3001/api/movies/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Dune',
    year: 2021,
    userRating: 4.5,
    detailedRating: 87,
    watchDate: '2024-01-15',
    isRewatch: false
  })
});
```

### Searching your movies
```javascript
const response = await fetch('http://localhost:3001/api/movies/search?q=sci-fi');
const data = await response.json();
```

### Getting statistics
```javascript
const response = await fetch('http://localhost:3001/api/movies/stats');
const stats = await response.json();
```

## Rate Limiting

The API includes built-in rate limiting:

- **General API**: 100 requests per 15 minutes
- **TMDB endpoints**: 40 requests per 10 seconds (TMDB limit)
- **Batch operations**: 5 operations per hour

## Development

### Project Structure
```
backend/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── scripts/         # Database migration/seeding
├── services/        # Business logic services
├── package.json
├── server.js        # Main server file
└── README.md
```

### Adding New Features

1. **New API endpoint**: Add to `routes/movieRoutes.js`
2. **Business logic**: Add to `services/movieService.js`
3. **Database changes**: Update `config/database.js` schema
4. **Run migration**: `npm run migrate`

### CSV Migration

The seeding script can migrate your existing CSV data:

1. Place your CSV files in the root directory
2. Update file paths in `scripts/seed.js` if needed
3. Run `npm run seed`

Expected CSV format:
```csv
title,month,day,year,rating
"The Dark Knight",7,18,2008,5
"Inception",7,16,2010,4.5
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=your_frontend_domain
```

### Deployment Options
- **Railway**: Connect your GitHub repo
- **Vercel**: Use their Node.js runtime
- **Heroku**: Deploy with buildpacks
- **DigitalOcean App Platform**: One-click deployment

## Troubleshooting

### Common Issues

1. **TMDB API Key Invalid**
   - Verify your API key in TMDB settings
   - Check environment variables

2. **Supabase Connection Issues**
   - Verify project URL and keys
   - Check Row Level Security policies

3. **Rate Limiting Errors**
   - Reduce batch sizes
   - Add delays between requests

4. **CSV Seeding Failures**
   - Check CSV format and file paths
   - Verify column names match expected format

## License

MIT License - feel free to use this for your own movie tracking needs! 