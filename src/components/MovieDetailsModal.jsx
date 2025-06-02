import React, { useState, useEffect, useRef } from 'react';
import { X, Edit3, Save, X as Cancel, Star, Calendar, Tag, RotateCcw, ChevronLeft, ChevronRight, Film, Clock, Users, Play } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const MovieDetailsModal = ({ isOpen, onClose, movie, movies, currentIndex, onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    watchedDate: '',
    starRating: 0,
    percentageRating: '',
    review: '',
    isRewatch: false,
    tags: []
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize edit data when movie changes
  useEffect(() => {
    if (movie) {
      setEditData({
        watchedDate: movie.watch_date || movie.date || '',
        starRating: movie.rating || 0,
        percentageRating: movie.detailed_rating || movie.detailedRating || '',
        review: movie.notes || '',
        isRewatch: movie.is_rewatch || movie.isRewatch || false,
        tags: movie.tags ? (typeof movie.tags === 'string' ? movie.tags.split(', ').filter(Boolean) : movie.tags) : []
      });
    }
  }, [movie]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setSubmitError('');
      setSubmitSuccess(false);
      setCurrentTag('');
      setHoveredStar(0);
    }
  }, [isOpen]);

  // Disable body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen || !movie) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    if (!isAuthenticated) {
      return; // Prevent editing if not authenticated
    }
    setIsEditing(true);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSubmitError('');
    setSubmitSuccess(false);
    // Reset edit data to original values
    setEditData({
      watchedDate: movie.watch_date || movie.date || '',
      starRating: movie.rating || 0,
      percentageRating: movie.detailed_rating || movie.detailedRating || '',
      review: movie.notes || '',
      isRewatch: movie.is_rewatch || movie.isRewatch || false,
      tags: movie.tags ? (typeof movie.tags === 'string' ? movie.tags.split(', ').filter(Boolean) : movie.tags) : []
    });
    setCurrentTag('');
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setSubmitError('You must be logged in to save changes.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const updateData = {
        watch_date: editData.watchedDate,
        rating: editData.starRating || null,
        detailed_rating: editData.percentageRating ? parseInt(editData.percentageRating) : null,
        notes: editData.review || null,
        is_rewatch: editData.isRewatch,
        tags: editData.tags.length > 0 ? editData.tags.join(', ') : null
      };

      const response = await apiService.updateMovie(movie.id, updateData);

      if (response.success) {
        setSubmitSuccess(true);
        setIsEditing(false);
        
        // Update the movie object with new data
        Object.assign(movie, {
          watch_date: editData.watchedDate,
          date: editData.watchedDate,
          rating: editData.starRating,
          detailed_rating: editData.percentageRating ? parseInt(editData.percentageRating) : null,
          detailedRating: editData.percentageRating ? parseInt(editData.percentageRating) : null,
          notes: editData.review,
          is_rewatch: editData.isRewatch,
          isRewatch: editData.isRewatch,
          tags: editData.tags.length > 0 ? editData.tags.join(', ') : null
        });

        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.error || 'Failed to update movie');
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      setSubmitError(error.message || 'Failed to update movie. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    setEditData(prev => ({ ...prev, starRating: rating }));
    
    // Auto-adjust percentage rating to fit within the star rating range
    if (rating > 0 && editData.percentageRating) {
      const minPercent = getPercentageRange(rating).min;
      const maxPercent = getPercentageRange(rating).max;
      const currentPercent = parseInt(editData.percentageRating);
      
      if (currentPercent < minPercent || currentPercent > maxPercent) {
        const midPoint = Math.floor((minPercent + maxPercent) / 2);
        setEditData(prev => ({ ...prev, percentageRating: midPoint.toString() }));
      }
    }
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const getPercentageRange = (stars) => {
    if (stars === 0) return { min: 0, max: 100 };
    if (stars === 0.5) return { min: 0, max: 9 };
    if (stars === 1) return { min: 10, max: 19 };
    if (stars === 1.5) return { min: 20, max: 29 };
    if (stars === 2) return { min: 30, max: 39 };
    if (stars === 2.5) return { min: 40, max: 49 };
    if (stars === 3) return { min: 50, max: 59 };
    if (stars === 3.5) return { min: 60, max: 69 };
    if (stars === 4) return { min: 70, max: 79 };
    if (stars === 4.5) return { min: 80, max: 89 };
    if (stars === 5) return { min: 90, max: 100 };
    return { min: 0, max: 100 };
  };

  const handlePercentageChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0 && parseInt(value) <= 100)) {
      setEditData(prev => ({ ...prev, percentageRating: value }));
    }
  };

  const handlePercentageBlur = (e) => {
    const value = e.target.value;
    if (value === '') return;
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setEditData(prev => ({ ...prev, percentageRating: '' }));
      return;
    }
    
    if (editData.starRating > 0) {
      const range = getPercentageRange(editData.starRating);
      if (numValue < range.min) {
        setEditData(prev => ({ ...prev, percentageRating: range.min.toString() }));
      } else if (numValue > range.max) {
        setEditData(prev => ({ ...prev, percentageRating: range.max.toString() }));
      }
    } else {
      if (numValue < 0) {
        setEditData(prev => ({ ...prev, percentageRating: '0' }));
      } else if (numValue > 100) {
        setEditData(prev => ({ ...prev, percentageRating: '100' }));
      }
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    if (!value.includes(' ')) {
      setCurrentTag(value);
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const newTag = currentTag.trim().toLowerCase();
      if (!editData.tags.includes(newTag)) {
        setEditData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setEditData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const currentRating = hoveredStar || editData.starRating;
      const isFullStar = currentRating >= i;
      const isHalfStar = currentRating >= i - 0.5 && currentRating < i;
      
      stars.push(
        <div key={i} className="star-container">
          {/* Background star (always gray) */}
          <Star 
            size={20} 
            fill="none" 
            color="#86868B"
            className="star-background"
          />
          
          {/* Foreground star (golden, clipped for half stars) */}
          <div className={`star-foreground ${isHalfStar ? 'half-star' : isFullStar ? 'full-star' : 'no-star'}`}>
            <Star 
              size={20} 
              fill="#FFD700" 
              color="#FFD700"
            />
          </div>
          
          {/* Invisible click areas */}
          <button
            type="button"
            className="star-click-area star-left-click"
            onClick={() => handleStarClick(i - 0.5)}
            onMouseEnter={() => handleStarHover(i - 0.5)}
            onMouseLeave={handleStarLeave}
            disabled={!isEditing}
            aria-label={`Rate ${i - 0.5} stars`}
          />
          <button
            type="button"
            className="star-click-area star-right-click"
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => handleStarHover(i)}
            onMouseLeave={handleStarLeave}
            disabled={!isEditing}
            aria-label={`Rate ${i} stars`}
          />
        </div>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatGenres = (genres) => {
    if (!genres || genres.length === 0) return 'Unknown';
    if (Array.isArray(genres)) {
      return genres.map(g => typeof g === 'string' ? g : g.name).join(', ');
    }
    return genres;
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < movies.length - 1 && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <div className="movie-details-modal-overlay" onClick={handleOverlayClick}>
      <div className="movie-details-modal">
        {/* Header with close and navigation */}
        <div className="movie-details-header">
          <button 
            className="movie-details-nav-btn"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            aria-label="Previous movie"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="movie-details-header-center">
            <span className="movie-details-counter">
              {currentIndex + 1} of {movies.length}
            </span>
          </div>
          
          <button 
            className="movie-details-nav-btn"
            onClick={handleNext}
            disabled={currentIndex >= movies.length - 1}
            aria-label="Next movie"
          >
            <ChevronRight size={20} />
          </button>
          
          <button 
            className="movie-details-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="movie-details-success">
            Movie updated successfully! ✨
          </div>
        )}

        {submitError && (
          <div className="movie-details-error">
            {submitError}
          </div>
        )}

        <div className="movie-details-content">
          {/* Movie Poster and Basic Info */}
          <div className="movie-details-main">
            <div className="movie-details-poster">
              {movie.posterUrl || movie.poster_url ? (
                <img
                  src={movie.posterUrl || movie.poster_url}
                  alt={`${movie.title} poster`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="movie-details-poster-fallback" style={{ display: (movie.posterUrl || movie.poster_url) ? 'none' : 'flex' }}>
                <Film size={64} />
                <span>No Poster</span>
              </div>
            </div>

            <div className="movie-details-info">
              <h2 className="movie-details-title">{movie.title}</h2>
              
              {movie.release_year && (
                <p className="movie-details-year">{movie.release_year}</p>
              )}

              {movie.overview && (
                <p className="movie-details-overview">{movie.overview}</p>
              )}

              {/* Movie Metadata */}
              <div className="movie-details-metadata">
                {movie.runtime && (
                  <div className="movie-details-meta-item">
                    <Clock size={16} />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}

                {movie.genres && (
                  <div className="movie-details-meta-item">
                    <Tag size={16} />
                    <span>{formatGenres(movie.genres)}</span>
                  </div>
                )}

                {movie.director && (
                  <div className="movie-details-meta-item">
                    <Users size={16} />
                    <span>Directed by {movie.director}</span>
                  </div>
                )}

                {movie.vote_average && (
                  <div className="movie-details-meta-item">
                    <Star size={16} />
                    <span>TMDB: {movie.vote_average}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Data Section */}
          <div className="movie-details-user-data">
            <div className="movie-details-section-header">
              <h3>Your Review</h3>
              {isAuthenticated ? (
                !isEditing ? (
                  <button 
                    className="movie-details-edit-btn"
                    onClick={handleEdit}
                    aria-label="Edit review"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="movie-details-edit-actions">
                    <button 
                      className="movie-details-save-btn"
                      onClick={handleSave}
                      disabled={isSubmitting}
                      aria-label="Save changes"
                    >
                      <Save size={16} />
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className="movie-details-cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      aria-label="Cancel editing"
                    >
                      <Cancel size={16} />
                      Cancel
                    </button>
                  </div>
                )
              ) : (
                <span className="movie-details-value">
                  You need to be logged in to edit this review.
                </span>
              )}
            </div>

            {/* Watched Date */}
            <div className="movie-details-field">
              <label>Watched Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.watchedDate}
                  onChange={(e) => setEditData(prev => ({ ...prev, watchedDate: e.target.value }))}
                  className="movie-details-input"
                  disabled={isSubmitting}
                />
              ) : (
                <span className="movie-details-value">
                  {formatDate(movie.watch_date || movie.date)}
                </span>
              )}
            </div>

            {/* Star Rating */}
            <div className="movie-details-field">
              <label>Star Rating</label>
              <div className="movie-details-rating">
                <div className="star-rating-stars">
                  {renderStars()}
                </div>
                <span className="star-rating-value">
                  {(isEditing ? editData.starRating : (movie.rating || 0)) > 0 
                    ? `${isEditing ? editData.starRating : movie.rating}/5` 
                    : 'No rating'}
                </span>
              </div>
            </div>

            {/* Percentage Rating */}
            <div className="movie-details-field">
              <label>Percentage Rating</label>
              {isEditing ? (
                <div className="percentage-rating-container">
                  <div className="movie-details-input-wrapper">
                    <input
                      type="number"
                      min={editData.starRating > 0 ? getPercentageRange(editData.starRating).min : 0}
                      max={editData.starRating > 0 ? getPercentageRange(editData.starRating).max : 100}
                      value={editData.percentageRating}
                      onChange={handlePercentageChange}
                      onBlur={handlePercentageBlur}
                      className="movie-details-input percentage-input"
                      disabled={isSubmitting}
                      placeholder="85"
                    />
                    <span className="percentage-symbol">%</span>
                  </div>
                  {editData.starRating > 0 && (
                    <div className="percentage-range-hint">
                      Range: {getPercentageRange(editData.starRating).min}-{getPercentageRange(editData.starRating).max}%
                    </div>
                  )}
                </div>
              ) : (
                <span className="movie-details-value">
                  {movie.detailed_rating || movie.detailedRating ? `${movie.detailed_rating || movie.detailedRating}%` : 'No rating'}
                </span>
              )}
            </div>

            {/* Rewatch Status */}
            <div className="movie-details-field">
              <label>Rewatch</label>
              {isEditing ? (
                <button
                  type="button"
                  className={`rewatch-toggle-btn ${editData.isRewatch ? 'active' : ''}`}
                  onClick={() => setEditData(prev => ({ ...prev, isRewatch: !prev.isRewatch }))}
                  disabled={isSubmitting}
                >
                  <RotateCcw size={16} />
                  <span>{editData.isRewatch ? 'Yes, this is a rewatch' : 'No, first time watching'}</span>
                </button>
              ) : (
                <span className="movie-details-value">
                  {movie.is_rewatch || movie.isRewatch ? 'Yes' : 'No'}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="movie-details-field">
              <label>Tags</label>
              {isEditing ? (
                <div className="tags-container">
                  <div className="movie-details-input-wrapper">
                    <Tag className="movie-details-input-icon" size={16} />
                    <input
                      type="text"
                      placeholder="Add a tag (one word only)..."
                      value={currentTag}
                      onChange={handleTagInputChange}
                      onKeyPress={handleTagKeyPress}
                      className="movie-details-input"
                      disabled={isSubmitting}
                    />
                  </div>
                  {editData.tags.length > 0 && (
                    <div className="tags-list">
                      {editData.tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                          {tag}
                          <button
                            type="button"
                            className="tag-remove"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove ${tag} tag`}
                            disabled={isSubmitting}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="movie-details-tags-display">
                  {movie.tags ? (
                    typeof movie.tags === 'string' 
                      ? movie.tags.split(', ').filter(Boolean).map((tag, index) => (
                          <span key={index} className="tag-item-display">{tag}</span>
                        ))
                      : movie.tags.map((tag, index) => (
                          <span key={index} className="tag-item-display">{tag}</span>
                        ))
                  ) : (
                    <span className="movie-details-value">No tags</span>
                  )}
                </div>
              )}
            </div>

            {/* Review */}
            <div className="movie-details-field">
              <label>Review</label>
              {isEditing ? (
                <textarea
                  value={editData.review}
                  onChange={(e) => setEditData(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Write your review..."
                  rows={4}
                  className="movie-details-textarea"
                  disabled={isSubmitting}
                />
              ) : (
                <div className="movie-details-review">
                  {movie.notes ? (
                    <p>{movie.notes}</p>
                  ) : (
                    <span className="movie-details-value">No review</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal; 