import React, { useState, useMemo, useEffect } from 'react';
import { Star, Calendar, TrendingUp, Film, Search, Filter } from 'lucide-react';
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

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [yearFilter, setYearFilter] = useState('all');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineLimit, setTimelineLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingPosters, setIsLoadingPosters] = useState(false);
  const [loadingMovieTitles, setLoadingMovieTitles] = useState(new Set());

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
    if (movies.length === 0 || loading) return;
    
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
  }, [movies, loading]);

  // Set up intersection observer when movies change
  useEffect(() => {
    if (movies.length === 0 || loading) return;
    
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
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
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
    if (loading) {
      return (
        <div className="section">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2>Loading movie data...</h2>
              <p>Parsing your complete movie collection from CSV...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="section">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2>No movie data available</h2>
              <p>Unable to load movie data from CSV</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="section">
        <div className="container">
          <div className="hero">
            <h1>Hak Movie Tracker</h1>
            <p>Humza's Personal Movie Tracker - Now with {movies.length} entries!</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{stats.totalMovies || 0}</span>
                <span className="stat-label">Total Movies</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.uniqueMovies || 0}</span>
                <span className="stat-label">Unique Films</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.averageRating || 0}</span>
                <span className="stat-label">Average Rating</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.fiveStarMovies || 0}</span>
                <span className="stat-label">5-Star Movies</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.rewatchPercentage || 0}%</span>
                <span className="stat-label">Rewatches</span>
              </div>
            </div>
          </div>

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
    );
  };

  const renderTimeline = () => {
    if (loading) {
      return (
        <div className="section">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2>Loading timeline...</h2>
            </div>
          </div>
        </div>
      );
    }

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
    if (loading) {
      return (
        <div className="section">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2>Loading movie collection...</h2>
            </div>
          </div>
        </div>
      );
    }

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
    if (loading) {
      return (
        <div className="section">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h2>Loading top movies...</h2>
            </div>
          </div>
        </div>
      );
    }

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

          {/* <h2 className="section-title" style={{ marginTop: '60px' }}>Recently Watched</h2> */}
          
          {/* <div className="movie-grid">
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
          </div> */}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <nav className="nav">
            <a href="#" className="logo">🎬 Movie Tracker</a>
            <ul className="nav-links">
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <TrendingUp size={16} />
                  Overview
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  <Calendar size={16} />
                  Timeline
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('movies')}
                >
                  <Film size={16} />
                  Movies
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${activeTab === 'top' ? 'active' : ''}`}
                  onClick={() => setActiveTab('top')}
                >
                  <Star size={16} />
                  Top Rated
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

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