// Example usage of the enhanced TMDB movie data functions
import { 
  parseMovieData, 
  fetchMovieFromTMDB, 
  getEnhancedMovieData, 
  getGenreStats,
  searchMovies,
  getMoviesByGenre,
  getMoviesByDirector,
  getMoviesByActor,
  getEnhancedMovieStats,
  getTMDBImageUrl,
  getTMDBImageSizes,
  getTrendingMovies
} from '../utils/movieData.js';

// Example 1: Fetch detailed data for a specific movie
async function fetchMovieExample() {
  console.log('=== Fetching Movie Data ===');
  
  const movieData = await fetchMovieFromTMDB('The Dark Knight', 2008);
  
  if (movieData) {
    console.log('Title:', movieData.title);
    console.log('Overview:', movieData.overview);
    console.log('Genres:', movieData.genres.map(g => g.name).join(', '));
    console.log('Director:', movieData.crew.find(p => p.job === 'Director')?.name);
    console.log('Main Cast:', movieData.cast.slice(0, 3).map(a => a.name).join(', '));
    console.log('Poster URL:', movieData.posterUrl);
    console.log('Runtime:', movieData.runtime, 'minutes');
    console.log('TMDB Rating:', movieData.voteAverage);
  }
}

// Example 2: Enhance your existing CSV movie data with TMDB data
async function enhanceMovieDataExample() {
  console.log('\n=== Enhancing CSV Data with TMDB ===');
  
  // Parse your existing CSV data
  const csvMovies = await parseMovieData();
  console.log('Loaded', csvMovies.length, 'movies from CSV');
  
  // Enhance with TMDB data (this will take a while for large datasets)
  // For demo purposes, let's just enhance the first 5 movies
  const sampleMovies = csvMovies.slice(0, 5);
  const enhancedMovies = await getEnhancedMovieData(sampleMovies);
  
  enhancedMovies.forEach(movie => {
    console.log(`\n${movie.title} (Your Rating: ${movie.rating}/5)`);
    if (movie.tmdb) {
      console.log('  TMDB Rating:', movie.tmdbRating);
      console.log('  Genres:', movie.genres.map(g => g.name).join(', '));
      console.log('  Runtime:', movie.runtime, 'minutes');
      console.log('  Poster:', movie.posterUrl ? 'Available' : 'Not available');
    } else {
      console.log('  TMDB data not found');
    }
  });
}

// Example 3: Search movies with enhanced capabilities
async function searchExample() {
  console.log('\n=== Enhanced Search Example ===');
  
  const csvMovies = await parseMovieData();
  const enhancedMovies = await getEnhancedMovieData(csvMovies.slice(0, 20)); // Sample
  
  // Search by title
  const titleResults = searchMovies(enhancedMovies, 'dark');
  console.log('Movies with "dark" in title:', titleResults.map(m => m.title));
  
  // Search by genre (if TMDB data is available)
  const actionMovies = getMoviesByGenre(enhancedMovies, 'Action');
  console.log('Action movies:', actionMovies.map(m => m.title));
  
  // Search by director
  const nolanMovies = getMoviesByDirector(enhancedMovies, 'Nolan');
  console.log('Nolan movies:', nolanMovies.map(m => m.title));
}

// Example 4: Get comprehensive statistics
async function statsExample() {
  console.log('\n=== Enhanced Statistics Example ===');
  
  const csvMovies = await parseMovieData();
  const enhancedMovies = await getEnhancedMovieData(csvMovies.slice(0, 50)); // Sample
  
  const stats = getEnhancedMovieStats(enhancedMovies);
  
  console.log('Total movies:', stats.totalMovies);
  console.log('TMDB coverage:', stats.tmdbCoveragePercentage + '%');
  console.log('Average runtime:', stats.runtimeStats.average, 'minutes');
  console.log('Top genres:', Object.entries(stats.genreDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre, count]) => `${genre} (${count})`)
    .join(', ')
  );
}

// Example 5: Working with images
function imageExample() {
  console.log('\n=== Image URL Examples ===');
  
  const posterPath = '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'; // Example poster path
  
  console.log('Small poster:', getTMDBImageUrl(posterPath, 'w185'));
  console.log('Medium poster:', getTMDBImageUrl(posterPath, 'w342'));
  console.log('Large poster:', getTMDBImageUrl(posterPath, 'w500'));
  
  const allSizes = getTMDBImageSizes(posterPath);
  console.log('All sizes:', allSizes);
}

// Example 6: Get trending movies
async function trendingExample() {
  console.log('\n=== Trending Movies Example ===');
  
  const trending = await getTrendingMovies('week');
  console.log('This week\'s trending movies:');
  trending.slice(0, 5).forEach(movie => {
    console.log(`- ${movie.title} (${movie.voteAverage}/10)`);
  });
}

// Run examples
async function runExamples() {
  try {
    await fetchMovieExample();
    await enhanceMovieDataExample();
    await searchExample();
    await statsExample();
    imageExample();
    await trendingExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use in other files
export {
  fetchMovieExample,
  enhanceMovieDataExample,
  searchExample,
  statsExample,
  imageExample,
  trendingExample,
  runExamples
};

// Uncomment the line below to run examples when this file is imported
// runExamples();