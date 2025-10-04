'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainComponent from '@/components/mentorpage/main/page';
import SessionComponent from '@/components/mentorpage/session/page';
import ReviewsComponent from '@/components/mentorpage/reviews/page';
import FilesComponent from '@/components/mentorpage/files/page';
import FileManagerComponent from '@/components/mentorpage/filemanager/page';
import EditInformationComponent from '@/components/mentorpage/information/page';
import LogoutComponent from '@/components/mentorpage/logout/page';
import './mentor.css';

interface User {
  id: number | null;
  name: string;
  email: string;
  role: string;
}

interface Mentor {
  address: string;
  proficiency: string;
  year: string;
  course: string;
  availability: string[];
  prefSessDur: string;
  bio: string;
  subjects: string[];
  image: string;
  phoneNum: string;
  teach_sty: string[];
  credentials: string[];
  exp: string;
  rating_ave: number;
  gender?: string;
  learn_modality?: string;
}

interface UserData {
  user: User;
  ment: Mentor;
  image_url: string | null;
}

export default function MentorPage() {
  const router = useRouter();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    user: {
      id: null,
      name: "John Doe",
      email: "john@example.com",
      role: "mentor",
    },
    ment: {
      address: "123 Main St",
      proficiency: "Advanced",
      year: "3rd Year",
      course: "Computer Science (CS)",
      availability: ["Monday", "Wednesday", "Friday"],
      prefSessDur: "1 hour",
      bio: "Experienced mentor with 3 years of teaching experience in computer science subjects.",
      subjects: ["Mathematics", "Physics", "Programming", "Algorithms", "Data Structures", "Web Development", "Database Management"],
      image: "",
      phoneNum: "123-456-7890",
      teach_sty: ["Interactive", "Practical"],
      credentials: ["Bachelor of Science in Computer Science", "Teaching Certificate"],
      exp: "3 years",
      rating_ave: 4.5,
      gender: "Male",
      learn_modality: "Online",
    },
    image_url: null,
  });
  
  const [users, setUsers] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOffer, setShowOffer] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [activeComponent, setActiveComponent] = useState("main");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showEditInformation, setShowEditInformation] = useState(false);
  const [showAccessibilityNav, setShowAccessibilityNav] = useState(false);

  // NEW: Keyboard navigation state
  const [focusedTopbarIndex, setFocusedTopbarIndex] = useState(0);
  const [isTopbarFocused, setIsTopbarFocused] = useState(false);
  const topbarRef = useRef<HTMLDivElement>(null);

  // Define topbar items in order
  const topbarItems = [
    { key: 'main', label: 'Learners', icon: '/main.svg' },
    { key: 'session', label: 'Schedules', icon: '/calendar.svg' },
    { key: 'reviews', label: 'Reviews', icon: '/records.svg' },
    { key: 'files', label: 'Files', icon: '/uploadCloud.svg' },
    { key: 'fileManage', label: 'File Manager', icon: '/files.svg' }
  ];

  // Computed properties
  const displayedCourses = userData.ment.subjects.slice(0, 5);
  const remainingCoursesCount = Math.max(userData.ment.subjects.length - 5, 0);

  // NEW: Keyboard navigation functions for topbar
  const handleTopbarKeyDown = (e: React.KeyboardEvent) => {
    if (!isTopbarFocused) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        navigateTopbar('right');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigateTopbar('left');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activateTopbarItem();
        break;
      case 'Home':
        e.preventDefault();
        setFocusedTopbarIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedTopbarIndex(topbarItems.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        setIsTopbarFocused(false);
        break;
    }
  };

  const navigateTopbar = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setFocusedTopbarIndex((prev) => (prev + 1) % topbarItems.length);
    } else {
      setFocusedTopbarIndex((prev) => (prev - 1 + topbarItems.length) % topbarItems.length);
    }
  };

  const activateTopbarItem = () => {
    const focusedItem = topbarItems[focusedTopbarIndex];
    switchComponent(focusedItem.key);
  };

  const focusTopbar = () => {
    setIsTopbarFocused(true);
    // Set focus to current active component
    const currentIndex = topbarItems.findIndex(item => item.key === activeComponent);
    setFocusedTopbarIndex(currentIndex >= 0 ? currentIndex : 0);
  };

  // API functions
  const loggedUserDets = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const learnersProfile = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers([
        { id: 1, userName: "Alice Johnson", yearLevel: "2nd Year", course: "Computer Science" },
        { id: 2, userName: "Bob Smith", yearLevel: "1st Year", course: "Information Technology" },
        { id: 3, userName: "Carol Davis", yearLevel: "3rd Year", course: "Software Engineering" },
      ]);
    } catch (error) {
      console.error("Error fetching learner profiles:", error);
    }
  };

  const sessionInfo = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTodaySchedule([
        { 
          id: 1, 
          time: "10:00 AM", 
          subject: "Mathematics",
          date: "2024-01-10",
          location: "Room 101",
          learner: { user: { name: "Alice Johnson" } }
        },
        { 
          id: 2, 
          time: "2:00 PM", 
          subject: "Programming",
          date: "2024-01-10", 
          location: "Online",
          learner: { user: { name: "Bob Smith" } }
        },
      ]);
      setUpcomingSchedule([
        { 
          id: 3, 
          date: "2024-01-15", 
          time: "11:00 AM", 
          subject: "Algorithms",
          location: "Library",
          learner: { user: { name: "Carol Davis" } }
        },
      ]);
    } catch (error) {
      console.error("Error fetching session info:", error);
    }
  };

  const getFeedbacks = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFeedbacks([
        { 
          id: 1, 
          rating: 5, 
          comment: "Excellent mentor! Very patient and knowledgeable.", 
          student: "Alice Johnson",
          date: "2024-01-15"
        },
        { 
          id: 2, 
          rating: 4, 
          comment: "Very helpful sessions, great explanations.", 
          student: "Bob Smith",
          date: "2024-01-12"
        },
        { 
          id: 3, 
          rating: 5, 
          comment: "Amazing teaching style, helped me understand complex topics easily.", 
          student: "Carol Davis",
          date: "2024-01-10"
        },
      ]);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  const getFiles = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFiles([
        { id: 1, name: "Mathematics_Notes.pdf", size: "2.4 MB", date: "2024-01-10" },
        { id: 2, name: "Programming_Exercises.zip", size: "5.1 MB", date: "2024-01-08" },
      ]);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const registerLearnerRole = async () => {
    try {
      await fetch('/api/set/2nd_role', { method: 'POST' });
      router.push('/learner-info/alt');
    } catch (error) {
      console.error("Error registering learner role:", error);
    }
  };

  const switchRole = async () => {
    try {
      await fetch('/api/switch', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error("Error switching role:", error);
    }
  };

  // Component functions
  const switchComponent = (component: string) => {
    if (activeComponent !== component) {
      setActiveComponent(component);
    }
    if (isMobileView) {
      setIsSidebarVisible(false);
    }
    // Update focused index when component changes via click
    const newIndex = topbarItems.findIndex(item => item.key === component);
    if (newIndex >= 0) {
      setFocusedTopbarIndex(newIndex);
    }
  };

  const toggleShowAllCourses = () => {
    setShowAllCourses(!showAllCourses);
  };

  // Edit Information functions
  const openEditInformation = () => {
    setShowEditInformation(true);
  };

  const handleSaveInformation = (updatedData: UserData) => {
    setUserData(updatedData);
    setShowEditInformation(false);
  };

  const handleCancelEdit = () => {
    setShowEditInformation(false);
  };

  // UPDATED LOGOUT FUNCTIONS
  const handleOfferConfirm = () => {
    setShowOffer(false);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const checkMobileView = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobileView(mobile);
    if (!mobile) {
      setIsSidebarVisible(true);
    } else {
      setIsSidebarVisible(false);
    }
  };

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.round(rating) ? 'filledStar' : 'emptyStar'}>
            {i < Math.round(rating) ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  // Records component
  const RecordsComponent = () => (
    <div className="component-records">
      <h2>Student Reviews</h2>
      <div className="reviews-list">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="review-item">
            <div className="review-header">
              <span className="reviewer">{feedback.student}</span>
              <StarRating rating={feedback.rating} />
            </div>
            <p className="review-comment">{feedback.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // UPDATED Accessibility Navigation Pad Component with Enhanced Keyboard Navigation
  const AccessibilityNavPad = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [focusedNavIndex, setFocusedNavIndex] = useState(0);

    // Define navbar items in order
    const navItems = [
      { key: 'main', label: 'Learners', icon: '/main.svg' },
      { key: 'session', label: 'Schedules', icon: '/calendar.svg' },
      { key: 'reviews', label: 'Reviews', icon: '/records.svg' },
      { key: 'files', label: 'Files', icon: '/uploadCloud.svg' },
      { key: 'fileManage', label: 'File Manager', icon: '/files.svg' }
    ];

    // Keyboard shortcuts handler
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Toggle nav pad with Ctrl + Alt + N
        if (e.ctrlKey && e.altKey && e.key === 'n') {
          e.preventDefault();
          setIsVisible(prev => !prev);
          // Reset focus to current active component when opening
          const currentIndex = navItems.findIndex(item => item.key === activeComponent);
          setFocusedNavIndex(currentIndex >= 0 ? currentIndex : 0);
        }

        // Navigation shortcuts when nav pad is visible
        if (isVisible) {
          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              navigateNavItems('left');
              break;
            case 'ArrowRight':
              e.preventDefault();
              navigateNavItems('right');
              break;
            case 'Enter':
            case ' ':
              e.preventDefault();
              activateFocusedNavItem();
              break;
            case 'Escape':
              e.preventDefault();
              setIsVisible(false);
              break;
            case 'Home':
              e.preventDefault();
              setFocusedNavIndex(0);
              break;
            case 'End':
              e.preventDefault();
              setFocusedNavIndex(navItems.length - 1);
              break;
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, focusedNavIndex, activeComponent]);

    const navigateNavItems = (direction: 'left' | 'right') => {
      if (direction === 'right') {
        setFocusedNavIndex((prev) => (prev + 1) % navItems.length);
      } else {
        setFocusedNavIndex((prev) => (prev - 1 + navItems.length) % navItems.length);
      }
    };

    const activateFocusedNavItem = () => {
      const focusedItem = navItems[focusedNavIndex];
      setActiveComponent(focusedItem.key);
      // Don't close the nav pad on activation, keep it open for continued navigation
    };

    const quickNavigate = (component: string) => {
      setActiveComponent(component);
      const index = navItems.findIndex(item => item.key === component);
      if (index >= 0) {
        setFocusedNavIndex(index);
      }
    };

    const handleNavPadClose = () => {
      setIsVisible(false);
      // Reset focus to currently active component
      const currentIndex = navItems.findIndex(item => item.key === activeComponent);
      setFocusedNavIndex(currentIndex >= 0 ? currentIndex : 0);
    };

    if (!isVisible) return null;

    return (
      <>
        <div className="accessibility-nav-pad-overlay" onClick={handleNavPadClose}></div>
        <div className="accessibility-nav-pad">
          <div className="nav-pad-header">
            <h3>Accessibility Navigation</h3>
            <button 
              className="close-nav-pad" 
              onClick={handleNavPadClose}
              aria-label="Close navigation pad"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="nav-pad-controls">
            {/* Visual Navigation Indicator */}
            <div className="nav-visual-indicator">
              <div className="nav-track">
                {navItems.map((item, index) => (
                  <div
                    key={item.key}
                    className={`nav-point ${index === focusedNavIndex ? 'focused' : ''} ${
                      item.key === activeComponent ? 'active' : ''
                    }`}
                    onClick={() => {
                      setFocusedNavIndex(index);
                      activateFocusedNavItem();
                    }}
                  >
                    <div className="nav-point-icon">
                      <img src={item.icon} alt={item.label} />
                    </div>
                    <span className="nav-point-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="nav-direction">
              <button 
                className="nav-btn left-btn"
                onClick={() => navigateNavItems('left')}
                aria-label="Navigate to previous nav item"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Previous</span>
              </button>
              
              <div className="nav-display">
                <span className="current-nav-item">
                  {navItems[focusedNavIndex]?.label}
                </span>
                <span className="nav-position">
                  {focusedNavIndex + 1} of {navItems.length}
                </span>
              </div>
              
              <button 
                className="nav-btn right-btn"
                onClick={() => navigateNavItems('right')}
                aria-label="Navigate to next nav item"
              >
                <span>Next</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            <div className="nav-activation">
              <button 
                className="activate-btn"
                onClick={activateFocusedNavItem}
                aria-label={`Activate ${navItems[focusedNavIndex]?.label} section`}
              >
                <i className="fas fa-arrow-right-to-bracket"></i>
                Activate {navItems[focusedNavIndex]?.label}
              </button>
            </div>

            <div className="quick-nav-grid">
              {navItems.map((item, index) => (
                <button 
                  key={item.key}
                  className={`quick-nav-btn ${item.key === activeComponent ? 'active' : ''} ${
                    index === focusedNavIndex ? 'focused' : ''
                  }`}
                  onClick={() => quickNavigate(item.key)}
                >
                  <img src={item.icon} alt={item.label} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="nav-shortcuts">
              <div className="shortcut-item">
                <kbd>←</kbd> / <kbd>→</kbd>
                <span>Navigate Nav Items</span>
              </div>
              <div className="shortcut-item">
                <kbd>Enter</kbd> / <kbd>Space</kbd>
                <span>Activate Focused Item</span>
              </div>
              <div className="shortcut-item">
                <kbd>Home</kbd> / <kbd>End</kbd>
                <span>Jump to First/Last</span>
              </div>
              <div className="shortcut-item">
                <kbd>ESC</kbd>
                <span>Close Navigation Pad</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // UPDATED renderComponent function - logout as overlay
  const renderComponent = () => {
    const mainContent = (() => {
      switch (activeComponent) {
        case 'main':
          return (
            <MainComponent 
              users={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUserId={setUserId}
              mentorData={userData}
            />
          );
        case 'session':
          return <SessionComponent schedule={todaySchedule} upcomingSchedule={upcomingSchedule} />;
        case 'reviews':
          return <ReviewsComponent feedbacks={feedbacks} />;
        case 'files':
          return <FilesComponent files={files} setFiles={setFiles} />;
        case 'records':
          return <RecordsComponent />;
        case 'fileManage':
          return <FileManagerComponent files={files} setFiles={setFiles} />;
        case 'logout': 
          return (
            <MainComponent 
              users={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUserId={setUserId}
              mentorData={userData}
            />
          );
        default:
          return (
            <MainComponent 
              users={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUserId={setUserId}
              mentorData={userData}
            />
          );
      }
    })();

    return (
      <>
        {mainContent}
        
        {/* Render LogoutComponent as overlay when active */}
        {activeComponent === 'logout' && (
          <LogoutComponent 
            onCancel={() => switchComponent('main')} 
            onLogout={() => {
              // Handle any additional logout logic here
              console.log('User logged out');
            }}
          />
        )}
      </>
    );
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);

      try {
        await Promise.allSettled([
          loggedUserDets(),
          learnersProfile(),
          sessionInfo(),
          getFeedbacks(),
          getFiles(),
        ]);
      } catch (error) {
        console.error("Critical error during initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  return (
    <div className="mentor-page">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Edit Information Popup Overlay */}
      {showEditInformation && (
        <EditInformationComponent 
          userData={userData}
          onSave={handleSaveInformation}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Accessibility Navigation Pad */}
      <AccessibilityNavPad />

      {/* Accessibility Toggle Button */}
      <button 
        className="accessibility-toggle-btn"
        onClick={() => setShowAccessibilityNav(prev => !prev)}
        aria-label="Toggle accessibility navigation"
        title="Accessibility Navigation (Ctrl+Alt+N)"
      >
        <i className="fas fa-universal-access"></i>
      </button>

      {/* Mobile Sidebar Toggle Button */}
      {isMobileView && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Overlay to close sidebar on mobile */}
      {isMobileView && isSidebarVisible && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar ${
          isMobileView ? 'sidebar-mobile' : ''
        } ${
          isMobileView && isSidebarVisible ? 'sidebar-mobile-visible' : ''
        }`}
      >
        <div className="logo-container">
          <img src="/logo_gccoed.png" alt="GCCoEd Logo" className="logo" />
          <span className="logo-text">MindMates</span>
        </div>

        <div className="upper-element">
          <div>
            <h1>Hi, Mentor!</h1>
            <img
              src={userData.image_url || 'https://placehold.co/600x400'}
              alt="profile-pic"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400';
              }}
            />
          </div>
          <div>
            <h2>{userData.user.name}</h2>
            <i><p>{userData.ment.proficiency}</p></i>
            <StarRating rating={userData.ment.rating_ave} />
          </div>
        </div>

        <div className="footer-element">
          <div className="user-information">
            <h1>User Information</h1>
            <div className="lines">
              <h3>Year Level:</h3>
              <div>
                <p>{userData.ment.year}</p>
              </div>
            </div>

            <div className="lines">
              <h3>Program:</h3>
              <div>
                <p>
                  {userData.ment.course.match(/\(([^)]+)\)/)?.[1] || userData.ment.course}
                </p>
              </div>
            </div>
          </div>
          
          <div className="availability">
            <h1>Availability</h1>
            <div className="lines">
              <h3>Days:</h3>
              <div>
                <p>{userData.ment.availability.join(", ")}</p>
              </div>
            </div>
            <div className="lines">
              <h3>Duration:</h3>
              <div>
                <p>{userData.ment.prefSessDur}</p>
              </div>
            </div>
          </div>

          <div className="course-offered">
            <h1>Course Offered</h1>
            <div className="course-grid">
              {displayedCourses.map((card, index) => (
                <div key={index} className="course-card">
                  <div className="lines">
                    <div>
                      <p title={card}>{card}</p>
                    </div>
                  </div>
                </div>
              ))}
              {remainingCoursesCount > 0 && (
                <div 
                  className="course-card remaining-courses" 
                  onClick={toggleShowAllCourses}
                >
                  <div className="lines">
                    <div>
                      <p>+{remainingCoursesCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showAllCourses && (
              <div className="all-courses-popup">
                <div className="popup-content">
                  <h3>All Courses Offered</h3>
                  <div className="popup-courses">
                    {userData.ment.subjects.map((course, index) => (
                      <div key={index} className="popup-course">
                        {course}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="close-popup"
                    onClick={toggleShowAllCourses}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions Dropdown */}
          <div className="account-actions">
            <div className="account-dropdown">
              <button className="account-dropbtn">
                <img src="/person.svg" alt="Account" className="account-icon" />
                Account
              </button>
              <div className="account-dropdown-content">
                <a onClick={openEditInformation}>
                  <img src="/edit.svg" alt="Edit" /> Edit Information
                </a>
                <a onClick={registerLearnerRole}>
                  <img src="/register.svg" alt="Register" /> Register as Learner
                </a>
                <a onClick={switchRole}>
                  <img src="/switch.svg" alt="Switch" /> Switch Account Role
                </a>
                <a onClick={() => switchComponent('logout')}>
                  <img src="/logout.svg" alt="Logout" /> Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPDATED Topbar with keyboard navigation */}
      <div 
        ref={topbarRef}
        className={`topbar ${
          isMobileView && !isSidebarVisible ? 'topbar-expanded' : ''
        } ${isTopbarFocused ? 'topbar-focused' : ''}`}
        tabIndex={0}
        onKeyDown={handleTopbarKeyDown}
        onFocus={focusTopbar}
        onBlur={() => setIsTopbarFocused(false)}
        onClick={focusTopbar}
      >
        <div className="topbar-left">
          {topbarItems.map((item, index) => (
            <div 
              key={item.key}
              onClick={() => switchComponent(item.key)}
              className={`topbar-option ${
                activeComponent === item.key ? 'active' : ''
              } ${index === focusedTopbarIndex && isTopbarFocused ? 'focused' : ''}`}
            >
              <img src={item.icon} alt={item.label} className="nav-icon" />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="topbar-date">
          <i className="fas fa-calendar-alt date-icon"></i>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`main-content ${
          isMobileView && !isSidebarVisible ? 'content-expanded' : ''
        }`}
        style={{ position: 'relative' }}
      >
        {renderComponent()}
      </div>

      {showOffer && (
        <div className="offer-popup">
          <div className="popup-container">
            <h3>Make Offer to Student</h3>
            <div className="form-group">
              <label>Subject:</label>
              <select>
                {userData.ment.subjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input type="date" />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input type="time" />
            </div>
            <div className="form-actions">
              <button onClick={() => setShowOffer(false)}>Cancel</button>
              <button onClick={handleOfferConfirm}>Send Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}