'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('');
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clickedLink, setClickedLink] = useState<string | null>(null);

  const links = [
    { name: 'Home', href: '#home' },
    { name: 'Roles', href: '#learners' },
    { name: 'Overview', href: '#how-it-works' },
    { name: 'Get Started', href: '#get-started' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const goToLogin = () => {
    setIsLoginClicked(true);
    closeMenu();
    router.push('/auth/login');
  };

  const handleLinkClick = (link: { name: string; href: string }) => {
    if (pathname !== '/') {
      // Navigate to home page first
      router.push('/');
      // The scroll will be handled by the useEffect below
      sessionStorage.setItem('scrollToSection', link.href);
    } else {
      // Already on home page, just scroll to section
      scrollToSection(link.href);
    }

    setActiveLink(link.name);
    closeMenu();
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId.startsWith('#')) {
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        if (element) {
          const navbarHeight = 80;
          const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 200;

    links.forEach((link) => {
      if (link.href.startsWith('#')) {
        const element = document.querySelector(link.href);
        if (element) {
          const sectionTop = element.getBoundingClientRect().top + window.pageYOffset;
          const sectionHeight = element.clientHeight;
          
          if (
            sectionTop <= scrollPosition &&
            sectionTop + sectionHeight > scrollPosition
          ) {
            setActiveLink(link.name);
          }
        }
      }
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    const navElement = document.querySelector('header');
    if (navElement && !navElement.contains(event.target as Node) && isMenuOpen) {
      closeMenu();
    }
  };

  useEffect(() => {
    // Check if we're on login page
      setIsLoginClicked(pathname === '/auth/login');    
    // Set up scroll listener if on home page
    if (pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial position
      
      // Check if we need to scroll to a section after navigation
      const scrollToSectionId = sessionStorage.getItem('scrollToSection');
      if (scrollToSectionId) {
        scrollToSection(scrollToSectionId);
        sessionStorage.removeItem('scrollToSection');
      }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [pathname, isMenuOpen]);

  return (
    <header>
      <div className="header-logo">
        <Image 
          alt="Company logo" 
          src="/logo_gccoed.png" 
          width={56} 
          height={40}
        />
        <span>MindMates</span>
      </div>

      <button
        className="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
      </button>

      <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="nav-links">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`
                nav-link 
                ${activeLink === link.name ? 'active' : ''}
                ${clickedLink === link.name ? 'clicked' : ''}
              `}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link);
              }}
              onMouseDown={() => setClickedLink(link.name)}
              onMouseUp={() => setClickedLink(null)}
              onMouseLeave={() => setClickedLink(null)}
            >
              <span className="link-text">{link.name}</span>
              <span className="link-underline"></span>
            </a>
          ))}
        </div>
        <button
          className={`nav-button ${isLoginClicked ? 'clicked' : ''}`}
          onClick={goToLogin}
        >
          <svg className="login-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="currentColor"
              d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M12,13C14.67,13 20,14.33 20,17V20H4V17C4,14.33 9.33,13 12,13M12,14.9C9.03,14.9 5.9,16.36 5.9,17V18.1H18.1V17C18.1,16.36 14.97,14.9 12,14.9Z"
            />
          </svg>
          Login
        </button>
      </nav>

      {/* Add overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="nav-overlay" 
          onClick={closeMenu}
        />
      )}

      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 1rem 2rem;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
          background-color: white;
          font-family: "Inter", sans-serif;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          height: auto;
        }

        /* Logo Styles */
        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 110;
        }

        .header-logo span {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0e8ca3;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 21px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 110;
        }

        .hamburger-line {
          display: block;
          height: 3px;
          width: 100%;
          background: #0e8ca3;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .hamburger-line:nth-child(1).active {
          transform: translateY(9px) rotate(45deg);
        }

        .hamburger-line:nth-child(2).active {
          opacity: 0;
        }

        .hamburger-line:nth-child(3).active {
          transform: translateY(-9px) rotate(-45deg);
        }

        .header-nav {
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          right: -120%;
          width: 90%;
          height: 100%;
          background-color: rgb(220, 226, 230);
          border-radius: 25px 0 0 25px;
          padding: 6rem 1.5rem 2rem;
          transition: right 0.3s ease;
          z-index: 105;
          box-shadow: -8px 15px 25px rgba(96, 102, 147, 0.4),
            -3px 0 10px rgba(0, 0, 0, 0.1);
        }

        .header-nav.active {
          right: 0;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
          margin-top: 1.5rem;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          padding: 0.5rem 1rem;
          transition: all 0.2s ease;
          font-size: 1.1rem;
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .link-text {
          position: relative;
          z-index: 1;
        }

        .link-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #0e8ca3;
          transition: width 0.3s ease;
        }

        .nav-link:hover .link-underline {
          width: 100%;
        }

        .nav-link.clicked .link-underline,
        .nav-link.active .link-underline {
          width: 100%;
        }

        .nav-link.active {
          color: #0e8ca3;
          font-weight: 500;
        }

        .nav-button {
          background: transparent;
          border: 1px solid #0e8ca3;
          color: #0e8ca3;
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          font-family: "Inter", sans-serif;
          cursor: pointer;
          font-size: 1rem;
          margin: 13rem auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          width: fit-content;
        }

        .login-icon {
          transition: all 0.3s ease;
        }

        .nav-button:hover,
        .nav-button.clicked {
          background: #0e8ca3;
          color: white;
        }

        .nav-button:hover .login-icon,
        .nav-button.clicked .login-icon {
          fill: white;
        }

        .nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 104;
        }

        @media (min-width: 768px) {
          .hamburger {
            display: none;
          }

          .header-nav {
            position: static;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: auto;
            padding: 0;
            background-color: transparent;
            box-shadow: none;
            transform: none;
            right: auto;
          }

          .nav-links {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            flex-direction: row;
            gap: 4.5rem;
            margin: 0;
          }

          .nav-link {
            padding: 0.3rem 0;
            font-size: 1rem;
          }

          .link-underline {
            display: block;
          }

          .nav-link:hover,
          .nav-link.active {
            border-bottom: none;
          }

          .nav-button {
            position: static;
            margin: 0 0 0 auto;
            margin-top: 0;
          }

          .header-logo {
            position: static;
          }

          .nav-overlay {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}