import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Film, Star, Settings, LogIn } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import DarkModeToggle from './DarkModeToggle';
import LoginModal from './LoginModal';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginPillVisible, setLoginPillVisible] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
      
      setLastScrollY(currentScrollY);
    }
  });

  const [pageReady, setPageReady] = useState(false);

  // Handle page readiness
  useEffect(() => {
    // Reset on route change
    setPageReady(false);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPageReady(true);
      });
    });
  }, [location.pathname, children]);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const handleTopRightHover = () => {
    if (!isAuthenticated) {
      setLoginPillVisible(true);
    }
  };

  const handleTopRightLeave = () => {
    setLoginPillVisible(false);
  };

  return (
    <div className="App">
      {/* Top right hover area for login pill */}
      {!isAuthenticated && (
        <div 
          className="login-pill-trigger"
          onMouseEnter={handleTopRightHover}
          onMouseLeave={handleTopRightLeave}
        >
          <motion.div
            className="login-pill"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ 
              opacity: loginPillVisible ? 1 : 0,
              scale: loginPillVisible ? 1 : 0.8,
              y: loginPillVisible ? 0 : -10
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{
              pointerEvents: loginPillVisible ? 'auto' : 'none'
            }}
          >
            <button 
              onClick={openLoginModal}
              className="login-pill-btn"
            >
              <LogIn size={16} />
              Login
            </button>
          </motion.div>
        </div>
      )}

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
                <Link 
                  to="/movies" 
                  className={`nav-link ${isActive('/movies') ? 'active' : ''}`}
                >
                  <Film size={14} />
                  Movies
                </Link>
              </li>
              <li>
                <Link 
                  to="/timeline" 
                  className={`nav-link ${isActive('/timeline') ? 'active' : ''}`}
                >
                  <Calendar size={14} />
                  Timeline
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            animate={{ 
              opacity: headerVisible ? 1 : 0,
              scale: headerVisible ? 1 : 0.9
            }}
            transition={{ 
              duration: 0.3,
              delay: headerVisible ? 0.05 : 0
            }}
          >
            <button 
              className="logo"
              onClick={() => navigate('/overview')}
              style={{ 
                background: 'none', 
                border: 'none',
                padding: 0,
                margin: 0
              }}
            >
              Hk
            </button>
          </motion.div>
          
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
                <Link 
                  to="/statistics" 
                  className={`nav-link ${isActive('/statistics') ? 'active' : ''}`}
                >
                  <TrendingUp size={14} />
                  Statistics
                </Link>
              </li>
              <li>
                <Link 
                  to="/toprated" 
                  className={`nav-link ${isActive('/toprated') ? 'active' : ''}`}
                >
                  <Star size={14} />
                  Top Rated
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    <Settings size={14} />
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        </nav>
      </motion.header>

      <main>
        <div style={{ minHeight: '50vh' }}>
          {children}
        </div>
        {pageReady && <DarkModeToggle />}
      </main>

      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}

export default Layout; 