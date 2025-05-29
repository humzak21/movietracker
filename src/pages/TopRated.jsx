import React, { useEffect } from 'react';
import { Star, Film } from 'lucide-react';
import { useMovieData } from '../hooks/useMovieData';

function TopRated() {
  const { topRatedMovies, observeMovieCards } = useMovieData();

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

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
}

export default TopRated; 