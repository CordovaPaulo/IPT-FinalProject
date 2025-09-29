'use client';

import { useState, useEffect } from 'react';
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

  // Computed properties
  const displayedCourses = userData.ment.subjects.slice(0, 5);
  const remainingCoursesCount = Math.max(userData.ment.subjects.length - 5, 0);

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
          <span className="logo-text">GCCoEd</span>
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

      {/* Topbar */}
      <div 
        className={`topbar ${
          isMobileView && !isSidebarVisible ? 'topbar-expanded' : ''
        }`}
      >
        <div className="topbar-left">
          <div 
            onClick={() => switchComponent('main')}
            className={`topbar-option ${
              activeComponent === 'main' ? 'active' : ''
            }`}
          >
            <img src="/main.svg" alt="Main" className="nav-icon" />
            <span className="nav-text">Learners</span>
          </div>
          <div 
            onClick={() => switchComponent('session')}
            className={`topbar-option ${
              activeComponent === 'session' ? 'active' : ''
            }`}
          >
            <img src="/calendar.svg" alt="Session" className="nav-icon" />
            <span className="nav-text">Schedules</span>
          </div>
          <div 
            onClick={() => switchComponent('reviews')}
            className={`topbar-option ${
              activeComponent === 'reviews' ? 'active' : ''
            }`}
          >
            <img src="/records.svg" alt="Reviews" className="nav-icon" />
            <span className="nav-text">Reviews</span>
          </div>
          <div 
            onClick={() => switchComponent('files')}
            className={`topbar-option ${
              activeComponent === 'files' ? 'active' : ''
            }`}
          >
            <img src="/uploadCloud.svg" alt="Upload" className="nav-icon" />
            <span className="nav-text">Files</span>
          </div>
          <div 
            onClick={() => switchComponent('fileManage')}
            className={`topbar-option ${
              activeComponent === 'fileManage' ? 'active' : ''
            }`}
          >
            <img src="/files.svg" alt="Files" className="nav-icon" />
            <span className="nav-text">File Manager</span>
          </div>
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