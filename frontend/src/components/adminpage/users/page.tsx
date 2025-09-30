"use client";

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

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

      <style jsx>{`
        .applications-container {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(26, 79, 159, 0.5);
          overflow: hidden;
          width: 95%;
          margin: 0 auto;
          text-align: center;
          height: calc(89vh - 120px);
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .applications-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
          color: #0b2548;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .applications-title {
          margin: 0;
          font-size: 1.5rem;
          color: rgb(18, 44, 84);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-grow: 1;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.35rem 0.8rem;
          border: none;
          border-radius: 20px;
          background: rgba(223, 223, 223, 0.5);
          color: black;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .filter-btn.active {
          font-weight: 600;
        }

        .filter-btn:nth-child(2) {
          color: rgba(59, 154, 169, 0.9);
        }

        .filter-btn:hover:nth-child(2) {
          background: rgba(156, 223, 255, 0.5);
        }

        .filter-btn:nth-child(3) {
          color: rgba(76, 175, 80, 0.9);
        }

        .filter-btn:hover:nth-child(3) {
          background: rgba(164, 255, 156, 0.5);
        }

        .search-container {
          margin-left: auto;
          position: relative;
          min-width: 250px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #3b9aa9;
          z-index: 1;
        }

        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #cbd5e0;
          border-radius: 20px;
          width: 100%;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          background-color: #f8fafc;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b9aa9;
          box-shadow: 0 0 0 3px rgba(59, 154, 169, 0.2);
        }

        .export-btn {
          padding: 0.5rem 1rem;
          background-color: #203d4d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.3s;
          font-size: 0.8rem;
        }

        .export-btn:hover {
          background-color: #366177;
        }

        .table-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overflow-y: auto;
          flex-grow: 1;
          position: relative;
          height: calc(100% - 80px);
          margin: 0 1rem;
          scroll-behavior: smooth;
        }

        .table-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .applications-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: center;
          font-size: 0.85rem;
        }

        .applications-table thead {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: white;
        }

        .applications-table th {
          position: sticky;
          top: 0;
          background-color: #e5e5e5;
          color: #0b2548;
          font-weight: 600;
          padding: 0.5rem;
          font-size: 0.9rem;
          border-bottom: 2px solid #3b9aa9;
          z-index: 10;
        }

        .applications-table td {
          padding: 0.5rem;
          vertical-align: middle;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
        }

        .applications-table tr:hover {
          background-color: rgba(59, 154, 169, 0.05);
        }

        .id-badge {
          display: inline-block;
          padding: 0.15rem 0.35rem;
          border-radius: 6px;
          background-color: rgba(59, 154, 169, 0.1);
          color: #3b9aa9;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .role-badge.mentor {
          background-color: #3b9aa9;
        }

        .role-badge.learner {
          background-color: #4caf50;
        }

        .secondary-role-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .secondary-role-badge.mentor {
          background-color: #3b9aa9;
        }

        .secondary-role-badge.learner {
          background-color: #4caf50;
        }

        .secondary-role-badge.na {
          background-color: #8a8a8f;
        }

        .credentials-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 4px 8px;
          border: 1px solid #0b3e8a;
          background-color: rgba(73, 152, 164, 0.103);
          color: #0b3e8a;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .credentials-btn:hover {
          background-color: rgba(59, 154, 169, 0.2);
        }

        .no-applications {
          text-align: center;
          padding: 1rem;
          color: #0b2548;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .credentials-modal {
          background: white;
          border-radius: 12px;
          max-width: 1000px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          -ms-overflow-style: none;
          scrollbar-width: none;
          position: relative;
        }

        .credentials-modal::-webkit-scrollbar {
          display: none;
        }

        .modal-header {
          position: sticky;
          top: 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          z-index: 20;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 1.5rem;
          padding-bottom: calc(1.5rem + 70px);
        }

        .applicant-profile {
          display: flex;
          gap: 3rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .profile-image-container {
          position: relative;
          flex-shrink: 0;
        }

        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #e1e4e8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .status-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transform: translateY(25%);
        }

        .status-badge.mentor {
          background-color: #3b9aa9;
        }

        .status-badge.learner {
          background-color: #4caf50;
        }

        .profile-info {
          flex-grow: 1;
        }

        .applicant-name {
          margin: 0.6rem 0 1.5rem 0;
          font-size: 1.6rem;
          color: #0b2548;
          font-weight: 700;
          text-align: left;
        }

        .divider {
          border: none;
          border-top: 4px solid #8a8a8f;
          margin-bottom: 1rem;
          margin-top: -1rem;
        }

        .divider2 {
          border: none;
          border-top: 1px solid #8a8a8f;
          margin-bottom: 1.5rem;
          margin-top: -0.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .info-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-label i {
          width: 16px;
          text-align: center;
        }

        .info-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0b234a;
          margin-left: 25px;
        }

        .details-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .details-card,
        .bio-card {
          background: #f9fafb;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .section-title {
          margin: 0 0 1.25rem 0;
          font-size: 1.1rem;
          color: #0b3e8a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .details-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.9rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          text-align: left;
          margin-bottom: 1.1rem;
        }

        .detail-item2 {
          display: flex;
          flex-direction: column;
          margin-bottom: 2rem;
        }

        .detail-label {
          font-weight: 500;
          color: #4b5563;
          font-size: 0.85rem;
          flex: 1;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
          text-align: right;
          flex: 1;
          padding-left: 1rem;
          font-size: 0.9rem;
        }

        .detail-value2 {
          font-weight: 600;
          color: #1f2937;
          text-align: left;
          flex: 1;
          padding-left: 1rem;
          font-size: 0.9rem;
        }

        .bio-content {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #4b5563;
          text-align: left;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .modal-footer {
          position: sticky;
          bottom: 0;
          padding: 1.25rem 1.5rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          z-index: 20;
          backdrop-filter: blur(8px);
          background-color: rgba(249, 250, 251, 0.95);
        }

        .footer-actions {
          display: flex;
          gap: 0.75rem;
        }

        .footer-btn {
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .footer-btn.back {
          background-color: transparent;
          color: #6b7280;
        }

        .footer-btn.back:hover {
          background-color: #e5e7eb;
        }

        .footer-btn.export {
          background-color: #e53935;
          color: white;
          border: none;
        }

        .footer-btn.export:hover {
          background-color: #c62828;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .applications-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .search-container {
            margin-left: 0;
            width: 100%;
          }

          .search-input {
            width: 100%;
          }

          .applicant-profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .details-section {
            grid-template-columns: 1fr;
          }

          .credentials-modal {
            width: 95%;
            margin: 0.5rem;
            max-height: 95vh;
          }

          .modal-body {
            padding: 1rem;
          }

          .detail-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .detail-value {
            text-align: left;
            padding-left: 0;
            width: 100%;
          }

          .detail-value2 {
            padding-left: 0;
            width: 100%;
          }

          .info-value {
            margin-left: 0;
            width: 100%;
          }

          .applications-table {
            font-size: 0.75rem;
          }

          .applications-table th,
          .applications-table td {
            padding: 0.35rem;
          }
        }
      `}</style>
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