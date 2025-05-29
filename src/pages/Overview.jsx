import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Star, Film } from 'lucide-react';
import Slider from 'react-slick';
import { useMovieData } from '../hooks/useMovieData';
import { importSlideshowImages } from '../utils/slideshowImages';

function Overview() {
  const { movies, movieStats, recentMovies, observeMovieCards } = useMovieData();
  const [isTabVisible, setIsTabVisible] = useState(true);
  const sliderRef = useRef(null);

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

  // Handle visibility change for slideshow
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      
      if (sliderRef.current) {
        if (visible && loadedSlideshowImages.length > 1) {
          sliderRef.current.slickPlay();
        } else {
          sliderRef.current.slickPause();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadedSlideshowImages.length]);

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

  // Slideshow settings
  const sliderSettings = {
    dots: false,
    infinite: loadedSlideshowImages.length > 1,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: loadedSlideshowImages.length > 1 && isTabVisible,
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
          <Slider ref={sliderRef} {...sliderSettings}>
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
                  <span className="stat-number">{movieStats?.totalMovies || 0}</span>
                  <span className="stat-label">Total Movies</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{movieStats?.uniqueMovies || 0}</span>
                  <span className="stat-label">Unique Films</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{movieStats?.averageRating || 0}</span>
                  <span className="stat-label">Average Rating</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{movieStats?.fiveStarMovies || 0}</span>
                  <span className="stat-label">5-Star Movies</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{movieStats?.rewatchPercentage || 0}%</span>
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
}

export default Overview; 