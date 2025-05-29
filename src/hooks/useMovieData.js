import { useState, useEffect, useMemo, useRef } from 'react';
import {
  parseMovieData,
  getEnhancedMovieData,
  getMovieStats,
  getTopMovies,
  getMoviesByDetailedRating,
  getRecentMovies,
  searchMovies,
  filterMoviesByRating,
  getGenreStats
} from '../utils/movieData';

export const useMovieData = () => {
  const [movies, setMovies] = useState([]);
  const [isLoadingPosters, setIsLoadingPosters] = useState(false);
  const [loadingMovieTitles, setLoadingMovieTitles] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [yearFilter, setYearFilter] = useState('all');

  // Load movies on component mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        console.log('Loading movie data...');
        const csvMovies = await parseMovieData();
        console.log('CSV movies loaded:', csvMovies.length);
        
        if (csvMovies.length > 0) {
          setMovies(csvMovies);
          
          // Only try to load enhanced data if we have a working API
          // For now, skip enhanced data loading to prevent overwriting CSV data
          // setTimeout(async () => {
          //   try {
          //     console.log('Loading enhanced movie data...');
          //     const enhancedMovies = await getEnhancedMovieData(csvMovies);
          //     console.log('Enhanced movies loaded:', enhancedMovies.length);
          //     if (enhancedMovies.length > 0) {
          //       setMovies(enhancedMovies);
          //     }
          //   } catch (error) {
          //     console.error('Error loading enhanced movie data:', error);
          //   }
          // }, 100);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
      }
    };

    loadMovies();
  }, []);

  // Progressive poster loading function
  const loadPostersProgressively = async (moviesToEnhance, batchSize = 5) => {
    if (!moviesToEnhance || moviesToEnhance.length === 0) return;
    
    setIsLoadingPosters(true);
    
    try {
      // For now, skip poster loading to prevent data loss
      // const enhancedMovies = await getEnhancedMovieData(moviesToEnhance);
      // setMovies(enhancedMovies);
      console.log('Poster loading temporarily disabled');
    } catch (error) {
      console.error('Error loading posters:', error);
    } finally {
      setIsLoadingPosters(false);
    }
  };

  // Observe movie cards for lazy loading
  const observeMovieCards = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const movieCard = entry.target;
            const movieTitle = movieCard.dataset.movieTitle;
            const needsPoster = movieCard.dataset.needsPoster === "true";
            
            if (needsPoster && movieTitle && !loadingMovieTitles.has(movieTitle)) {
              setLoadingMovieTitles(prev => new Set([...prev, movieTitle]));
              
              // Find the movie and load its poster
              const movieToEnhance = movies.find(m => m.title === movieTitle);
              if (movieToEnhance) {
                loadPostersProgressively([movieToEnhance], 1);
              }
            }
            
            observer.unobserve(movieCard);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe all movie cards that need posters
    const movieCards = document.querySelectorAll('[data-needs-poster="true"]');
    movieCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  };

  // Computed values
  const movieStats = useMemo(() => {
    if (movies.length === 0) return null;
    return getMovieStats(movies);
  }, [movies]);

  const topRatedMovies = useMemo(() => {
    return getMoviesByDetailedRating(movies, 90);
  }, [movies]);

  const recentMovies = useMemo(() => {
    return getRecentMovies(movies, 50);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let filtered = movies;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchMovies(filtered, searchQuery);
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filterMoviesByRating(filtered, ratingFilter);
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      const year = parseInt(yearFilter);
      filtered = filtered.filter(movie => movie.year === year);
    }

    return filtered;
  }, [movies, searchQuery, ratingFilter, yearFilter]);

  const availableYears = useMemo(() => {
    const years = [...new Set(movies.map(movie => movie.year))].sort((a, b) => b - a);
    return years;
  }, [movies]);

  return {
    // Data
    movies,
    movieStats,
    topRatedMovies,
    recentMovies,
    filteredMovies,
    availableYears,
    
    // Loading states
    isLoadingPosters,
    loadingMovieTitles,
    
    // Filters
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    yearFilter,
    setYearFilter,
    
    // Functions
    loadPostersProgressively,
    observeMovieCards
  };
}; 