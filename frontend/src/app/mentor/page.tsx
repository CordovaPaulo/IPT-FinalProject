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
import api from "@/lib/axios";
import './mentor.css';

// Helper to get cookie value (works only for non-httpOnly cookies)
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

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
  _id: string;
  userId: string;
  name: string;
  email: string;
  address: string;
  yearLevel: string;
  program: string;
  availability: string[];
  sessionDur: string;
  bio: string;
  subjects: string[];
  image: string;
  phoneNumber: string;
  style: string[];
  goals: string;
  sex: string;
  status: string;
  modality: string;
  createdAt: string;
  __v: number;
  ment?: Mentor;
  user?: User;
  image_url?: string;
}

// Update the Schedule interface to match the API response
interface Schedule {
  id: string;
  date: string;
  time: string;
  subject: string;
  location: string;
  mentor: {
    id: string;
    name: string;
    program: string;
    yearLevel: string;
    image: string;
  };
  learner: {
    id: string;
    name: string;
    program: string;
    yearLevel: string;
    image: string;
  };
}

// Update the Learner interface to match the API response
interface LearnerFromAPI {
  _id: string;
  name: string;
  program: string;
  yearLevel: string;
  image?: string;
}

interface Feedback {
  _id: string;
  learner: string;
  mentor: string;
  schedule: string;
  rating: number;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export default function MentorPage() {
  const router = useRouter();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    _id: "",
    userId: "",
    name: "",
    email: "",
    address: "",
    yearLevel: "",
    program: "",
    availability: [],
    sessionDur: "",
    bio: "",
    subjects: [],
    image: "",
    phoneNumber: "",
    style: [],
    goals: "",
    sex: "",
    status: "",
    modality: "",
    createdAt: "",
    __v: 0
  });
  
  const [users, setUsers] = useState<LearnerFromAPI[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<Schedule[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
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
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      console.log("Starting fetchUserData...");
      const token = getCookie('MindMateToken');
      console.log("Token:", token ? "Found" : "Not found");
      
      const res = await api.get('/api/mentor/profile', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      setUserData(res.data.userData);
      console.log("Mentor profile data:", res.data);
      
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      
      // Fallback to mock data if API fails
      const mockUserData: UserData = {
        _id: "mock_id",
        userId: "mock_user_id",
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        yearLevel: "3rd Year",
        program: "Computer Science (CS)",
        availability: ["Monday", "Wednesday", "Friday"],
        sessionDur: "1 hour",
        bio: "Experienced mentor with 3 years of teaching experience in computer science subjects.",
        subjects: ["Mathematics", "Physics", "Programming", "Algorithms", "Data Structures", "Web Development", "Database Management"],
        image: "https://placehold.co/600x400",
        phoneNumber: "123-456-7890",
        style: ["Interactive", "Practical"],
        goals: "Help students excel",
        sex: "Male",
        status: "Active",
        modality: "Online",
        createdAt: new Date().toISOString(),
        __v: 0
      };
      setUserData(mockUserData);
      
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLearners = async () => {
    setIsLoadingLearners(true);
    try {
      console.log("Fetching learners from API...");
      const token = getCookie('MindMateToken');
      const res = await api.get('/api/mentor/learners', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log("Learners API Response:", res.data);
      setUsers(res.data);
      
    } catch (error) {
      console.error('Error fetching learners:', error);
      
      // Fallback to mock data if API fails
      const mockLearners: LearnerFromAPI[] = [
        {
          _id: "1",
          name: "Alice Johnson",
          program: "BSCS",
          yearLevel: "2nd Year",
          image: "https://placehold.co/600x400"
        },
        {
          _id: "2",
          name: "Bob Smith",
          program: "BSIT",
          yearLevel: "1st Year",
          image: "https://placehold.co/600x400"
        },
        {
          _id: "3",
          name: "Carol Davis",
          program: "BSSE",
          yearLevel: "3rd Year",
          image: "https://placehold.co/600x400"
        }
      ];
      setUsers(mockLearners);
      
    } finally {
      setIsLoadingLearners(false);
    }
  };

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      console.log("Fetching schedules from API...");
      const token = getCookie('MindMateToken');
      const res = await api.get('/api/mentor/schedules', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Assign each array to its state
      setTodaySchedule(res.data.todaySchedule || []);
      setUpcomingSchedule(res.data.upcomingSchedule || []);
      console.log("Schedules fetched:", res.data);
      
    } catch (error) {
      console.error('Error fetching schedules:', error);
      
      // Fallback to mock data if API fails
      const mockTodaySchedule: Schedule[] = [
        { 
          id: "1", 
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM", 
          subject: "Mathematics",
          location: "Room 101",
          mentor: {
            id: "mentor1",
            name: "John Doe",
            program: "BSCS",
            yearLevel: "Professor",
            image: "https://placehold.co/600x400"
          },
          learner: { 
            id: "learner1",
            name: "Alice Johnson",
            program: "BSCS",
            yearLevel: "2nd Year",
            image: "https://placehold.co/600x400"
          }
        }
      ];
      
      const mockUpcomingSchedule: Schedule[] = [
        { 
          id: "2", 
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: "11:00 AM", 
          subject: "Algorithms",
          location: "Library",
          mentor: {
            id: "mentor1",
            name: "John Doe",
            program: "BSCS",
            yearLevel: "Professor",
            image: "https://placehold.co/600x400"
          },
          learner: { 
            id: "learner2",
            name: "Carol Davis",
            program: "BSSE",
            yearLevel: "3rd Year",
            image: "https://placehold.co/600x400"
          }
        }
      ];
      
      setTodaySchedule(mockTodaySchedule);
      setUpcomingSchedule(mockUpcomingSchedule);
      
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const fetchFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      console.log("Fetching feedbacks from API...");
      const token = getCookie('MindMateToken');
      const res = await api.get('/api/mentor/feedbacks', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log("Feedbacks API Response:", res.data);
      setFeedbacks(res.data);
      
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      
      // If no feedbacks found (404), that's okay - set empty array
      if (error.response?.status === 404) {
        setFeedbacks([]);
      } else {
        // Fallback to mock data for other errors
        const mockFeedbacks: Feedback[] = [
          { 
            _id: "1",
            learner: "learner1",
            mentor: "mentor1",
            schedule: "schedule1",
            rating: 5, 
            comments: "Excellent mentor! Very patient and knowledgeable.", 
            createdAt: "2024-01-15T00:00:00.000Z",
            updatedAt: "2024-01-15T00:00:00.000Z"
          },
          { 
            _id: "2",
            learner: "learner2", 
            mentor: "mentor1",
            schedule: "schedule2",
            rating: 4, 
            comments: "Very helpful sessions, great explanations.", 
            createdAt: "2024-01-12T00:00:00.000Z",
            updatedAt: "2024-01-12T00:00:00.000Z"
          }
        ];
        setFeedbacks(mockFeedbacks);
      }
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const getFiles = async () => {
    try {
      console.log("Fetching files...");
      // Mock files for now - you can implement file API later
      const mockFiles = [
        { id: 1, name: "Mathematics_Notes.pdf", size: "2.4 MB", date: "2024-01-10" },
        { id: 2, name: "Programming_Exercises.zip", size: "5.1 MB", date: "2024-01-08" },
      ];
      setFiles(mockFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const registerLearnerRole = async () => {
    router.push('/learner-info/alt');
  };

  const switchRole = async () => {
    try {
      console.log("Switching role...");
      router.push('/learner');
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out...");
      localStorage.removeItem('auth_token');
      // Clear the cookie
      document.cookie = 'MindMateToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Component functions
  const switchComponent = (component: string) => {
    console.log('Switching to component:', component);
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

  // Function to handle updating user data from the edit form
  const handleUpdateUserData = (updatedData: Partial<UserData>) => {
    setUserData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleOfferConfirm = () => {
    setShowOffer(false);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const checkMobileView = () => {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    }
  };

  // Filtered users for search
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchLower) ||
      user.yearLevel.toLowerCase().includes(searchLower) ||
      user.program.toLowerCase().includes(searchLower)
    );
  });

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
    const props = {
      users: filteredUsers,
      userData,
      todaySchedule,
      upcomingSchedule,
      feedbacks,
      files,
      searchQuery,
      setSearchQuery,
      setUserId,
      mentorData: userData,
      setFiles,
      onScheduleCreated: fetchSchedules // Add this to refresh schedules after creation
    };

    const mainContent = (() => {
      switch (activeComponent) {
        case 'main':
          return (
            <MainComponent 
              users={filteredUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUserId={setUserId}
              mentorData={userData}
              userData={userData}
            />
          );
        case 'session':
          return <SessionComponent 
            schedule={todaySchedule} 
            upcomingSchedule={upcomingSchedule}
            userData={userData}
            onScheduleCreated={fetchSchedules}
          />;
        case 'reviews':
          return <ReviewsComponent 
            feedbacks={feedbacks}
            userData={userData}
          />;
        case 'files':
          return <FilesComponent 
            files={files} 
            setFiles={setFiles}
            userData={userData}
          />;
        case 'fileManage':
          return <FileManagerComponent 
            files={files} 
            setFiles={setFiles}
            userData={userData}
          />;
        case 'logout': 
          return (
            <MainComponent 
              users={filteredUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUserId={setUserId}
              mentorData={userData}
              userData={userData}
            />
          );
        default:
          return (
            <MainComponent 
              users={filteredUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUserId={setUserId}
              mentorData={userData}
              userData={userData}
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
            onLogout={logout}
          />
        )}
      </>
    );
  };

  useEffect(() => {
    const initializeData = async () => {
      startLoading();
      
      checkMobileView();
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', checkMobileView);
      }

      try {
        await fetchUserData();
        await Promise.allSettled([
          fetchLearners(),
          fetchSchedules(),
          fetchFeedbacks(),
          getFiles(),
        ]);
      } catch (error) {
        console.error("Critical error during initialization:", error);
      } finally {
        stopLoading();
      }
    };

    initializeData();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobileView);
      }
    };
  }, []);

  // Add debugging useEffect
  useEffect(() => {
    console.log("Current mentor userData state:", userData);
  }, [userData]);

  const courseAbbreviation = userData.program?.match(/\(([^)]+)\)/)?.[1] || userData.program;

  return (
    <div className="mentor-page">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-backdrop"></div>
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      {/* Edit Information Popup Overlay */}
      {showEditInformation && (
        <EditInformationComponent 
          userData={userData}
          onSave={handleSaveInformation}
          onCancel={handleCancelEdit}
          onUpdateUserData={handleUpdateUserData}
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
          ☰
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
              src={userData.image || 'https://placehold.co/600x400'}
              alt="profile-pic"
              width={100}
              height={100}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400';
              }}
            />
          </div>
          <div>
            <h2>{userData.name}</h2>
            <i><p>{userData.yearLevel}</p></i>
            <StarRating rating={4.5} />
          </div>
        </div>

        <div className="footer-element">
          <div className="user-information">
            <h1>User Information</h1>
            <div className="lines">
              <h3>Year Level:</h3>
              <div>
                <p>{userData.yearLevel}</p>
              </div>
            </div>

            <div className="lines">
              <h3>Program:</h3>
              <div>
                <p>{courseAbbreviation}</p>
              </div>
            </div>
          </div>
          
          <div className="availability">
            <h1>Availability</h1>
            <div className="lines">
              <h3>Days:</h3>
              <div>
                <p>{userData.availability?.join(", ") || 'Not specified'}</p>
              </div>
            </div>
            <div className="lines">
              <h3>Duration:</h3>
              <div>
                <p>{userData.sessionDur || 'Not specified'}</p>
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
                  style={{ cursor: 'pointer' }}
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
                    {userData.subjects?.map((course, index) => (
                      <div key={index} className="popup-course">
                        {course}
                      </div>
                    )) || []}
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
                <a onClick={openEditInformation} style={{ cursor: 'pointer' }}>
                  <img src="/edit.svg" alt="Edit" /> Edit Information
                </a>
                <a onClick={registerLearnerRole} style={{ cursor: 'pointer' }}>
                  <img src="/register.svg" alt="Register" /> Register as Learner
                </a>
                <a onClick={switchRole} style={{ cursor: 'pointer' }}>
                  <img src="/switch.svg" alt="Switch" /> Switch Account Role
                </a>
                <a onClick={() => switchComponent('logout')} style={{ cursor: 'pointer' }}>
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
                {userData.subjects?.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                )) || []}
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