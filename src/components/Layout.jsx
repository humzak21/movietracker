import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Film, Star, User, LogOut, Settings } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/login');
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
                <li className="user-menu-container" ref={userMenuRef}>
                  <button
                    className="user-menu-trigger"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </button>
                  
                  {showUserMenu && (
                    <motion.div
                      className="user-menu"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '200px',
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-color)' }}>
                          {user?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {user?.email}
                        </div>
                      </div>
                      
                      <div style={{ padding: '8px 0' }}>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // Navigate to profile page when implemented
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: 'var(--text-color)',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-bg)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Settings size={14} />
                          Profile Settings
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: 'var(--text-color)',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-bg)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
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
    </div>
  );
}

export default Layout; 