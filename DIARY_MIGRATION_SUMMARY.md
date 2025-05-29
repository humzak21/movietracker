# Backend Adaptation for Existing Diary Table

## Overview
The movie tracker backend has been successfully adapted to work with your existing `diary` table structure instead of creating new tables. This maintains your current data while adding rich TMDB integration capabilities.

## Your Current Diary Table Structure
```sql
create table public.diary (
  id serial not null,
  title text not null,
  rating numeric null,
  watched_date date null,
  rewatch text null,
  tags text null,
  release_date date null,
  release_year numeric null,
  runtime integer null,
  director text null,
  poster_url text null,
  genres text[] null,
  ratings100 numeric null,
  constraint movies_lb_pkey primary key (id)
);
```

## Changes Made

### 1. Database Schema (`backend/config/database.js`)
- **Enhanced existing diary table** with TMDB columns instead of creating new tables
- Added optional supporting tables for directors and genres (for advanced features)
- All new columns are added safely using `IF NOT EXISTS` checks
- Preserves all your existing data

**New columns added to diary table:**
- `tmdb_id` - Links to TMDB movie database
- `overview` - Movie descriptions from TMDB
- `backdrop_path` - Background images
- `vote_average`, `vote_count`, `popularity` - TMDB ratings
- `original_language`, `original_title`, `tagline`, `status`
- `budget`, `revenue`, `imdb_id`, `homepage`
- `created_at`, `updated_at` - Timestamps

### 2. Movie Service (`backend/services/movieService.js`)
- **Works directly with diary table** instead of separate movies table
- Maps between TMDB data and your diary structure
- Preserves user data (rating, watched_date, rewatch, tags) while adding TMDB enhancements
- Provides fallback queries if supporting tables don't exist

**Key mappings:**
```javascript
// Your diary fields ↔ TMDB data
rating ↔ user_rating
ratings100 ↔ detailed_rating
watched_date ↔ watch_date
rewatch ↔ is_rewatch (Yes/No)
tags ↔ notes
```

### 3. Movie Controller (`backend/controllers/movieController.js`)
- All endpoints work with diary table
- Added `enhanceWithTMDB(id)` endpoint to enhance individual entries
- Update operations preserve user data while adding TMDB info
- Delete, search, and stats operations work with diary structure

### 4. Migration Script (`backend/scripts/migrate.js`)
- **Enhances existing diary table** instead of creating new schema
- Creates optional supporting tables for directors/genres
- Sets up indexes for better performance
- Configures Row Level Security (RLS) policies

### 5. Enhancement Script (`backend/scripts/enhanceWithTMDB.js`)
- **Specifically designed for existing diary data**
- Fetches TMDB data for movies that don't have it yet
- Preserves all your user data (ratings, watch dates, notes)
- Updates entries with rich TMDB information (posters, descriptions, etc.)
- Handles rate limiting and batch processing

## API Endpoints

All endpoints work with your diary table:

### Diary Operations
- `GET /api/movies` - Get all diary entries
- `GET /api/movies/:id` - Get specific entry
- `POST /api/movies/add` - Add new entry with TMDB data
- `PUT /api/movies/:id` - Update entry
- `PATCH /api/movies/:id/rating` - Update rating
- `DELETE /api/movies/:id` - Delete entry
- `POST /api/movies/:id/enhance` - Enhance specific entry with TMDB
- `GET /api/movies/search` - Search your diary
- `GET /api/movies/stats` - Get statistics

### TMDB Integration
- `GET /api/movies/tmdb/search` - Search TMDB
- `GET /api/movies/tmdb/trending` - Get trending movies
- `GET /api/movies/tmdb/genres` - Get TMDB genres

## Getting Started

### 1. Environment Setup
Make sure your `.env` file is in the `backend` directory with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
TMDB_API_KEY=your_tmdb_key
```

### 2. Enhance Your Diary Table
```bash
cd backend
npm run migrate  # Adds TMDB columns to your diary table
```

### 3. Populate TMDB Data
```bash
npm run enhance  # Fetches TMDB data for your existing movies
```

### 4. Start Backend
```bash
npm run dev  # Starts the backend server
```

## Data Preservation
- ✅ All existing diary entries are preserved
- ✅ Your ratings, watch dates, and notes remain unchanged
- ✅ New TMDB data enhances your entries without overwriting user data
- ✅ Director field is updated only if TMDB has better data
- ✅ Genres are converted from text array to proper format

## Benefits
- **Rich movie data**: Posters, descriptions, cast, crew
- **Better search**: Search by title, director, overview, or tags
- **Enhanced statistics**: Genre breakdowns, rating distributions
- **TMDB integration**: Access to trending movies and comprehensive database
- **Future-proof**: Optional supporting tables for advanced features
- **Backward compatible**: Frontend can still work with your original data structure

## Optional Features
If the supporting tables (directors, genres, movie_directors, movie_genres) are created successfully, you get:
- Detailed director information with biographies and photos
- Proper genre relationships for better filtering
- More sophisticated search and statistics

If they're not created, the system falls back to using the text fields in your diary table.

This approach gives you the best of both worlds: keeping your existing data structure while adding powerful TMDB integration! 