import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Calendar, Film, Star } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';

function Layout({ children }) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef(null);
  const location = useLocation();

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

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
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
                  to="/" 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                >
                  <TrendingUp size={14} />
                  Overview
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
          
          <motion.Link 
            to="/" 
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
            Hk
          </motion.Link>
          
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
                  to="/movies" 
                  className={`nav-link ${isActive('/movies') ? 'active' : ''}`}
                >
                  <Film size={14} />
                  Movies
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
            </ul>
          </motion.div>
        </nav>
      </motion.header>

      <main>
        {children}
      </main>
    </div>
  );
}

export default Layout; 