'use client';

import { useState, useEffect, useRef } from 'react'; // Added useRef
import { useRouter } from 'next/navigation';
import MainComponent from '@/components/learnerpage/main/page';
import SessionComponent from '@/components/learnerpage/session/page';
import ReviewsComponent from '@/components/learnerpage/reviews/page';
import EditInformation from '@/components/learnerpage/information/page';
import LogoutComponent from '@/components/learnerpage/logout/page';
import api from "@/lib/axios";
import './learner.css';

// Helper to get cookie value (works only for non-httpOnly cookies)
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
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
}

// Update the Schedule interface to match the API response
interface Schedule {
  id: string;
  date: string;
  time: string;
  subject: string;
  location: string;
  mentor: {
    name: string;
    program: string;
    yearLevel: string;
    image: string;
  };
  learner: {
    name: string;
    program: string;
    yearLevel: string;
  };
  feedback?: {
    rating: number;
    feedback: string;
  };
  has_feedback?: boolean;
}

interface MentorFile {
  id: number;
  name: string;
  url: string;
  type: string;
  owner_id: number;
  file_id: string;
  file_name: string;
}

interface Mentor {
  id: number;
  userName: string;
  yearLevel: string;
  course: string;
  image_id: string;
  proficiency: string;
  subjects: string[];
  availability: string[];
  rating_ave: number;
  bio: string;
  exp: string;
  prefSessDur: string;
  teach_sty: string[];
  credentials: string[];
  image_url: string;
}

// Update the Mentor interface to match the API response
interface MentorFromAPI {
  id: string;
  name: string;
  program: string;
  yearLevel: string;
  image: string;
  aveRating: number;
  proficiency: string
}

// Helper function to transform schedules for review component
const transformSchedulesForReview = (schedules: any[]): any[] => {
  return schedules.map(schedule => ({
    id: schedule.id,
    date: `${schedule.date} ${schedule.time}`,
    subject: schedule.subject,
    location: schedule.location,
    mentor: {
      user: {
        name: schedule.mentor?.name || "Unknown Mentor"
      },
      year: schedule.mentor?.yearLevel || "Professor",
      course: schedule.mentor?.program || `${schedule.subject?.substring(0, 3).toUpperCase()})`,
      image: schedule.mentor?.image || "https://placehold.co/600x400"
    },
    learner: {
      name: schedule.learner?.name || "Unknown Learner",
      program: schedule.learner?.program || "N/A",
      yearLevel: schedule.learner?.yearLevel || "N/A"
    },
    feedback: schedule.feedback || {
      rating: 0,
      feedback: ""
    },
    has_feedback: schedule.has_feedback || false
  }));
};

// Transform function to convert API data to component format
const transformMentorData = (apiMentors: MentorFromAPI[]): User[] => {
  return apiMentors.map(mentor => ({
    id: mentor.id, // Convert string ID to number
    userName: mentor.name,
    yearLevel: mentor.yearLevel,
    course: mentor.program,
    image_url: mentor.image,
    proficiency: mentor.proficiency,
    rating_ave: mentor.aveRating
  }));
};

