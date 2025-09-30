"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface Applicant {
  user_id: number;
  name: string;
  course: string;
  applied_on: string;
  status: string;
}

interface Credential {
  id: number;
  name: string;
  previewLink: string;
  downloadLink: string;
}

interface ApplicantDetails {
  user: {
    name: string;
  };
  info: {
    image?: string;
    approval_status?: string;
    gender?: string;
    year?: string;
    course?: string;
    address?: string;
    proficiency?: string;
    learn_modality?: string;
    teach_sty?: string;
    availability?: string;
    subjects?: string;
    bio?: string;
    exp?: string;
  };
  image_url?: string;
}

interface CredentialsResponse {
  credentials: Credential[];
}

interface ApplicationsProps {
  applicants: any;
  onUpdateApplicants: () => void;
}

const sampleApplicants = {
  mentors: {
    pending: [
      {
        user_id: 1,
        name: "John Smith",
        course: "BS Information Technology (BSIT)",
        applied_on: "2025-09-28",
        status: "pending"
      },
      {
        user_id: 2,
        name: "Maria Garcia",
        course: "BS Computer Science (BSCS)",
        applied_on: "2025-09-27",
        status: "pending"
      },
      {
        user_id: 7,
        name: "Alex Turner",
        course: "BS Information Systems (BSIS)",
        applied_on: "2025-09-26",
        status: "pending"
      }
    ],
    approved: [
      {
        user_id: 3,
        name: "David Wilson",
        course: "BS Information Systems (BSIS)",
        applied_on: "2025-09-25",
        status: "approved"
      },
      {
        user_id: 4,
        name: "Sarah Johnson",
        course: "BS Computer Engineering (BSCpE)",
        applied_on: "2025-09-24",
        status: "approved"
      },
      {
        user_id: 8,
        name: "Emily Chen",
        course: "BS Information Technology (BSIT)",
        applied_on: "2025-09-23",
        status: "approved"
      }
    ],
    rejected: [
      {
        user_id: 5,
        name: "Michael Brown",
        course: "BS Information Technology (BSIT)",
        applied_on: "2025-09-23",
        status: "rejected"
      },
      {
        user_id: 6,
        name: "Emma Davis",
        course: "BS Computer Science (BSCS)",
        applied_on: "2025-09-22",
        status: "rejected"
      }
    ]
  }
};

