// API service for Movie Tracker Backend

// Use environment variable for API base URL, with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make a request to the backend API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Diary/Movie operations
  async getAllMovies(page = 1, limit = 50) {
    return this.request(`/?page=${page}&limit=${limit}`);
  }

  async getUniqueMovies() {
    return this.request('/unique');
  }

  async getTopRatedMovies(minRating = 90, page = 1, limit = 50) {
    return this.request(`/top-rated?minRating=${minRating}&page=${page}&limit=${limit}`);
  }

  async getMovieById(id) {
    return this.request(`/${id}`);
  }

  async addMovie(movieData) {
    return this.request('/add', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async updateMovie(id, movieData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
  }

  async updateUserRating(id, ratingData) {
    return this.request(`/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify(ratingData),
    });
  }

  async deleteMovie(id) {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  async searchMovies(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  async getMovieStats() {
    return this.request('/stats');
  }

  async enhanceMovieWithTMDB(id) {
    return this.request(`/${id}/enhance`, {
      method: 'POST',
    });
  }

  // TMDB operations
  async searchTMDB(query, year = null) {
    const yearParam = year ? `&year=${year}` : '';
    return this.request(`/tmdb/search?q=${encodeURIComponent(query)}${yearParam}`);
  }

  async getTrendingMovies(timeWindow = 'week') {
    return this.request(`/tmdb/trending?timeWindow=${timeWindow}`);
  }

  async getGenres() {
    return this.request('/tmdb/genres');
  }

  // Health check
  async healthCheck() {
    // Use the backend base URL for health check
    const healthURL = this.baseURL.replace('/api', '/health');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(healthURL, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Batch operations
  async enhanceAllMovies() {
    // This would trigger the enhancement script
    // For now, just return a placeholder
    return { success: true, message: 'Run "npm run enhance" in the backend to enhance all movies' };
  }
}

export default new ApiService(); 