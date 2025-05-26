# TMDB API Integration

This document explains the enhanced movie data functionality that integrates with The Movie Database (TMDB) API to provide comprehensive movie information including posters, cast, crew, and detailed metadata.

## Overview

The `src/utils/movieData.js` file has been enhanced with robust TMDB API integration that can:

- Fetch detailed movie data for any film title
- Get high-quality posters and backdrop images
- Retrieve cast and crew information
- Access genre data, ratings, and reviews
- Provide production details and trailers
- Cache API responses for better performance

## Key Functions

### Core TMDB Functions

#### `fetchMovieFromTMDB(title, year?)`
Fetches comprehensive movie data from TMDB API.

```javascript
const movieData = await fetchMovieFromTMDB('The Dark Knight', 2008);
console.log(movieData.posterUrl); // High-quality poster URL
console.log(movieData.genres); // Array of genre objects
console.log(movieData.cast); // Array of cast members
```

#### `getEnhancedMovieData(csvMovies)`
Combines your existing CSV movie data with TMDB data.

```javascript
const csvMovies = await parseMovieData();
const enhancedMovies = await getEnhancedMovieData(csvMovies);
// Each movie now has both your rating and TMDB data
```

#### `batchFetchMovies(titles, batchSize?)`
Efficiently fetches data for multiple movies with rate limiting.

```javascript
const titles = ['Inception', 'Interstellar', 'The Dark Knight'];
const movieData = await batchFetchMovies(titles, 3);
```

### Enhanced Search and Filtering

#### `searchMovies(movies, query)`
Enhanced search that looks through titles, cast, crew, genres, and plot summaries.

```javascript
const results = searchMovies(enhancedMovies, 'Christopher Nolan');
// Finds movies directed by or featuring Christopher Nolan
```

#### `getMoviesByGenre(movies, genreName)`
Filter movies by specific genre.

```javascript
const actionMovies = getMoviesByGenre(enhancedMovies, 'Action');
```

#### `getMoviesByDirector(movies, directorName)`
Find all movies by a specific director.

```javascript
const nolanFilms = getMoviesByDirector(enhancedMovies, 'Christopher Nolan');
```

#### `getMoviesByActor(movies, actorName)`
Find movies featuring a specific actor.

```javascript
const batmanMovies = getMoviesByActor(enhancedMovies, 'Christian Bale');
```

### Statistics and Analytics

#### `getGenreStats(movies)`
Get genre distribution from actual TMDB data instead of hardcoded mappings.

```javascript
const genreStats = await getGenreStats(movies);
// Returns object with genres as keys and movie arrays as values
```

#### `getEnhancedMovieStats(movies)`
Comprehensive statistics including TMDB data coverage, runtime analysis, and decade distribution.

```javascript
const stats = getEnhancedMovieStats(enhancedMovies);
console.log(stats.tmdbCoveragePercentage); // % of movies with TMDB data
console.log(stats.runtimeStats.average); // Average movie runtime
console.log(stats.genreDistribution); // Genre breakdown
```

### Image Utilities

#### `getTMDBImageUrl(path, size?)`
Generate TMDB image URLs with different sizes.

```javascript
const posterUrl = getTMDBImageUrl('/poster-path.jpg', 'w500');
const backdropUrl = getTMDBImageUrl('/backdrop-path.jpg', 'w1280');
```

#### `getTMDBImageSizes(path)`
Get multiple image sizes for responsive design.

```javascript
const imageSizes = getTMDBImageSizes('/poster-path.jpg');
// Returns: { small, medium, large, xlarge, original }
```

### Bonus Features

#### `getTrendingMovies(timeWindow?)`
Get currently trending movies from TMDB.

```javascript
const trending = await getTrendingMovies('week');
// Returns array of trending movies with basic info
```

## Data Structure

### Enhanced Movie Object
When you use `getEnhancedMovieData()`, each movie object contains:

```javascript
{
  // Original CSV data
  title: "The Dark Knight",
  rating: 5,
  date: "2024-01-15",
  year: 2024,
  
  // TMDB data
  tmdb: {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman raises the stakes...",
    releaseDate: "2008-07-18",
    runtime: 152,
    genres: [{ id: 28, name: "Action" }, { id: 80, name: "Crime" }],
    voteAverage: 8.5,
    posterUrl: "https://image.tmdb.org/t/p/w500/...",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/...",
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" }
    ],
    videos: [
      { name: "Official Trailer", url: "https://youtube.com/..." }
    ]
  },
  
  // Convenient access fields
  genres: [{ id: 28, name: "Action" }],
  posterUrl: "https://image.tmdb.org/t/p/w500/...",
  overview: "Batman raises the stakes...",
  tmdbRating: 8.5,
  runtime: 152
}
```

## Usage Examples

See `src/examples/tmdb-usage.js` for comprehensive examples of how to use all the new functionality.

### Basic Usage

```javascript
import { 
  parseMovieData, 
  getEnhancedMovieData, 
  searchMovies 
} from './src/utils/movieData.js';

// Load and enhance your movie data
const csvMovies = await parseMovieData();
const enhancedMovies = await getEnhancedMovieData(csvMovies);

// Search with enhanced capabilities
const results = searchMovies(enhancedMovies, 'sci-fi');

// Display with poster images
results.forEach(movie => {
  console.log(`${movie.title} - Rating: ${movie.rating}/5`);
  if (movie.posterUrl) {
    console.log(`Poster: ${movie.posterUrl}`);
  }
});
```

## Performance Considerations

- **Caching**: API responses are cached to avoid redundant requests
- **Rate Limiting**: Batch operations include delays to respect TMDB rate limits
- **Error Handling**: Graceful fallbacks when TMDB data is unavailable
- **Selective Enhancement**: You can enhance only specific movies to save API calls

## API Rate Limits

TMDB allows:
- 40 requests per 10 seconds
- 1000 requests per day for free accounts

The integration includes automatic rate limiting to stay within these bounds.

## Error Handling

All functions include comprehensive error handling:
- Network failures return null/empty arrays
- Invalid API responses are logged but don't crash the application
- Missing data fields are handled gracefully with fallback values

## Future Enhancements

Potential additions:
- Movie recommendations based on your ratings
- Integration with streaming service availability
- Advanced filtering by production company, country, etc.
- Export functionality for enhanced movie data
- Integration with your app's UI components

## Testing

To test the integration:

1. Run the examples: `node src/examples/tmdb-usage.js`
2. Check the browser console for API responses
3. Verify image URLs load correctly
4. Test search functionality with various queries

The integration is designed to enhance your existing movie tracking functionality without breaking any current features.