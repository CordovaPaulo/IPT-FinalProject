"use client";

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import "./module.css";

interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  course?: string;
  program?: string;
  role: string;
  secondary_role?: string;
  year?: string;
  phoneNum?: string;
  department?: string;
  address?: string;
  learn_modality?: string;
  availability?: string;
  proficiency?: string;
  teach_sty?: string;
  prefSessDur?: string;
  subjects?: string;
  bio?: string;
  exp?: string;
  learn_sty?: string;
  goals?: string;
  image_url?: string;
}

interface UsersProps {
  users: User[];
  onUpdateUsers: () => void;
}

const Users: React.FC<UsersProps> = ({ users, onUpdateUsers }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>({} as User);

  // Filter and search users
  const displayedUsers = useMemo(() => {
    let filteredUsers = users ? [...users] : [];

    // Apply role filters
    if (activeFilter === 'mentors') {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.role?.toLowerCase() === 'mentor' ||
          user.secondary_role?.toLowerCase() === 'mentor'
      );
    } else if (activeFilter === 'learners') {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.role?.toLowerCase() === 'learner' ||
          user.secondary_role?.toLowerCase() === 'learner'
      );
    }

    // Apply search filter
    return filteredUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.year?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, activeFilter, searchQuery]);

  const showUserDetails = (user: User) => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  const hideUserDetails = () => {
    setShowUserModal(false);
  };

  const exportUsersToCSV = () => {
    const data = displayedUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Year: user.year || 'N/A',
      Program: user.program || 'N/A',
      Role: user.role,
      Phone: user.phoneNum || 'N/A',
      Department: user.department || 'N/A',
      Gender: user.gender || 'N/A',
      Address: user.address || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 8 },
      { wch: 25 },
      { wch: 30 },
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 25 },
      { wch: 10 },
      { wch: 30 },
    ];
    worksheet['!cols'] = colWidths;

    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        fill: { fgColor: { rgb: 'D3D3D3' } },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    let reportType = 'users';
    if (activeFilter === 'mentors') reportType = 'mentors';
    if (activeFilter === 'learners') reportType = 'learners';
    const formattedDate = new Date().toISOString().slice(0, 10);

    XLSX.writeFile(workbook, `${reportType}_report_${formattedDate}.xlsx`);
  };

  const exportUserToPDF = async (user: User) => {
    const element = document.createElement('div');

    element.innerHTML = `
      <style>
        .pdf-header {
          text-align: center; 
          margin-bottom: 20px;
        }
        .logo-container {
          display: flex; 
          justify-content: center; 
          align-items: center; 
          margin-bottom: 10px;
        }
        .logo {
          height: 80px;
          margin-right: 20px;
        }
        .institution-name {
          margin: 0; 
          color: #0B3E8A; 
          font-size: 24px;
        }
        .institution-sub {
          margin: 0; 
          color: #3B9AA9; 
          font-size: 20px;
        }
        .report-title {
          color: #0B3E8A; 
          border-top: 2px solid #0B3E8A; 
          border-bottom: 2px solid #0B3E8A; 
          padding: 5px 0; 
          margin: 0 auto; 
          width: 80%;
        }
        .user-title {
          color: #3B9AA9; 
          border-bottom: 2px solid #3B9AA9; 
          padding-bottom: 5px; 
          margin-top: 20px;
        }
        .section-title {
          color: #0B3E8A; 
          margin-top: 20px;
        }
        .info-table {
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px;
        }
        .info-table td {
          padding: 8px; 
          border: 1px solid #ddd;
        }
        .info-label {
          width: 30%; 
          font-weight: bold; 
          background-color: #f5f5f5;
        }
        .pdf-footer {
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #eee; 
          padding-top: 10px;
        }
      </style>

      <div class="pdf-header">
        <div class="logo-container">
          <div>
            <h1 class="institution-name">GCCoEd</h1>
            <h2 class="institution-sub">College of Computer Studies</h2>
          </div>
        </div>
        <h3 class="report-title">User Report</h3>
      </div>
      
      <h2 class="user-title">
        ${user.name} <span style="font-size: 16px; color: #666;">(${user.role})</span>
      </h2>
      
      <h3 class="section-title">Basic Information</h3>
      <table class="info-table">
        <tr>
          <td class="info-label">Email</td>
          <td>${user.email}</td>
        </tr>
        <tr>
          <td class="info-label">Contact Number</td>
          <td>${user.phoneNum || 'Not provided'}</td>
        </tr>
        <tr>
          <td class="info-label">Year Level</td>
          <td>${user.year || 'N/A'}</td>
        </tr>
        <tr>
          <td class="info-label">Program</td>
          <td>${user.program || 'N/A'}</td>
        </tr>
        <tr>
          <td class="info-label">Department</td>
          <td>${user.department || 'College of Computer Studies'}</td>
        </tr>
        <tr>
          <td class="info-label">Sex at Birth</td>
          <td>${user.gender || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Address</td>
          <td>${user.address || 'Not provided'}</td>
        </tr>
      </table>
      
      ${
        user.role?.toLowerCase() === 'mentor'
          ? `
      <h3 class="section-title">Teaching Information</h3>
      <table class="info-table">
        <tr>
          <td class="info-label">Teaching Modality</td>
          <td>${user.learn_modality || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Days of Availability</td>
          <td>${parseArrayString(user.availability) || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Proficiency Level</td>
          <td>${user.proficiency || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Teaching Style</td>
          <td>${parseArrayString(user.teach_sty) || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Preferred Session Duration</td>
          <td>${user.prefSessDur || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Subjects</td>
          <td>${parseArrayString(user.subjects) || 'Not specified'}</td>
        </tr>
      </table>
      
      <h3 class="section-title">Bio & Experience</h3>
      <p style="margin-bottom: 10px;"><strong>Short Bio:</strong></p>
      <p style="margin-bottom: 20px;">${user.bio || 'No bio provided'}</p>
      <p style="margin-bottom: 10px;"><strong>Tutoring Experience:</strong></p>
      <p>${user.exp || 'No experience provided'}</p>
      `
          : ''
      }
      
      ${
        user.role?.toLowerCase() === 'learner'
          ? `
      <h3 class="section-title">Learning Preferences</h3>
      <table class="info-table">
        <tr>
          <td class="info-label">Learning Modality</td>
          <td>${user.learn_modality || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Days of Availability</td>
          <td>${parseArrayString(user.availability) || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Learning Style</td>
          <td>${parseArrayString(user.learn_sty) || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Preferred Session Duration</td>
          <td>${user.prefSessDur || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="info-label">Subjects of Interest</td>
          <td>${parseArrayString(user.subjects) || 'Not specified'}</td>
        </tr>
      </table>
      
      <h3 class="section-title">Bio & Goals</h3>
      <p style="margin-bottom: 10px;"><strong>Short Bio:</strong></p>
      <p style="margin-bottom: 20px;">${user.bio || 'No bio provided'}</p>
      <p style="margin-bottom: 10px;"><strong>Learning Goals:</strong></p>
      <p>${user.goals || 'No goals provided'}</p>
      `
          : ''
      }
      
      <div class="pdf-footer">
        <p>GCCoEd</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `user_${user.id}_${user.name.replace(' ', '_')}_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: true,
        useCORS: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    };

    html2pdf().from(element).set(opt).save();
  };

  // Helper functions
  const capitalizeFirstLetter = (str?: string) => {
    if (!str) return 'Not specified';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const parseArrayString = (str?: string) => {
    if (!str) return 'Not specified';
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.join(', ') : str;
    } catch (e) {
      return str;
    }
  };

  // Extract program from course string
  const getProgramFromCourse = (course?: string) => {
    if (!course) return 'N/A';
    const match = course.match(/\(([^)]+)\)/);
    return match?.[1] || course;
  };

  return (
    <>
      <div className="applications-container">
        <div className="applications-header">
          <h2 className="applications-title">
            <i className="fas fa-users header-icon"></i>
            Users
          </h2>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === 'mentors' ? 'active' : ''}`}
              onClick={() => setActiveFilter('mentors')}
            >
              Mentors
            </button>
            <button
              className={`filter-btn ${activeFilter === 'learners' ? 'active' : ''}`}
              onClick={() => setActiveFilter('learners')}
            >
              Learners
            </button>
          </div>

          <div className="search-container">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="search-input"
              />
            </div>
            <button className="export-btn" onClick={exportUsersToCSV}>
              <i className="fas fa-download"></i> Export
            </button>
          </div>
        </div>

        <div className="table-scroll-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Year</th>
                <th>Program</th>
                <th>Role</th>
                <th>Alternative Role</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="id-badge">{user.id}</span>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.year || 'N/A'}</td>
                  <td>{getProgramFromCourse(user.course)}</td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`secondary-role-badge ${
                        user.secondary_role?.toLowerCase() === 'n/a'
                          ? 'na'
                          : user.secondary_role?.toLowerCase()
                      }`}
                    >
                      {user.secondary_role || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <button className="credentials-btn" onClick={() => showUserDetails(user)}>
                      <i className="fas fa-eye"></i> <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="no-applications">
                    No users to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* User Details Modal */}
        {showUserModal && (
          <div className="modal-overlay" onClick={hideUserDetails}>
            <div className="credentials-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="header-content">
                  <i className="fas fa-user modal-title-icon"></i>
                  <h3 className="modal-title">User Details</h3>
                </div>
                <button className="close-btn" onClick={hideUserDetails}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="applicant-profile">
                  <div className="profile-image-container">
                    <img
                      src={currentUser.image_url || "https://gordoncollegeccs.edu.ph/ccs/students/lamp/assets/profile.jpg"}
                      alt={`Portrait of ${currentUser.name}`}
                      className="profile-image"
                    />
                    <div
                      className={`status-badge ${currentUser.role?.toLowerCase()}`}
                    >
                      {currentUser.role}
                    </div>
                  </div>

                  <div className="profile-info">
                    <h4 className="applicant-name">{currentUser.name}</h4>
                    <hr className="divider" />
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-envelope"></i> Email
                        </span>
                        <span className="info-value">{currentUser.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-phone"></i> Contact Number
                        </span>
                        <span className="info-value">
                          {currentUser.phoneNum || 'Not provided'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-calendar-alt"></i> Year Level
                        </span>
                        <span className="info-value">{currentUser.year || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-graduation-cap"></i> Program
                        </span>
                        <span className="info-value">{currentUser.program || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-university"></i> Department
                        </span>
                        <span className="info-value">
                          {currentUser.department || 'College of Computer Studies'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-venus-mars"></i> Sex at Birth
                        </span>
                        <span className="info-value">
                          {capitalizeFirstLetter(currentUser.gender)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-map-marker-alt"></i> Address
                        </span>
                        <span className="info-value">
                          {currentUser.address || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-Specific Details Section */}
                <div className="details-section">
                  {/* Mentor Specific Information */}
                  {currentUser.role?.toLowerCase() === 'mentor' && (
                    <>
                      <div className="details-card">
                        <h4 className="section-title">
                          <i className="fas fa-chalkboard-teacher"></i> Teaching Information
                        </h4>
                        <hr className="divider2" />
                        <div className="details-content">
                          <div className="detail-item">
                            <span className="detail-label">Teaching Modality:</span>
                            <span className="detail-value">
                              {currentUser.learn_modality || 'Not specified'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Days of Availability:</span>
                            <span className="detail-value">
                              {parseArrayString(currentUser.availability)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Proficiency Level:</span>
                            <span className="detail-value">
                              {currentUser.proficiency || 'Not specified'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Teaching Style:</span>
                            <span className="detail-value">
                              {parseArrayString(currentUser.teach_sty)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Preferred Session Duration:</span>
                            <span className="detail-value">
                              {currentUser.prefSessDur || 'Not specified'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Subjects:</span>
                            <span className="detail-value">
                              {parseArrayString(currentUser.subjects)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bio-card">
                        <h4 className="section-title">
                          <i className="fas fa-user-edit"></i> Bio & Experience
                        </h4>
                        <hr className="divider2" />
                        <div className="bio-content">
                          <div className="detail-item2">
                            <span className="detail-label">Short Bio:</span>
                            <span className="detail-value2">
                              {currentUser.bio || 'No bio provided'}
                            </span>
                          </div>
                          <div className="detail-item2">
                            <span className="detail-label">Tutoring Experience:</span>
                            <span className="detail-value2">
                              {currentUser.exp || 'No experience provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Learner Specific Information */}
                  {currentUser.role?.toLowerCase() === 'learner' && (
                    <>
                      <div className="details-card">
                        <h4 className="section-title">
                          <i className="fas fa-book-open"></i> Learning Preferences
                        </h4>
                        <hr className="divider2" />
                        <div className="details-content">
                          <div className="detail-item">
                            <span className="detail-label">Learning Modality:</span>
                            <span className="detail-value">
                              {currentUser.learn_modality || 'Not specified'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Days of Availability:</span>
                            <span className="detail-value">
                              {parseArrayString(currentUser.availability)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Learning Style:</span>
                            <span className="detail-value">
                              {parseArrayString(currentUser.learn_sty)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Preferred Session Duration:</span>
                            <span className="detail-value">
                              {currentUser.prefSessDur || 'Not specified'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Subject of Interest:</span>
                            <span className="detail-value">
                              {parseArrayString(currentUser.subjects)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bio-card">
                        <h4 className="section-title">
                          <i className="fas fa-user-edit"></i> Bio & Goals
                        </h4>
                        <hr className="divider2" />
                        <div className="bio-content">
                          <div className="detail-item2">
                            <span className="detail-label">Short Bio:</span>
                            <span className="detail-value2">
                              {currentUser.bio || 'No bio provided'}
                            </span>
                          </div>
                          <div className="detail-item2">
                            <span className="detail-label">Learning Goals:</span>
                            <span className="detail-value2">
                              {currentUser.goals || 'No goals provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <div className="footer-actions">
                  <button className="footer-btn back" onClick={hideUserDetails}>
                    <i className="fas fa-arrow-left"></i> Back to Users
                  </button>
                  <button
                    className="footer-btn export"
                    onClick={() => exportUserToPDF(currentUser)}
                  >
                    <i className="fas fa-file-pdf"></i> Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@gordon.edu.ph",
    gender: "Male",
    course: "BS Information Technology (BSIT)",
    program: "BSIT",
    role: "Mentor",
    secondary_role: "N/A",
    year: "3rd Year",
    phoneNum: "09123456789",
    department: "College of Computer Studies",
    address: "Olongapo City",
    learn_modality: "Hybrid",
    availability: JSON.stringify(["Monday", "Wednesday", "Friday"]),
    proficiency: "Advanced",
    teach_sty: JSON.stringify(["Interactive", "Hands-on"]),
    subjects: JSON.stringify(["Programming", "Web Development", "Database"]),
    bio: "I'm passionate about teaching and helping others learn programming concepts.",
    exp: "2 years of tutoring experience in programming subjects."
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@gordon.edu.ph",
    gender: "Female",
    course: "BS Computer Science (BSCS)",
    program: "BSCS",
    role: "Learner",
    secondary_role: "N/A",
    year: "2nd Year",
    phoneNum: "09187654321",
    department: "College of Computer Studies",
    address: "Subic Bay",
    learn_modality: "Online",
    availability: JSON.stringify(["Tuesday", "Thursday", "Saturday"]),
    learn_sty: JSON.stringify(["Visual", "Practical"]),
    subjects: JSON.stringify(["Data Structures", "Algorithms"]),
    bio: "Looking to improve my programming skills and understanding of computer science concepts.",
    goals: "Master data structures and algorithms for better problem-solving skills."
  },
  {
    id: 3,
    name: "David Wilson",
    email: "david.wilson@gordon.edu.ph",
    gender: "Male",
    course: "BS Information Systems (BSIS)",
    program: "BSIS",
    role: "Mentor",
    secondary_role: "Learner",
    year: "4th Year",
    phoneNum: "09198765432",
    department: "College of Computer Studies",
    address: "Zambales",
    learn_modality: "Face-to-face",
    availability: JSON.stringify(["Monday", "Tuesday", "Thursday"]),
    proficiency: "Expert",
    teach_sty: JSON.stringify(["Project-based", "Collaborative"]),
    subjects: JSON.stringify(["Systems Analysis", "Project Management"]),
    bio: "Experienced in both teaching and learning various IT subjects.",
    exp: "3 years of academic tutoring experience."
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.chen@gordon.edu.ph",
    gender: "Female",
    course: "BS Information Technology (BSIT)",
    program: "BSIT",
    role: "Learner",
    secondary_role: "Mentor",
    year: "3rd Year",
    phoneNum: "09165432198",
    department: "College of Computer Studies",
    address: "Olongapo City",
    learn_modality: "Hybrid",
    availability: JSON.stringify(["Wednesday", "Friday", "Saturday"]),
    learn_sty: JSON.stringify(["Auditory", "Interactive"]),
    subjects: JSON.stringify(["Networking", "Cybersecurity"]),
    bio: "Passionate about networking and cybersecurity.",
    goals: "Improve understanding of network security protocols."
  }
];

export default function UsersPage() {
  return <Users users={sampleUsers} onUpdateUsers={() => console.log('Updating users...')} />;
}