const Applications: React.FC<ApplicationsProps> = ({ 
  applicants = sampleApplicants, 
  onUpdateApplicants 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<number | null>(null);
  const [currentApp, setCurrentApp] = useState<any>({});
  const [actionToConfirm, setActionToConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add new state to manage applicants data locally
  const [localApplicants, setLocalApplicants] = useState(applicants);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    withCredentials: true,
  });

  const getCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  };

  const approve = async (id: number) => {
    try {
      const response = await api.patch(
        `/api/admin/mentor/approve/${id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log('Application approved successfully!');
        return response.data;
      }
      throw new Error(`Failed to approve application: ${response.status}`);
    } catch (error) {
      console.error('Failed to approve application. Please try again.', error);
      throw error;
    }
  };

  const reject = async (id: number) => {
    try {
      const response = await api.patch(
        `/api/admin/mentor/reject/${id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log('Application rejected successfully.');
        return response.data;
      }
      throw new Error(`Failed to reject application: ${response.status}`);
    } catch (error) {
      console.error('Failed to reject application. Please try again.', error);
      throw error;
    }
  };

  const getApplicantDetails = async (applicantId: number): Promise<ApplicantDetails> => {
    try {
      const csrfToken = getCookie('csrftoken');
      const headers: any = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await api.get(`/api/admin/${applicantId}`, { headers });

      if (response.status === 200) {
        return response.data;
      }
      throw new Error(`Failed to fetch user details: ${response.status}`);
    } catch (error) {
      console.error('Error fetching applicant details:', error);
      throw error;
    }
  };

  const getApplicantCreds = async (applicationId: number): Promise<CredentialsResponse> => {
    try {
      const csrfToken = getCookie('csrftoken');
      const headers: any = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await api.get(`/api/admin/cred/${applicationId}`, { headers });

      if (response.status === 200) {
        return response.data;
      }
      throw new Error(`Failed to fetch applicant credentials: ${response.status}`);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      throw error;
    }
  };

  const previewFile = (previewLink: string) => {
    if (previewLink) {
      window.open(previewLink, '_blank');
    }
  };

  const downloadFile = (downloadLink: string, fileName: string) => {
    if (downloadLink) {
      const link = document.createElement('a');
      link.href = downloadLink;
      link.download = fileName || 'credential.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return 'Not specified';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Update the filteredApplicants useMemo to use localApplicants
  const filteredApplicants = useMemo(() => {
    if (!localApplicants?.mentors) {
      return [];
    }

    let allApplicants = [
      ...(localApplicants.mentors.pending || []),
      ...(localApplicants.mentors.approved || []),
      ...(localApplicants.mentors.rejected || []),
    ];

    if (activeFilter !== 'all') {
      allApplicants = localApplicants.mentors[activeFilter] || [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allApplicants = allApplicants.filter(
        (app: any) =>
          (app.name?.toLowerCase() || '').includes(query) ||
          (app.course?.toLowerCase() || '').includes(query)
      );
    }

    return allApplicants;
  }, [localApplicants, activeFilter, searchQuery]);

  const showConfirmation = (id: number, action: string) => {
    setCurrentAppId(id);
    setActionToConfirm(action);
    setShowModal(true);
  };

  const hideConfirmation = () => {
    setShowModal(false);
    setCurrentAppId(null);
    setActionToConfirm('');
  };

  // Update the confirmAction function
  const confirmAction = async () => {
    if (!currentAppId) return;

    try {
      setIsLoading(true);
      if (actionToConfirm === 'Approved') {
        await approve(currentAppId);
        // Update local state
        setLocalApplicants(prev => {
          const updatedApplicants = { ...prev };
          // Find the applicant in pending
          const applicant = updatedApplicants.mentors.pending.find(
            app => app.user_id === currentAppId
          );
          if (applicant) {
            // Remove from pending
            updatedApplicants.mentors.pending = updatedApplicants.mentors.pending.filter(
              app => app.user_id !== currentAppId
            );
            // Add to approved with updated status
            updatedApplicants.mentors.approved = [
              ...updatedApplicants.mentors.approved,
              { ...applicant, status: 'approved' }
            ];
          }
          return updatedApplicants;
        });
      } else if (actionToConfirm === 'Rejected') {
        await reject(currentAppId);
        // Update local state
        setLocalApplicants(prev => {
          const updatedApplicants = { ...prev };
          // Find the applicant in pending
          const applicant = updatedApplicants.mentors.pending.find(
            app => app.user_id === currentAppId
          );
          if (applicant) {
            // Remove from pending
            updatedApplicants.mentors.pending = updatedApplicants.mentors.pending.filter(
              app => app.user_id !== currentAppId
            );
            // Add to rejected with updated status
            updatedApplicants.mentors.rejected = [
              ...updatedApplicants.mentors.rejected,
              { ...applicant, status: 'rejected' }
            ];
          }
          return updatedApplicants;
        });
      }

      onUpdateApplicants();
      hideConfirmation();
    } catch (error) {
      console.error(`Error ${actionToConfirm.toLowerCase()} application:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const showCredentials = async (app: any) => {
    try {
      setIsLoading(true);
      // For demo purposes, we'll use mock data
      // In production, uncomment the API calls
      /*
      const data = await getApplicantDetails(app.user_id);
      const credentialsResponse = await getApplicantCreds(app.user_id);
      */

      // Mock data for demonstration
      const mockData = {
        user: { name: app.name },
        info: {
          image: null,
          approval_status: app.status,
          gender: 'MALE',
          year: '3rd Year',
          course: app.course,
          address: 'Olongapo City',
          proficiency: 'Advanced',
          learn_modality: 'Hybrid',
          teach_sty: JSON.stringify(['Interactive', 'Hands-on']),
          availability: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
          subjects: JSON.stringify(['Programming', 'Web Development']),
          bio: 'Passionate about teaching and helping others learn.',
          exp: '2 years of tutoring experience',
        }
      };

      const mockCredentials = {
        credentials: [
          {
            id: 1,
            name: 'Resume.pdf',
            previewLink: '#',
            downloadLink: '#'
          },
          {
            id: 2,
            name: 'Certificate.pdf',
            previewLink: '#',
            downloadLink: '#'
          }
        ]
      };

      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      
      const applicantData = {
        applicant: mockData.user.name,
        image: mockData.info.image ? `${baseURL}/api/image/${mockData.info.image}` : '/default-avatar.png',
        status: mockData.info.approval_status,
        gender: mockData.info.gender,
        year: mockData.info.year,
        program: mockData.info.course,
        college: 'College of Computer Studies',
        city: mockData.info.address,
        proficiency: mockData.info.proficiency,
        modality: mockData.info.learn_modality,
        style: JSON.parse(mockData.info.teach_sty),
        availability: JSON.parse(mockData.info.availability),
        subjects: JSON.parse(mockData.info.subjects),
        bio: mockData.info.bio,
        experience: mockData.info.exp,
        files: mockCredentials.credentials
      };

      setCurrentApp(applicantData);
      setShowCredentialsModal(true);
    } catch (error) {
      console.error('Error showing credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hideCredentials = () => {
    setShowCredentialsModal(false);
    setCurrentApp({});
  };

  const getProgramName = (course: string): string => {
    const match = course.match(/\(([^)]+)\)/);
    return match?.[1] || course;
  };

  return (
    <>
      <div className="applications-container">
        <div className="applications-header">
          <h2 className="applications-title">
            <i className="fas fa-file-alt header-icon"></i>
            Applications
          </h2>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('approved')}
            >
              Approved
            </button>
            <button
              className={`filter-btn ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected
            </button>
            <button
              className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              Pending
            </button>
          </div>

          <div className="search-container">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="table-scroll-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Program</th>
                <th>Date</th>
                <th>Credentials</th>
                {activeFilter === 'all' ? <th>Actions</th> : <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((app: any) => (
                <tr key={app.user_id}>
                  <td>
                    <span className="id-badge">{app.user_id}</span>
                  </td>
                  <td>{app.name}</td>
                  <td>{getProgramName(app.course)}</td>
                  <td>
                    <span className="date-badge">{formatDate(app.applied_on)}</span>
                  </td>
                  <td>
                    <button
                      className="credentials-btn"
                      onClick={() => showCredentials(app)}
                    >
                      <i className="fas fa-eye"></i> <span>View</span>
                    </button>
                  </td>
                  {activeFilter === 'all' ? (
                    <td className="action-buttons">
                      <button
                        className={`action-btn accept ${app.status === 'approved' ? 'active' : ''}`}
                        onClick={() => showConfirmation(app.user_id, 'Approved')}
                        disabled={app.status === 'approved' || app.status === 'rejected' || isLoading}
                      >
                        <i className="fas fa-check"></i>
                        <span>{app.status === 'approved' ? 'Approved' : 'Approve'}</span>
                      </button>
                      <button
                        className={`action-btn reject ${app.status === 'rejected' ? 'active' : ''}`}
                        onClick={() => showConfirmation(app.user_id, 'Rejected')}
                        disabled={app.status === 'approved' || app.status === 'rejected' || isLoading}
                      >
                        <i className="fas fa-times"></i>
                        <span>{app.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
                      </button>
                    </td>
                  ) : (
                    <td>
                      <span className={`status-text ${app.status.toLowerCase()}`}>
                        {capitalizeFirstLetter(app.status)}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={activeFilter === 'all' ? 6 : 6} className="no-applications">
                    No applications to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={hideConfirmation}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Action</h3>
              <hr />
              <p>
                Are you sure you want to mark this application as
                <strong> {actionToConfirm}</strong>?
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={hideConfirmation}>
                  Cancel
                </button>
                <button className="modal-btn confirm" onClick={confirmAction}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showCredentialsModal && (
          <div className="modal-overlay" onClick={hideCredentials}>
            <div className="credentials-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="header-content">
                  <i className="fas fa-user-graduate modal-title-icon"></i>
                  <h3 className="modal-title">Applicant Credentials</h3>
                </div>
                <button className="close-btn" onClick={hideCredentials}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="applicant-profile">
                  <div className="profile-image-container">
                    <img
                      src={currentApp.image_url || '/default-avatar.png'}
                      alt={`Portrait of ${currentApp.applicant}`}
                      className="profile-image"
                    />
                    {currentApp.status && (
                      <div className={`status-badge ${currentApp.status.toLowerCase()}`}>
                        {currentApp.status}
                      </div>
                    )}
                  </div>

                  <div className="profile-info">
                    <h4 className="applicant-name">{currentApp.applicant}</h4>
                    <hr className="divider" />
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-venus-mars"></i> Sex at Birth
                        </span>
                        <span className="info-value">{currentApp.gender || 'NON-BINARY'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-calendar-alt"></i> Year
                        </span>
                        <span className="info-value">{currentApp.year || '2nd Year'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-graduation-cap"></i> Program
                        </span>
                        <span className="info-value">
                          {currentApp.program || 'Bachelor of Science in Information Technology'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-university"></i> College
                        </span>
                        <span className="info-value">
                          {currentApp.college || 'College of Computer Studies'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-map-marker-alt"></i> Location
                        </span>
                        <span className="info-value">{currentApp.city || 'Olongapo City'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <div className="details-card">
                    <h4 className="section-title">
                      <i className="fas fa-info-circle"></i> Application Details
                    </h4>
                    <hr className="divider2" />
                    <div className="details-content">
                      <div className="detail-item">
                        <span className="detail-label">Proficiency Level:</span>
                        <span className="detail-value">{currentApp.proficiency || 'Advanced'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Teaching Modality:</span>
                        <span className="detail-value">
                          {currentApp.modality || 'Online and In-Person'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Teaching Style:</span>
                        <span className="detail-value">{currentApp.style || 'Interactive'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Availability:</span>
                        <span className="detail-value">
                          {currentApp.availability || 'Monday, Wednesday, Friday'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Subjects Offered:</span>
                        <span className="detail-value">
                          {currentApp.subjects || 'Web Development, Database Management'}
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
                        <span className="detail-label">Bio:</span>
                        <span className="detail-value2">
                          {currentApp.bio ||
                            'Passionate tutor with a love for helping students excel in technology and programming.'}
                        </span>
                      </div>
                      <div className="detail-item2">
                        <span className="detail-label">Tutoring Experience:</span>
                        <span className="detail-value2">
                          {currentApp.experience ||
                            '2 years of experience in tutoring web development and database management.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="credentials-section">
                  <h4 className="section-title">
                    <i className="fas fa-file-alt"></i> Submitted Credentials
                  </h4>
                  <div className="credentials-grid">
                    {currentApp.files?.map((file: any) => (
                      <div key={file.id} className="credential-card">
                        <div className="file-icon">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <div className="file-actions">
                            <button
                              onClick={() => previewFile(file.previewLink)}
                              className="action-btn preview"
                            >
                              <i className="fas fa-eye"></i> Preview
                            </button>
                            <button
                              onClick={() => downloadFile(file.downloadLink, file.name)}
                              className="action-btn download"
                            >
                              <i className="fas fa-download"></i> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!currentApp.files?.length && (
                      <div className="no-credentials">No credentials submitted</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="footer-actions">
                  <button className="footer-btn back" onClick={hideCredentials}>
                    <i className="fas fa-arrow-left"></i> Back to Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

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
          color: #black;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .filter-btn.active {
          font-weight: 600;
        }

        .filter-btn:nth-child(2) {
          color: rgba(76, 175, 80, 0.9);
        }

        .filter-btn:hover:nth-child(2) {
          background: rgba(164, 255, 156, 0.5);
        }

        .filter-btn:nth-child(3) {
          color: rgba(244, 67, 54, 0.9);
        }

        .filter-btn:hover:nth-child(3) {
          background: rgba(255, 156, 156, 0.5);
        }

        .filter-btn:nth-child(4) {
          color: rgba(255, 165, 0, 0.9);
        }

        .filter-btn:hover:nth-child(4) {
          background: rgba(255, 225, 156, 0.5);
        }

        .search-container {
          margin-left: auto;
          position: relative;
          min-width: 250px;
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

        .action-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.35rem 0.7rem;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }

        .action-btn.accept {
          background-color: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .action-btn.reject {
          background-color: rgba(244, 67, 54, 0.1);
          color: #c62828;
          border: 1px solid rgba(244, 67, 54, 0.3);
        }

        .action-btn.accept:hover {
          background-color: rgba(76, 175, 80, 0.2);
        }

        .action-btn.reject:hover {
          background-color: rgba(244, 67, 54, 0.2);
        }

        .action-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
          pointer-events: none;
          background-color: #f3f4f6 !important;
          border-color: #d1d5db;
          color: #9ca3af;
        }

        .action-btn.accept.active {
          background-color: rgba(76, 175, 80, 0.4) !important;
          border-color: #2e7d32;
          cursor: default;
          font-weight: 700;
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
          color: #0a6b0f;
        }

        .action-btn.reject.active {
          background-color: rgba(244, 67, 54, 0.4) !important;
          border-color: #c62828;
          cursor: default;
          font-weight: 700;
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(198, 40, 40, 0.3);
          color: #6b0a0a;
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

        .id-badge {
          display: inline-block;
          padding: 0.15rem 0.35rem;
          border-radius: 6px;
          background-color: rgba(59, 154, 169, 0.1);
          color: #3b9aa9;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .date-badge {
          display: inline-block;
          background: rgba(0, 0, 0, 0.05);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .status-text {
          font-weight: 600;
        }

        .status-text.approved {
          color: #2e7d32;
        }

        .status-text.rejected {
          color: #c62828;
        }

        .no-applications {
          text-align: center;
          padding: 1rem;
          color: #0b2548;
        }

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

        .modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal h3 {
          margin-top: 0;
          color: #0b3e8a;
          margin-bottom: 1rem;
        }

        .modal p {
          margin-bottom: 2rem;
          margin-top: 2rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .modal-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: -15px;
        }

        .modal-btn.cancel {
          color: #e5e5e5;
          background-color: #0b3e8a;
          border-radius: 10px;
        }

        .modal-btn.confirm {
          color: #e5e5e5;
          background-color: #2e7d32;
          border-radius: 10px;
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

        .status-badge.pending,
        .status-badge.pending_approval {
          background-color: #ef6c00;
        }

        .status-badge.approved {
          background-color: #2e7d32;
        }

        .status-badge.rejected {
          background-color: #c62828;
        }

        .profile-info {
          flex-grow: 1;
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

        .applicant-name {
          margin: 0.6rem 0 1.5rem 0;
          font-size: 1.6rem;
          color: #0b2548;
          font-weight: 700;
          text-align: left;
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

        .detail-value2 {
          font-weight: 600;
          color: #1f2937;
          text-align: left;
          flex: 1;
          padding-left: 1rem;
          font-size: 0.9rem;
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

        .credentials-section {
          margin-top: 1.5rem;
        }

        .credentials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .credential-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .credential-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .file-icon {
          font-size: 2rem;
          color: #e63946;
          flex-shrink: 0;
        }

        .file-info {
          flex-grow: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: #1f2937;
          display: block;
          margin-bottom: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn.preview {
          background-color: rgba(59, 154, 169, 0.1);
          color: #0b3e8a;
        }

        .action-btn.preview:hover {
          background-color: rgba(59, 154, 169, 0.2);
        }

        .action-btn.download {
          background-color: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
        }

        .action-btn.download:hover {
          background-color: rgba(76, 175, 80, 0.2);
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

        .footer-actions {
          display: flex;
          gap: 0.75rem;
        }

        .footer-btn.back {
          background-color: transparent;
          color: #6b7280;
        }

        .footer-btn.back:hover {
          background-color: #e5e7eb;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3b9aa9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

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

          .action-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
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

          .credentials-grid {
            grid-template-columns: 1fr;
          }

          .credential-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

// Default export with sample data
export default function ApplicationsPage() {
  const handleUpdateApplicants = () => {
    // Placeholder function for updating applicants
    console.log('Updating applicants...');
  };

  return <Applications applicants={sampleApplicants} onUpdateApplicants={handleUpdateApplicants} />;
}