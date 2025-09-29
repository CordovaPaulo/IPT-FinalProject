'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainComponent from '@/components/learnerpage/main/page';
import SessionComponent from '@/components/learnerpage/session/page';
import ReviewsComponent from '@/components/learnerpage/reviews/page';
import EditInformation from '@/components/learnerpage/information/page';
import LogoutComponent from '@/components/learnerpage/logout/page';
import './learner.css';

interface UserData {
  user: {
    id: number | null;
    name: string;
    email: string;
    role: string;
  };
  learn: {
    address: string;
    year: string;
    course: string;
    availability: string[];
    prefSessDur: string;
    bio: string;
    subjects: string[];
    image: string;
    phoneNum: string;
    learn_sty: string[];
    goals: string;
    rating_ave: number;
  };
  image_url: string | null;
}

interface Schedule {
  id: number;
  date: string;
  time: string;
  mentor_name: string;
  subject: string;
  location: string;
  mentor: {
    user: {
      name: string;
    };
    year?: string;
    course?: string;
    image?: string;
    ment_inf_id: number;
  };
  feedback?: {
    rating: number;
    feedback: string;
  };
  has_feedback?: boolean;
  files?: any[];
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

// Helper function to transform schedules for review component
const transformSchedulesForReview = (schedules: Schedule[]): any[] => {
  return schedules.map(schedule => ({
    id: schedule.id,
    date: `${schedule.date} ${schedule.time}`,
    subject: schedule.subject,
    mentor: {
      user: {
        name: schedule.mentor.user.name
      },
      year: schedule.mentor.year || "Professor",
      course: schedule.mentor.course || `${schedule.subject} (${schedule.subject.substring(0, 3).toUpperCase()})`,
      image: schedule.mentor.image || "https://placehold.co/600x400"
    },
    feedback: schedule.feedback || {
      rating: 0,
      feedback: ""
    },
    has_feedback: schedule.has_feedback || false
  }));
};

export default function LearnerPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    user: {
      id: null,
      name: "John Doe",
      email: "john@example.com",
      role: "learner"
    },
    learn: {
      address: "Sample Address",
      year: "2nd Year",
      course: "Computer Science (CS)",
      availability: ["Monday", "Wednesday", "Friday"],
      prefSessDur: "1 hour",
      bio: "This is a sample bio for the learner.",
      subjects: ["Mathematics", "Physics", "Programming", "Algorithms", "Data Structures", "Calculus"],
      image: "",
      phoneNum: "",
      learn_sty: [],
      goals: "",
      rating_ave: 0
    },
    image_url: null
  });
  
  const [schedForReview, setSchedForReview] = useState<Schedule[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<Schedule[]>([]);
  const [mentorFiles, setMentorFiles] = useState<MentorFile[]>([]);
  const [users, setUsers] = useState<Mentor[]>([]);
  
  const [isEdit, setIsEdit] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeComponent, setActiveComponent] = useState("main");
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const getLearnerDets = async () => {
    try {
      console.log("Fetching learner details...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          name: "Jane Smith"
        }
      }));
    } catch (error) {
      console.error('Error fetching learner details:', error);
    }
  };

  const sessionInfo = async () => {
    try {
      console.log("Fetching session info...");
      const mockTodaySchedule: Schedule[] = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM",
          mentor_name: "Dr. Smith",
          subject: "Programming",
          location: "Room 101",
          mentor: {
            user: {
              name: "Dr. Smith"
            },
            year: "Professor",
            course: "Computer Science (CS)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 1
          },
          files: []
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          time: "2:00 PM",
          mentor_name: "Prof. Johnson",
          subject: "Algorithms",
          location: "Online",
          mentor: {
            user: {
              name: "Prof. Johnson"
            },
            year: "Associate Professor",
            course: "Software Engineering (SE)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 2
          },
          files: []
        }
      ];
      
      const mockUpcomingSchedule: Schedule[] = [
        {
          id: 3,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: "11:00 AM",
          mentor_name: "Dr. Wilson",
          subject: "Data Structures",
          location: "Library",
          mentor: {
            user: {
              name: "Dr. Wilson"
            },
            year: "Professor",
            course: "Computer Science (CS)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 3
          },
          files: []
        },
        {
          id: 4,
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          time: "3:00 PM",
          mentor_name: "Prof. Brown",
          subject: "Mathematics",
          location: "Room 202",
          mentor: {
            user: {
              name: "Prof. Brown"
            },
            year: "Professor",
            course: "Mathematics (MATH)",
            image: "https://placehold.co/600x400",
            ment_inf_id: 4
          },
          files: []
        }
      ];
      
      setTodaySchedule(mockTodaySchedule);
      setUpcomingSchedule(mockUpcomingSchedule);
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

  const filteredUsers = users.filter((user) => {
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

  useEffect(() => {
    const initializeData = async () => {
      startLoading();
      checkMobileView();
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', checkMobileView);
      }

      try {
        await Promise.allSettled([
          getLearnerDets(),
          sessionInfo(),
          mentorProfile(),
          sessionForReview(),
          fetchMentFiles()
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

  const switchComponent = (component: string) => {
    console.log('Switching to component:', component);
    if (activeComponent !== component) {
      setActiveComponent(component);
      if (isMobileView) {
        setIsSidebarVisible(false);
      }
    }
  };

  const renderComponent = () => {
    console.log('Active component:', activeComponent);
    
    // Transform schedules for review component
    const transformedSchedForReview = transformSchedulesForReview(schedForReview);

    const props = {
      userInformation: filteredUsers,
      userData,
      upcomingSchedule,
      schedule: todaySchedule,
      schedForReview: transformedSchedForReview,
      mentFiles: { files: mentorFiles }
    };

    switch (activeComponent) {
      case 'main':
        return <MainComponent {...props} />;
      case 'session':
        return <SessionComponent {...props} />;
      case 'records':
        return <ReviewsComponent schedForReview={transformedSchedForReview} />;
      default:
        return <MainComponent {...props} />;
    }
  };

  const courseMatch = userData.learn.course.match(/\(([^)]+)\)/);
  const courseAbbreviation = courseMatch ? courseMatch[1] : userData.learn.course;

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
              src={userData.image_url || 'https://placehold.co/100x100'}
              alt="profile-pic"
              width={100}
              height={100}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h2>{userData.user.name}</h2>
            <i><p>{userData.learn.year}</p></i>
            <i><p>{courseAbbreviation}</p></i>
          </div>
        </div>

        <div className="footer-element">
          <div className="bio-container">
            <h1>BIO</h1>
            <div className="lines">
              <p style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                {userData.learn.bio}
              </p>
            </div>
          </div>

          <div className="availability">
            <h1>Availability</h1>
            <div className="lines">
              <h3>Days:</h3>
              <div>
                <p>{userData.learn.availability.join(', ')}</p>
              </div>
            </div>
            <div className="lines">
              <h3>Duration:</h3>
              <div>
                <p>{userData.learn.prefSessDur}</p>
              </div>
            </div>
          </div>

          <div className="subject-interest">
            <h1>Subject of Interest</h1>
            <div className="course-grid">
              {userData.learn.subjects.slice(0, 5).map((subject, index) => (
                <div key={index} className="course-card">
                  <div className="lines">
                    <div>
                      <p title={subject}>{subject}</p>
                    </div>
                  </div>
                </div>
              ))}
              {userData.learn.subjects.length > 5 && (
                <div 
                  className="course-card remaining-courses" 
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="lines">
                    <div>
                      <p>+{userData.learn.subjects.length - 5}</p>
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
                    {userData.learn.subjects.map((subject, index) => (
                      <div key={index} className="popup-course">
                        {subject}
                      </div>
                    ))}
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

      <div className={`topbar ${isMobileView && !isSidebarVisible ? 'topbar-expanded' : ''}`}>
        <div className="topbar-left">
          <div
            onClick={() => switchComponent('main')}
            className={`topbar-option ${activeComponent === 'main' ? 'active' : ''}`}
          >
            <img src="/main.svg" alt="Main" className="nav-icon" />
            <span className="nav-text">Mentors</span>
          </div>
          <div
            onClick={() => switchComponent('session')}
            className={`topbar-option ${activeComponent === 'session' ? 'active' : ''}`}
          >
            <img src="/calendar.svg" alt="Session" className="nav-icon" />
            <span className="nav-text">Schedules</span>
          </div>
          <div
            onClick={() => switchComponent('records')}
            className={`topbar-option ${activeComponent === 'records' ? 'active' : ''}`}
          >
            <img src="/records.svg" alt="Records" className="nav-icon" />
            <span className="nav-text">Reviews</span>
          </div>
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