export default function LearnerPage() {
  const router = useRouter();
  
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
  
  const [schedForReview, setSchedForReview] = useState<Schedule[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<Schedule[]>([]);
  const [mentorFiles, setMentorFiles] = useState<MentorFile[]>([]);
  const [users, setUsers] = useState<Mentor[]>([]);
  const [profile, setProfile] = useState<UserData[]>([]);
  const [mentors, setMentors] = useState<MentorFromAPI[]>([]);
  const [transformedMentors, setTransformedMentors] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  
  const [isEdit, setIsEdit] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeComponent, setActiveComponent] = useState("main");
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // NEW: Keyboard navigation state for topbar
  const [focusedTopbarIndex, setFocusedTopbarIndex] = useState(0);
  const [isTopbarFocused, setIsTopbarFocused] = useState(false);
  const topbarRef = useRef<HTMLDivElement>(null);

  // Define topbar items in order
  const topbarItems = [
    { key: 'main', label: 'Mentors', icon: '/main.svg' },
    { key: 'session', label: 'Schedules', icon: '/calendar.svg' },
    { key: 'records', label: 'Reviews', icon: '/records.svg' }
  ];

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

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

  const sessionInfo = async () => {
    try {
      console.log("Fetching session info...");
      const token = getCookie('MindMateToken');
      const res = await api.get('/api/learner/schedules', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setTodaySchedule(res.data); // Or setSchedules(res.data) if you want all schedules in one state

      // If you want to separate today's and upcoming schedules, you can filter here
      // Example:
      // const today = new Date().toISOString().split('T')[0];
      // setTodaySchedule(res.data.filter(s => s.date === today));
      // setUpcomingSchedule(res.data.filter(s => s.date > today));

    } catch (error) {
      console.error('Error fetching session info:', error);
    }
  };

  const sessionForReview = async () => {
    try {
      console.log("Fetching sessions for review...");
      const mockSchedForReview: Schedule[] = [
        {
          id: 5,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: "9:00 AM",
          mentor_name: "Dr. Davis",
          subject: "Physics",
          location: "Room 301",
          mentor: {
            user: {
              name: "Dr. Davis"
            },
            year: "Professor",
            course: "Physics (PHY)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 5
          },
          feedback: {
            rating: 0,
            feedback: ""
          },
          has_feedback: false,
          files: []
        },
        {
          id: 6,
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          time: "1:00 PM",
          mentor_name: "Prof. Miller",
          subject: "Calculus",
          location: "Online",
          mentor: {
            user: {
              name: "Prof. Miller"
            },
            year: "Associate Professor",
            course: "Mathematics (MATH)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 6
          },
          feedback: {
            rating: 4,
            feedback: "Great session! Very helpful explanations and patient teaching style."
          },
          has_feedback: true,
          files: []
        },
        {
          id: 7,
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
          time: "11:00 AM",
          mentor_name: "Dr. Wilson",
          subject: "Data Structures",
          location: "Lab 101",
          mentor: {
            user: {
              name: "Dr. Wilson"
            },
            year: "Professor",
            course: "Computer Science (CS)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 7
          },
          feedback: {
            rating: 5,
            feedback: "Excellent mentor! Very knowledgeable and provided great examples."
          },
          has_feedback: true,
          files: []
        }
      ];
      
      setSchedForReview(mockSchedForReview);
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
    }
  };

  const mentorProfile = async () => {
    try {
      console.log("Fetching mentor profiles...");
      setUsers([
        {
          id: 1,
          userName: "Dr. Smith",
          yearLevel: "Professor",
          course: "Computer Science",
          image_id: "",
          proficiency: "Expert",
          subjects: ["Programming", "Algorithms"],
          availability: ["Mon", "Wed"],
          rating_ave: 4.5,
          bio: "Experienced professor with 10+ years in computer science education",
          exp: "10 years",
          prefSessDur: "1 hour",
          teach_sty: ["Interactive", "Project-based"],
          credentials: ["PhD in Computer Science"],
          image_url: "https://placehold.co/600x400"
        },
        {
          id: 2,
          userName: "Prof. Johnson",
          yearLevel: "Associate Professor",
          course: "Software Engineering",
          image_id: "",
          proficiency: "Advanced",
          subjects: ["Web Development", "Database"],
          availability: ["Tue", "Thu"],
          rating_ave: 4.2,
          bio: "Industry expert with 8 years of software development experience",
          exp: "8 years",
          prefSessDur: "1.5 hours",
          teach_sty: ["Practical", "Hands-on"],
          credentials: ["MSc in Software Engineering"],
          image_url: "https://placehold.co/600x400"
        },
        {
          id: 3,
          userName: "Dr. Wilson",
          yearLevel: "Professor",
          course: "Computer Science",
          image_id: "",
          proficiency: "Expert",
          subjects: ["Data Structures", "Algorithms"],
          availability: ["Mon", "Fri"],
          rating_ave: 4.8,
          bio: "Specialized in data structures and algorithm optimization",
          exp: "12 years",
          prefSessDur: "1 hour",
          teach_sty: ["Visual", "Step-by-step"],
          credentials: ["PhD in Computer Science"],
          image_url: "https://placehold.co/600x400"
        }
      ]);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchMentFiles = async () => {
    try {
      console.log("Fetching mentor files...");
      const mockMentorFiles: MentorFile[] = [
        {
          id: 1,
          name: "Programming Guide.pdf",
          url: "/files/programming-guide.pdf",
          type: "PDF",
          owner_id: 1,
          file_id: "file1",
          file_name: "Programming Guide.pdf"
        },
        {
          id: 2,
          name: "Algorithms Notes.docx",
          url: "/files/algorithms-notes.docx",
          type: "DOCX",
          owner_id: 2,
          file_id: "file2",
          file_name: "Algorithms Notes.docx"
        },
        {
          id: 3,
          name: "Data Structures Tutorial.pdf",
          url: "/files/ds-tutorial.pdf",
          type: "PDF",
          owner_id: 3,
          file_id: "file3",
          file_name: "Data Structures Tutorial.pdf"
        },
        {
          id: 4,
          name: "Mathematics Problem Sets.pdf",
          url: "/files/math-problems.pdf",
          type: "PDF",
          owner_id: 4,
          file_id: "file4",
          file_name: "Mathematics Problem Sets.pdf"
        }
      ];
      
      setMentorFiles(mockMentorFiles);
    } catch (error) {
      console.error('Error fetching mentor files:', error);
    }
  };

  const registerMentorRole = async () => {
    router.push('/mentor-info/alt');
  };

  const switchRole = async () => {
    try {
      console.log("Switching role...");
      router.push('/mentor');
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out...");
      localStorage.removeItem('auth_token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to handle updating user data from the edit form
  const handleUpdateUserData = (updatedData: Partial<UserData>) => {
    setUserData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const filteredUsers = transformedMentors.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      searchQuery === "" ||
      user.userName.toLowerCase().includes(searchLower) ||
      user.yearLevel.toLowerCase().includes(searchLower) ||
      user.course.toLowerCase().includes(searchLower)
    );
  });

  const handleLogout = () => {
    setConfirmLogout(false);
    logout();
  };

  const handleCancelLogout = () => {
    setConfirmLogout(false);
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
      }
    }
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      console.log("Starting fetchUserData...");
      const token = getCookie('MindMateToken');
      console.log("Token:", token ? "Found" : "Not found");
      
      const res = await api.get('/api/learner/profile', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      setUserData(res.data.userData);
      console.log(res.data);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      console.log("Keeping mock data due to API error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all mentors
  const fetchMentors = async () => {
    setIsLoadingMentors(true);
    try {
      console.log("Fetching mentors from API...");
      const token = getCookie('MindMateToken');
      const res = await api.get('/api/learner/mentors', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log("Mentors API Response:", res.data);
      
      // Set the raw API data
      setMentors(res.data);
      
      // Transform and set the data for the component
      const transformed = transformMentorData(res.data);
      setTransformedMentors(transformed);
      
      console.log("Transformed mentors:", transformed);
      
    } catch (error) {
      console.error('Error fetching mentors:', error);
      
      // Fallback to mock data if API fails
      const mockMentors: MentorFromAPI[] = [
        {
          id: "1",
          name: "Dr. Smith",
          program: "BSCS",
          yearLevel: "Professor",
          image: "https://placehold.co/600x400",
          aveRating: 4.5,
          proficiency: "Expert"
        },
        {
          id: "2", 
          name: "Prof. Johnson",
          program: "BSIT",
          yearLevel: "Associate Professor",
          image: "https://placehold.co/600x400",
          aveRating: 4.2,
          proficiency: "Advanced"
        },
        {
          id: "3",
          name: "Dr. Wilson", 
          program: "BSCS",
          yearLevel: "Professor",
          image: "https://placehold.co/600x400",
          aveRating: 4.8,
          proficiency: "Expert"
        }
      ];
      
      setMentors(mockMentors);
      setTransformedMentors(transformMentorData(mockMentors));
      
    } finally {
      setIsLoadingMentors(false);
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const token = getCookie('MindMateToken');
      const res = await api.get('/api/learner/schedules', {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Assign each array to its state
      setTodaySchedule(res.data.todaySchedule || []);
      setUpcomingSchedule(res.data.upcomingSchedule || []);
      setSchedForReview(res.data.schedForReview || []);
      console.log("Schedules fetched:", res.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const switchComponent = (component: string) => {
    console.log('Switching to component:', component);
    if (activeComponent !== component) {
      setActiveComponent(component);
      if (isMobileView) {
        setIsSidebarVisible(false);
      }
      // Update focused index when component changes via click
      const newIndex = topbarItems.findIndex(item => item.key === component);
      if (newIndex >= 0) {
        setFocusedTopbarIndex(newIndex);
      }
    }
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
          mentorProfile(),
          fetchMentFiles(),
          fetchMentors(),
          fetchSchedules() // Only this for schedules
        ]);
      } catch (error) {
        console.error('Error during initialization:', error);
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
    console.log("Current userData state:", userData);
  }, [userData]);

  const renderComponent = () => {
    const transformedSchedForReview = transformSchedulesForReview(schedForReview);

    const props = {
      userInformation: filteredUsers,
      userData,
      upcomingSchedule,
      schedule: todaySchedule,
      schedForReview: schedForReview,
      mentFiles: { files: mentorFiles },
      onScheduleCreated: fetchSchedules // Add this to refresh schedules after creation
    };

    switch (activeComponent) {
      case 'main':
        return <MainComponent {...props} />;
      case 'session':
        return <SessionComponent {...props} />;
      case 'records':
        // Pass both schedForReview and additional data prop
        return <ReviewsComponent 
          schedForReview={schedForReview}
          userData={userData}
          data={{
            schedForReview: schedForReview // Pass the raw schedForReview array
          }}
        />;
      default:
        return <MainComponent {...props} />;
    }
  };

  const courseAbbreviation = userData.program;

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-backdrop"></div>
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      {isMobileView && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      {isMobileView && isSidebarVisible && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

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
            <h1>Hi, Learner!</h1>
            <img
              src={userData.image || 'https://placehold.co/100x100'}
              alt="profile-pic"
              width={100}
              height={100}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h2>{userData.name}</h2>
            <i><p>{userData.yearLevel}</p></i>
            <i><p>{courseAbbreviation}</p></i>
          </div>
        </div>

        <div className="footer-element">
          <div className="bio-container">
            <h1>BIO</h1>
            <div className="lines">
              <p style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                {userData.bio}
              </p>
            </div>
          </div>

          <div className="availability">
            <h1>Availability</h1>
            <div className="lines">
              <h3>Days:</h3>
              <div>
                <p>{userData.availability?.join(', ') || 'Not specified'}</p>
              </div>
            </div>
            <div className="lines">
              <h3>Duration:</h3>
              <div>
                <p>{userData.sessionDur || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="subject-interest">
            <h1>Subject of Interest</h1>
            <div className="course-grid">
              {userData.subjects?.slice(0, 5).map((subject, index) => (
                <div key={index} className="course-card">
                  <div className="lines">
                    <div>
                      <p title={subject}>{subject}</p>
                    </div>
                  </div>
                </div>
              )) || []}
              {(userData.subjects?.length || 0) > 5 && (
                <div 
                  className="course-card remaining-courses" 
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="lines">
                    <div>
                      <p>+{(userData.subjects?.length || 0) - 5}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showAllCourses && (
              <div className="all-courses-popup">
                <div className="popup-content">
                  <h3>All Subject of Interest</h3>
                  <div className="popup-courses">
                    {userData.subjects?.map((subject, index) => (
                      <div key={index} className="popup-course">
                        {subject}
                      </div>
                    )) || []}
                  </div>
                  <button 
                    className="popup-close-btn"
                    onClick={() => setShowAllCourses(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="account-actions">
            <div className="account-dropdown">
              <button className="account-dropbtn">
                <img src="/person.svg" alt="Account" className="account-icon" />
                Account
              </button>
              <div className="account-dropdown-content">
                <a onClick={() => setIsEdit(true)} style={{ cursor: 'pointer' }}>
                  <img src="/edit.svg" alt="Edit" /> Edit Information
                </a>
                <a onClick={registerMentorRole} style={{ cursor: 'pointer' }}>
                  <img src="/register.svg" alt="Register" /> Register as Mentor
                </a>
                <a onClick={switchRole} style={{ cursor: 'pointer' }}>
                  <img src="/switch.svg" alt="Switch" /> Switch Account Role
                </a>
                <a onClick={() => setConfirmLogout(true)} style={{ cursor: 'pointer' }}>
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
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className={`main-content ${isMobileView && !isSidebarVisible ? 'content-expanded' : ''}`}>
        {renderComponent()}
      </div>

      {isEdit && (
        <div className="edit-information-popup">
          <EditInformation 
            userData={userData}
            onClose={() => setIsEdit(false)}
            onUpdateUserData={handleUpdateUserData}
          />
        </div>
      )}

      {confirmLogout && (
        <LogoutComponent onCancel={handleCancelLogout} />
      )}
    </>
  );
}