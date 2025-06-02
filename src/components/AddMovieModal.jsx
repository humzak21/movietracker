import React, { useState } from 'react';
import { X, Search, Star } from 'lucide-react';

const AddMovieModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [review, setReview] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [percentageRating, setPercentageRating] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStarClick = (rating) => {
    setStarRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0.5; i <= 5; i += 0.5) {
      const isHalf = i % 1 !== 0;
      const isActive = (hoveredStar || starRating) >= i;
      
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-rating-btn ${isActive ? 'active' : ''} ${isHalf ? 'half' : 'full'}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
        >
          <Star 
            size={20} 
            fill={isActive ? '#FFD700' : 'none'} 
            color={isActive ? '#FFD700' : '#86868B'}
          />
        </button>
      );
    }
    return stars;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add movie submission functionality
    console.log('Movie data:', {
      searchQuery,
      review,
      starRating,
      percentageRating
    });
    onClose();
  };

  return (
    <div className="add-movie-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-movie-modal">
        <button 
          className="add-movie-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="add-movie-modal-header">
          <h2>Add Movie</h2>
          <p>Search for a movie and add your review</p>
        </div>

        <form className="add-movie-modal-form" onSubmit={handleSubmit}>
          {/* Movie Search */}
          <div className="add-movie-form-group">
            <label htmlFor="movie-search">Movie</label>
            <div className="add-movie-input-wrapper">
              <Search className="add-movie-input-icon" size={16} />
              <input
                id="movie-search"
                type="text"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Review Section */}
          <div className="add-movie-form-group">
            <label htmlFor="movie-review">Review</label>
            <textarea
              id="movie-review"
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="add-movie-textarea"
            />
          </div>

          {/* Star Rating */}
          <div className="add-movie-form-group">
            <label>Star Rating</label>
            <div className="star-rating-container">
              <div className="star-rating-stars">
                {renderStars()}
              </div>
              <span className="star-rating-value">
                {starRating > 0 ? `${starRating}/5` : 'No rating'}
              </span>
            </div>
          </div>

          {/* Percentage Rating */}
          <div className="add-movie-form-group">
            <label htmlFor="percentage-rating">Percentage Rating (0-100)</label>
            <div className="add-movie-input-wrapper">
              <input
                id="percentage-rating"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={percentageRating}
                onChange={(e) => setPercentageRating(e.target.value)}
                className="percentage-input"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>

          <button type="submit" className="add-movie-submit-btn">
            Add Movie
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal; 