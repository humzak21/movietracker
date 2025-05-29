import React, { useEffect } from 'react';
import { Star, Film } from 'lucide-react';
import { useMovieData } from '../hooks/useMovieData';

function Movies() {
  const { 
    filteredMovies, 
    searchQuery, 
    setSearchQuery, 
    ratingFilter, 
    setRatingFilter, 
    yearFilter, 
    setYearFilter,
    availableYears,
    observeMovieCards 
  } = useMovieData();

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

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
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
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
}

export default Movies; 