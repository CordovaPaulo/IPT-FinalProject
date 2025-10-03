"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import "./module.css";


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
        setLocalApplicants((prev: any) => {
          const updatedApplicants = { ...prev };
          // Find the applicant in pending
          const applicant = updatedApplicants.mentors.pending.find(
            (app: any) => app.user_id === currentAppId
          );
          if (applicant) {
            // Remove from pending
            updatedApplicants.mentors.pending = updatedApplicants.mentors.pending.filter(
              (app: any) => app.user_id !== currentAppId
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
        setLocalApplicants((prev: any) => {
          const updatedApplicants = { ...prev };
          // Find the applicant in pending
          const applicant = updatedApplicants.mentors.pending.find(
            (app: any) => app.user_id === currentAppId
          );
          if (applicant) {
            // Remove from pending
            updatedApplicants.mentors.pending = updatedApplicants.mentors.pending.filter(
              (app: any) => app.user_id !== currentAppId
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