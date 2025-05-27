import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Star, Calendar, TrendingUp, Film, Search, Filter } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
} from './utils/movieData';

// Import slideshow images statically for production compatibility
import skyfall004 from './assets/skyfall004.jpg';
import m0091 from './assets/M_0091.jpg';
import jKhsC3yguywiKF1XA6OlslFhlwT from './assets/jKhsC3yguywiKF1XA6OlslFhlwT.jpg';
import dunkirk666 from './assets/Dunkirk_666.jpg';
import dunkirk668 from './assets/Dunkirk_668.jpg';
import dunkirk053 from './assets/Dunkirk_053.jpg';
import spiderverse0940 from './assets/Spiderverse_0940.jpg';
import theBatman2856 from './assets/TheBatman_2856.jpg';
import theBatman1738 from './assets/TheBatman_1738.jpg';
import theBatman1736 from './assets/TheBatman_1736.jpg';
import theBatman1348 from './assets/TheBatman_1348.jpg';
import theBatman0184 from './assets/TheBatman_0184.jpg';
import theBatman0204 from './assets/TheBatman_0204.jpg';
import zRKQW58MBEY078AxkHxEJzUskCl from './assets/zRKQW58MBEY078AxkHxEJzUskCl.jpg';
import br2049_696 from './assets/BR2049_696.jpg';
import br2049_241 from './assets/BR2049_241.jpg';
import br2049_223 from './assets/BR2049_223.jpg';
import br2049_222 from './assets/BR2049_222.jpg';
import br2049_112 from './assets/BR2049_112.jpg';
import br2049_006 from './assets/BR2049_006.jpg';
import br2049_004 from './assets/BR2049_004.jpg';
import c6PNllNr6scbHpbrZlGdvldxZjX from './assets/c6PNllNr6scbHpbrZlGdvldxZjX.jpg';
import ijgJxqQ6XDjLF9clAem3lnn4lNG from './assets/ijgJxqQ6XDjLF9clAem3lnn4lNG.jpg';
import sAtoMqDVhNDQBc3QJL3RF6hlhGq from './assets/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg';
import bMdSmfI0qwpAkvhAL7sqpjmwgf4 from './assets/bMdSmfI0qwpAkvhAL7sqpjmwgf4.jpg';
import prisonersFeatured from './assets/Prisoners-Featured.jpeg';
import mv5BMTY1Nzk4ODUwMF5BMl5BanBnXkFtZTcwMzc0OTk1Mw from './assets/MV5BMTY1Nzk4ODUwMF5BMl5BanBnXkFtZTcwMzc0OTk1Mw@@._V1_.jpg';
import ingloriousBasterdsLarge from './assets/inglourious_basterds-891465956-large.jpg';
import ingloriousBasterdsFeatured from './assets/inglourious_basterds_featured.jpg';
import inceptionEndingTopSpinning from './assets/inception-ending-top-spinning.jpg';

// Static slideshow images array for production compatibility
const slideshowImages = [
  skyfall004,
  m0091,
  jKhsC3yguywiKF1XA6OlslFhlwT,
  dunkirk666,
  dunkirk668,
  dunkirk053,
  spiderverse0940,
  theBatman2856,
  theBatman1738,
  theBatman1736,
  theBatman1348,
  theBatman0184,
  theBatman0204,
  zRKQW58MBEY078AxkHxEJzUskCl,
  br2049_696,
  br2049_241,
  br2049_223,
  br2049_222,
  br2049_112,
  br2049_006,
  br2049_004,
  c6PNllNr6scbHpbrZlGdvldxZjX,
  ijgJxqQ6XDjLF9clAem3lnn4lNG,
  sAtoMqDVhNDQBc3QJL3RF6hlhGq,
  bMdSmfI0qwpAkvhAL7sqpjmwgf4,
  prisonersFeatured,
  mv5BMTY1Nzk4ODUwMF5BMl5BanBnXkFtZTcwMzc0OTk1Mw,
  ingloriousBasterdsLarge,
  ingloriousBasterdsFeatured,
  inceptionEndingTopSpinning
];

// Dynamic import function for slideshow images
const importSlideshowImages = () => {
  try {
    // In production, use the static imports
    if (import.meta.env.PROD) {
      console.log('Production mode: Using static slideshow images');
      return slideshowImages;
    }
    
    // In development, try dynamic import for hot reloading
    try {
      const imageModules = import.meta.glob('/src/assets/*.{jpg,jpeg,png,webp,gif,bmp}', { eager: true });
      console.log('Development mode: Found image modules:', Object.keys(imageModules));
      
      const imageUrls = Object.values(imageModules)
        .map(module => module.default)
        .filter(url => url);
      
      console.log('Development mode: Loaded slideshow images:', imageUrls);
      return imageUrls.length > 0 ? imageUrls : slideshowImages;
    } catch (devError) {
      console.warn('Development dynamic import failed, falling back to static images:', devError);
      return slideshowImages;
    }
  } catch (error) {
    console.error('Error in importSlideshowImages:', error);
    return slideshowImages; // Fallback to static images
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [yearFilter, setYearFilter] = useState('all');
  const [movies, setMovies] = useState([]);
  const [timelineLimit, setTimelineLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingPosters, setIsLoadingPosters] = useState(false);
  const [loadingMovieTitles, setLoadingMovieTitles] = useState(new Set());
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef(null);

  // Load slideshow images on component mount
  const loadedSlideshowImages = useMemo(() => {
    try {
      const images = importSlideshowImages();
      console.log('Slideshow images loaded:', images.length);
      return images;
    } catch (error) {
      console.error('Error loading slideshow images:', error);
      return [];
    }
  }, []);

  // Scroll detection for header animation
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const currentScrollY = latest;
    
    // Clear any existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Always show header when near the top of the page
    if (currentScrollY < 100) {
      setHeaderVisible(true);
      setScrollDirection('up');
      setLastScrollY(currentScrollY);
      return;
    }
    
    // Calculate scroll direction and movement
    const direction = currentScrollY > previous ? 'down' : 'up';
    const scrollDelta = Math.abs(currentScrollY - previous);
    const significantMovement = Math.abs(currentScrollY - lastScrollY);
    
    // Only update if there's meaningful scroll movement (prevents jitter)
    if (scrollDelta > 5) {
      setScrollDirection(direction);
      
      // Hide header when scrolling down significantly
      if (direction === 'down' && currentScrollY > 100) {
        setHeaderVisible(false);
      }
      // Show header when scrolling up significantly AND we've moved up considerably from last position
      else if (direction === 'up' && significantMovement > 80) {
        setHeaderVisible(true);
      }
      
      // Set a timeout to handle scroll end behavior in deployment
      scrollTimeoutRef.current = setTimeout(() => {
        // Only show header on scroll end if we're near the top
        if (currentScrollY < 150) {
          setHeaderVisible(true);
        }
      }, 150); // 150ms delay to detect scroll end
      
      // Update last scroll position only on significant movements
      if (significantMovement > 30) {
        setLastScrollY(currentScrollY);
      }
    }
  });

  // Progressive poster loading system
  const loadPostersProgressively = async (moviesToEnhance, batchSize = 5) => {
    if (isLoadingPosters || moviesToEnhance.length === 0) return;
    
    // Filter out movies that are already being loaded
    const filteredMovies = moviesToEnhance.filter(movie => 
      !loadingMovieTitles.has(movie.title)
    );
    
    if (filteredMovies.length === 0) return;
    
    setIsLoadingPosters(true);
    
    // Add movies to loading set
    setLoadingMovieTitles(prev => {
      const newSet = new Set(prev);
      filteredMovies.forEach(movie => newSet.add(movie.title));
      return newSet;
    });
    
    try {
      // Process movies in small batches to avoid overwhelming the API
      for (let i = 0; i < filteredMovies.length; i += batchSize) {
        const batch = filteredMovies.slice(i, i + batchSize);
        
        const enhancedBatch = await getEnhancedMovieData(batch);
        
        // Update movies state with the enhanced batch
        setMovies(prevMovies => {
          const enhancedMap = new Map();
          enhancedBatch.forEach(movie => {
            enhancedMap.set(movie.title, movie);
          });
          
          return prevMovies.map(movie => {
            const enhanced = enhancedMap.get(movie.title);
            if (enhanced) {
              // Preserve the original movie's unique data (date, rating) while adding TMDB data
              return {
                ...movie, // Keep original date, rating, etc.
                tmdb: enhanced.tmdb,
                genres: enhanced.genres,
                posterUrl: enhanced.posterUrl,
                backdropUrl: enhanced.backdropUrl,
                overview: enhanced.overview,
                tmdbRating: enhanced.tmdbRating,
                releaseDate: enhanced.releaseDate,
                runtime: enhanced.runtime
              };
            }
            return movie;
          });
        });
        
        // Remove completed movies from loading set
        setLoadingMovieTitles(prev => {
          const newSet = new Set(prev);
          batch.forEach(movie => newSet.delete(movie.title));
          return newSet;
        });
        
        // Small delay between batches to respect API rate limits
        if (i + batchSize < filteredMovies.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error in progressive poster loading:', error);
      // Clear loading set on error
      setLoadingMovieTitles(prev => {
        const newSet = new Set(prev);
        filteredMovies.forEach(movie => newSet.delete(movie.title));
        return newSet;
      });
    } finally {
      setIsLoadingPosters(false);
    }
  };

  // Intersection Observer for scroll-based loading
  const observeMovieCards = () => {
    const movieCards = document.querySelectorAll('.movie-card[data-needs-poster="true"]');
    
    if (!movieCards.length) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleMovies = [];
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const movieTitle = entry.target.dataset.movieTitle;
            const movie = movies.find(m => m.title === movieTitle && !m.posterUrl);
            if (movie) {
              visibleMovies.push(movie);
              entry.target.removeAttribute('data-needs-poster'); // Mark as queued
            }
          }
        });
        
        if (visibleMovies.length > 0) {
          loadPostersProgressively(visibleMovies, 3); // Smaller batch for scroll-triggered loading
        }
      },
      {
        rootMargin: '200px', // Start loading when element is 200px away from viewport
        threshold: 0.1
      }
    );
    
    movieCards.forEach(card => observer.observe(card));
    
    // Cleanup function
    return () => observer.disconnect();
  };

  // Auto-load posters in background after initial load
  useEffect(() => {
    if (movies.length === 0) return;
    
    const moviesWithoutPosters = movies.filter(movie => !movie.posterUrl && !movie.tmdb);
    
    if (moviesWithoutPosters.length > 0) {
      // Start background loading after a short delay
      const timer = setTimeout(() => {
        // Load next 20 movies in background
        const nextBatch = moviesWithoutPosters.slice(0, 20);
        loadPostersProgressively(nextBatch, 4);
      }, 2000); // 2 second delay after page load
      
      return () => clearTimeout(timer);
    }
  }, [movies]);

  // Set up intersection observer when movies change
  useEffect(() => {
    if (movies.length === 0) return;
    
    const timer = setTimeout(() => {
      const cleanup = observeMovieCards();
      return cleanup;
    }, 1000); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer);
  }, [movies, activeTab]);

  // Load movie data on component mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const csvMovieData = await parseMovieData();
        
        // For initial load, enhance recent movies first to ensure visible movies have posters
        const recentMoviesForEnhancement = csvMovieData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 30);
        
        const enhancedMovieData = await getEnhancedMovieData(recentMoviesForEnhancement);
        
        // Create a map of enhanced movies by title
        const enhancedMoviesMap = new Map();
        enhancedMovieData.forEach(movie => {
          enhancedMoviesMap.set(movie.title, movie);
        });
        
        // Merge enhanced data back into the full movie list
        const allMovies = csvMovieData.map(movie => {
          const enhanced = enhancedMoviesMap.get(movie.title);
          if (enhanced) {
            // Preserve the original movie's unique data (date, rating) while adding TMDB data
            return {
              ...movie, // Keep original date, rating, etc.
              tmdb: enhanced.tmdb,
              genres: enhanced.genres,
              posterUrl: enhanced.posterUrl,
              backdropUrl: enhanced.backdropUrl,
              overview: enhanced.overview,
              tmdbRating: enhanced.tmdbRating,
              releaseDate: enhanced.releaseDate,
              runtime: enhanced.runtime
            };
          }
          return {
            ...movie,
            posterUrl: null // These will show fallback icons
          };
        });
        
        setMovies(allMovies);
      } catch (error) {
        console.error('Error loading movies:', error);
      }
    };

    loadMovies();
  }, []);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Reset timeline limit when filters change
  useEffect(() => {
    setTimelineLimit(50);
  }, [searchQuery, ratingFilter, yearFilter]);

  const stats = useMemo(() => movies.length > 0 ? getMovieStats(movies) : null, [movies]);
  const topMovies = useMemo(() => movies.length > 0 ? getTopMovies(movies) : [], [movies]);
  const topRatedMovies = useMemo(() => movies.length > 0 ? getMoviesByDetailedRating(movies, 90) : [], [movies]);
  const recentMovies = useMemo(() => movies.length > 0 ? getRecentMovies(movies) : [], [movies]);

  const filteredMovies = useMemo(() => {
    let filtered = movies;
    
    if (searchQuery) {
      filtered = searchMovies(filtered, searchQuery);
    }
    
    if (ratingFilter > 0) {
      filtered = filterMoviesByRating(filtered, ratingFilter);
    }
    
    if (yearFilter !== 'all') {
      const year = parseInt(yearFilter);
      filtered = filtered.filter(movie => movie.year === year);
    }
    
    // Remove duplicates - keep only the latest entry for each unique title
    const uniqueMoviesMap = new Map();
    filtered.forEach(movie => {
      const existingMovie = uniqueMoviesMap.get(movie.title);
      
      // If no existing movie or this one is more recent, update the map
      if (!existingMovie || new Date(movie.date) > new Date(existingMovie.date)) {
        uniqueMoviesMap.set(movie.title, movie);
      }
    });
    
    return Array.from(uniqueMoviesMap.values());
  }, [movies, searchQuery, ratingFilter, yearFilter]);

  const renderOverview = () => {
    // Slideshow settings
    const sliderSettings = {
      dots: false,
      infinite: loadedSlideshowImages.length > 1, // Only enable infinite if we have multiple images
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: loadedSlideshowImages.length > 1, // Only autoplay if we have multiple images
      autoplaySpeed: 10000,
      fade: false,
      arrows: false,
      pauseOnHover: false,
    };

    return (
      <>
        {/* Fullscreen Slideshow Section */}
        <div className="slideshow-container">
          {loadedSlideshowImages.length > 0 ? (
            <Slider {...sliderSettings}>
              {loadedSlideshowImages.map((image, index) => (
                <div key={index} className="slide">
                  <div 
                    className="slide-image"
                    style={{
                      backgroundImage: `url(${image})`,
                    }}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            // Fallback when no images are loaded
            <div className="slide">
              <div 
                className="slide-image"
                style={{
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '18px'
                }}
              >
                <Film size={64} style={{ opacity: 0.3 }} />
              </div>
            </div>
          )}
          
          {/* Black Overlay */}
          <div className="slideshow-black-overlay"></div>
          
          {/* Overlay Content */}
          <div className="slideshow-overlay">
            <div className="container">
              <div className="hero-content">
                <h1>Hak Movie Tracker</h1>
                <p>Humza's Personal Movie Tracker - Now with {movies.length} entries!</p>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-number">{stats?.totalMovies || 0}</span>
                    <span className="stat-label">Total Movies</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats?.uniqueMovies || 0}</span>
                    <span className="stat-label">Unique Films</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats?.averageRating || 0}</span>
                    <span className="stat-label">Average Rating</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats?.fiveStarMovies || 0}</span>
                    <span className="stat-label">5-Star Movies</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats?.rewatchPercentage || 0}%</span>
                    <span className="stat-label">Rewatches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Movies Section */}
        <div className="section">
          <div className="container">
            <div className="recent-movies">
              <h2>Recent Movies</h2>
              <div className="movie-grid">
                {recentMovies.slice(0, 12).map((movie, index) => (
                  <div 
                    key={`${movie.title}-${movie.date}-${index}`}
                    className="movie-card"
                    data-movie-title={movie.title}
                    data-needs-poster={!movie.posterUrl ? "true" : undefined}
                  >
                    <div className="movie-poster">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={`${movie.title} poster`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="poster-fallback" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                        <Film size={48} />
                      </div>
                    </div>
                    <div className="movie-info">
                      <h4 className="movie-title">{movie.title}</h4>
                      <div className="movie-meta">
                        <div className="movie-rating">
                          <Star size={16} fill="currentColor" />
                          {movie.rating}
                        </div>
                        {movie.detailedRating && (
                          <div className="detailed-rating" style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                            ({movie.detailedRating}/100)
                          </div>
                        )}
                      </div>
                      <div className="movie-date">
                        {movie.month}/{movie.day}/{movie.year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTimeline = () => {
    const timelineEntries = Object.entries(
      filteredMovies
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .reduce((acc, movie) => {
          const date = `${movie.month}/${movie.day}/${movie.year}`;
          if (!acc[date]) acc[date] = [];
          acc[date].push(movie);
          return acc;
        }, {})
    );

    const displayedEntries = timelineEntries.slice(0, timelineLimit);
    const hasMoreEntries = timelineEntries.length > timelineLimit;

    const loadMoreEntries = () => {
      setIsLoadingMore(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setTimelineLimit(prev => prev + 50);
        setIsLoadingMore(false);
      }, 300);
    };

    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Movie Timeline</h2>
          <p className="timeline-info">
            Showing {displayedEntries.length} of {timelineEntries.length} entries
            {filteredMovies.length !== movies.length && ` (${filteredMovies.length} movies match your filters)`}
          </p>
          
          <div className="filters">
            <input
              type="text"
              placeholder="Search movies..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="filter-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={5}>5 Stars Only</option>
            </select>
            <select
              className="filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
            </select>
          </div>

          <div className="timeline">
            {displayedEntries.map(([date, dayMovies]) => (
              <div key={date} className="timeline-item">
                <div className="timeline-date">{date}</div>
                <div className="timeline-movies">
                  {dayMovies.map((movie, idx) => (
                    <div key={idx} className="timeline-movie">
                      <strong>{movie.title}</strong> - {movie.rating}★
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hasMoreEntries && (
            <div className="load-more-container">
              <button
                className="btn load-more-btn"
                onClick={loadMoreEntries}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : `Load More (${timelineEntries.length - timelineLimit} remaining)`}
              </button>
            </div>
          )}

          {!hasMoreEntries && timelineEntries.length > 0 && (
            <div className="timeline-end">
              <p>🎬 You've reached the beginning of your movie journey!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMovies = () => {
    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Movie Collection ({filteredMovies.length} movies)</h2>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Search movies..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="filter-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={5}>5 Stars Only</option>
          </select>
          <select 
            className="filter-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
          </select>
        </div>

        <div className="movie-grid">
          {filteredMovies
            .sort((a, b) => {
              // Sort by detailed rating first (if available), then by 5-star rating, then by date
              const aDetailedRating = a.detailedRating || 0;
              const bDetailedRating = b.detailedRating || 0;
              
              if (aDetailedRating !== bDetailedRating) {
                return bDetailedRating - aDetailedRating;
              }
              
              return b.rating - a.rating || new Date(b.date) - new Date(a.date);
            })
            .map((movie, index) => (
              <div 
                key={index} 
                className="movie-card"
                data-movie-title={movie.title}
                data-needs-poster={!movie.posterUrl ? "true" : undefined}
              >
                <div className="movie-poster">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={`${movie.title} poster`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="poster-fallback" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                    <Film size={48} />
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <div className="movie-rating">
                      <Star size={16} fill="currentColor" />
                      {movie.rating}
                    </div>
                    {movie.detailedRating && (
                      <div className="detailed-rating" style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                        ({movie.detailedRating}/100)
                      </div>
                    )}
                  </div>
                  <div className="movie-date">
                    Watched: {movie.month}/{movie.day}/{movie.year}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
   );
 };

  const renderTopMovies = () => {
    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Top Rated Movies</h2>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            All movies rated 90 or higher out of 100 ({topRatedMovies.length} films)
          </p>
          
          <div className="movie-grid">
            {topRatedMovies.map((movie, index) => (
              <div 
                key={index} 
                className="movie-card"
                data-movie-title={movie.title}
                data-needs-poster={!movie.posterUrl ? "true" : undefined}
              >
                <div className="movie-poster">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={`${movie.title} poster`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="poster-fallback" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                    <Film size={48} />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: movie.detailedRating === 100 ? 'rgba(255,215,0,0.9)' : 'rgba(0,150,0,0.8)',
                    color: movie.detailedRating === 100 ? 'black' : 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {movie.detailedRating}/100
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <div className="movie-rating">
                      <Star size={16} fill="currentColor" />
                      {movie.rating}
                    </div>
                    {movie.detailedRating && (
                      <div className="detailed-rating" style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                        ({movie.detailedRating}/100)
                      </div>
                    )}
                  </div>
                  <div className="movie-date">
                    Watched: {movie.month}/{movie.day}/{movie.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <motion.header 
        className="header"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ 
          scale: headerVisible ? 1 : 0.7,
          opacity: headerVisible ? 1 : 0,
          translateY: headerVisible ? 0 : -30
        }}
        transition={{ 
          duration: headerVisible ? 0.4 : 0.2,
          ease: headerVisible ? [0.34, 1.56, 0.64, 1] : [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: headerVisible ? 300 : 400,
          damping: headerVisible ? 25 : 30
        }}
        style={{
          pointerEvents: headerVisible ? 'auto' : 'none'
        }}
      >
        <nav className="nav">
          <motion.div 
            className="nav-left"
            animate={{ 
              opacity: headerVisible ? 1 : 0,
              x: headerVisible ? 0 : -10
            }}
            transition={{ 
              duration: 0.3,
              delay: headerVisible ? 0.1 : 0
            }}
          >
            <ul className="nav-links">
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <TrendingUp size={14} />
                  Overview
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  <Calendar size={14} />
                  Timeline
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.a 
            href="#" 
            className="logo"
            animate={{ 
              opacity: headerVisible ? 1 : 0,
              scale: headerVisible ? 1 : 0.9
            }}
            transition={{ 
              duration: 0.3,
              delay: headerVisible ? 0.05 : 0
            }}
          >
            Movie Tracker
          </motion.a>
          
          <motion.div 
            className="nav-right"
            animate={{ 
              opacity: headerVisible ? 1 : 0,
              x: headerVisible ? 0 : 10
            }}
            transition={{ 
              duration: 0.3,
              delay: headerVisible ? 0.1 : 0
            }}
          >
            <ul className="nav-links">
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('movies')}
                >
                  <Film size={14} />
                  Movies
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'top' ? 'active' : ''}`}
                  onClick={() => setActiveTab('top')}
                >
                  <Star size={14} />
                  Top Rated
                </a>
              </li>
            </ul>
          </motion.div>
        </nav>
      </motion.header>

      <main>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'movies' && renderMovies()}
        {activeTab === 'top' && renderTopMovies()}
      </main>
    </div>
  );
}

export default App;