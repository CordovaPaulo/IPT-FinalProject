'use client';

import { useState, useEffect } from 'react';
import Schedule from '@/components/learnerpage/schedule/page';
import api from '@/lib/axios';

interface ViewUserProps {
  userId: string;
  onClose: () => void;
}

interface UserInfo {
  name: string;
  year: string;
  course: string;
  gender: string;
  phoneNum: string;
  email: string;
  address: string;
  bio: string;
  subjects: string[];
  learn_modality: string;
  learn_sty: string[];
  availability: string[];
  prefSessDur: string;
  goals: string;
  image: string;
  id: string;
}

export default function ViewUser({ userId, onClose }: ViewUserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [userDeetsForSched, setUserDeetsForSched] = useState<any[]>([]);
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    year: '',
    course: '',
    gender: '',
    phoneNum: '',
    email: '',
    address: '',
    bio: '',
    subjects: [],
    learn_modality: '',
    learn_sty: [],
    availability: [],
    prefSessDur: '',
    goals: '',
    image: '',
    id: ''
  });

  const [imageUrl, setImageUrl] = useState<string>('');

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "Not specified";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const parseArrayString = (str: string | string[]) => {
    if (Array.isArray(str)) {
      return str.join(", ");
    }
    
    try {
      if (typeof str === 'string') {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed.join(", ") : str;
      }
      return str || "Not specified";
    } catch (e) {
      return str || "Not specified";
    }
  };

  // Fetch mentor info from backend using MindMateToken
  const fetchUserInfo = async (id: string) => {
    try {
      setIsLoading(true);
      const token = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('MindMateToken='))?.split('=')[1]
        : '';

      const res = await api.get(`/api/learner/mentors/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const mentor = res.data;

    setUserInfo({
      name: mentor.name || '',
      year: mentor.yearLevel || '',
      course: mentor.program || '',
      gender: mentor.sex || '',
      phoneNum: mentor.phoneNumber || '',
      email: mentor.email || '',
      address: mentor.address || '',
      bio: mentor.bio || '',
      subjects: mentor.subjects || [],
      learn_modality: mentor.modality || '',
      learn_sty: mentor.style || [],
      availability: mentor.availability || [],
      prefSessDur: mentor.sessionDur || '',
      goals: mentor.goals || '',
      image: mentor.image || '',
      id: mentor._id || ''
    });

      setImageUrl(mentor.image || '');

      // Prepare data for schedule component - use more robust object structure
      const scheduleData = {
        mentorId: mentor._id || id,
        mentorName: mentor.name || '',
        mentorYear: mentor.yearLevel || '',
        mentorCourse: mentor.program || '',
        mentorSessionDur: mentor.sessionDur || '',
        mentorModality: mentor.modality || '',
        mentorTeachStyle: mentor.style || [],
        mentorAvailability: mentor.availability || [],
        mentorProfilePic: mentor.image || '',
        mentorSubjects: mentor.subjects || [],
        // Add more fields from userInfo if needed
      };
      
      setUserDeetsForSched(scheduleData);
      console.log("Mentor data prepared for Schedule:", scheduleData);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSchedule = () => {
    setShowConfirmationModal(false);
    setShowSchedule(true);
  };

  const handleScheduleConfirm = async (scheduleData: any) => {
    try {
      setShowSchedule(false);
      onClose();
    } catch (error) {
      console.error("Error handling schedule confirmation:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #006981;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="wrapper">
        {/*  Modal Header - Title */}
        <div className="upper-element sticky-header">
          <h3 className="modal-title">
            <i className="fas fa-user-graduate modal-title-icon"></i>
            Mentor Profile
          </h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="lower-element">
          {/* Mentor Profile Section */}
          <div className="lower-upper">
            <div className="profile-image-container">
              <img
                src={imageUrl || 'https://placehold.co/600x400'}
                alt="Profile Image"
                className="profile-image"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400';
                }}
              />
            </div>

            <div className="profile-information">
              <h4 className="applicant-name">{userInfo.name}</h4>
              <hr className="divider" />
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-venus-mars"></i> Sex at Birth
                  </span>
                  <span className="info-value">
                    {capitalizeFirstLetter(userInfo.gender) || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-calendar-alt"></i> Year
                  </span>
                  <span className="info-value">{userInfo.year || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-graduation-cap"></i> Program
                  </span>
                  <span className="info-value">{userInfo.course || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-phone"></i> Contact
                  </span>
                  <span className="info-value">{userInfo.phoneNum || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-envelope"></i> Email
                  </span>
                  <span className="info-value">{userInfo.email || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-map-marker-alt"></i> Address
                  </span>
                  <span className="info-value">{userInfo.address || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lower-lower">
            <div className="details-section">
              <div className="details-card">
                <h4 className="section-title">
                  <i className="fas fa-book-open"></i> Teaching Details
                </h4>
                <hr className="divider2" />
                <div className="details-content">
                  <div className="detail-item">
                    <span className="detail-label">Subjects Offered:</span>
                    <span className="detail-value wrap-text">
                      {parseArrayString(userInfo.subjects) || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teaching Modality:</span>
                    <span className="detail-value">
                      {userInfo.learn_modality || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teaching Style:</span>
                    <span className="detail-value">
                      {parseArrayString(userInfo.learn_sty) || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Availability:</span>
                    <span className="detail-value availability-text">
                      {parseArrayString(userInfo.availability) || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Session Duration:</span>
                    <span className="detail-value">
                      {userInfo.prefSessDur || "N/A"}
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
                    <span className="detail-value2 wrap-text">
                      {userInfo.bio || "No bio provided"}
                    </span>
                  </div>
                  <div className="detail-item2">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value2 wrap-text">
                      {userInfo.goals || "No experience provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="action-button">
              <div className="button-group">
                <button 
                  className="close-btn-new" 
                  onClick={onClose}
                >
                  <i className="fas fa-times"></i> Close
                </button>
                <button 
                  className="send-offer-btn" 
                  onClick={() => setShowConfirmationModal(true)}
                >
                  <i className="fas fa-calendar-alt"></i> Schedule Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
              <h3>Confirm Schedule</h3>
              <hr className="divider2" />
              <p>Are you sure you want to schedule a session with {userInfo.name}?</p>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowConfirmationModal(false)}
                >
                  Cancel
                </button>
                <button className="modal-btn confirm" onClick={confirmSchedule}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal - This will appear when showSchedule is true */}
        {showSchedule && (
          <div className="popup-overlay">
            <Schedule
              info={userDeetsForSched}
              onClose={() => setShowSchedule(false)}
              onConfirm={handleScheduleConfirm}
            />
          </div>
        )}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 2rem;
          }

          .wrapper {
            background: white;
            border-radius: 12px;
            width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 100;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .wrapper::-webkit-scrollbar {
            display: none;
          }

          .sticky-header {
            position: sticky;
            top: 0;
            z-index: 150;
          }

          .wrap-text {
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
            display: inline-block;
            max-width: 100%;
          }

          .availability-text {
            white-space: pre-line;
            word-break: break-word;
            display: inline-block;
            width: 100%;
          }

          /* Header with title left and close button right */
          .upper-element {
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #0c434d, #3b9aa9);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            min-height: 60px;
          }

          .modal-title {
            margin: 0;
            font-size: 1.3rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .modal-title-icon {
            font-size: 1.1rem;
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

          .lower-element {
            padding: 1.5rem;
          }

          /* Profile Section */
          .lower-upper {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
            align-items: flex-start;
          }

          .profile-image-container {
            position: relative;
            flex-shrink: 0;
          }

          .profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #e1e4e8;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .profile-information {
            flex-grow: 1;
            min-width: 0;
          }

          .applicant-name {
            margin: 0.3rem 0 1rem 0;
            font-size: 1.3rem;
            color: #0c434d;
            font-weight: 700;
            text-align: left;
          }

          .divider {
            border: none;
            border-top: 3px solid #8a8a8f;
            margin-bottom: 0.8rem;
            margin-top: -0.5rem;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.8rem;
          }

          .info-item {
            display: flex;
            flex-direction: column;
            text-align: left;
          }

          .info-label {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0.2rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          .info-label i {
            width: 14px;
            text-align: center;
            font-size: 0.8rem;
          }

          .info-value {
            font-size: 0.85rem;
            font-weight: 600;
            color: #0c434d;
          }

          .lower-lower {
            margin-top: 1rem;
          }

          .details-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .details-card,
          .bio-card {
            background: #f9fafb;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            min-width: 0;
          }

          .section-title {
            margin: 0 0 0.8rem 0;
            font-size: 1rem;
            color: #0c434d;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            text-align: left;
          }

          .section-title i {
            font-size: 0.9rem;
          }

          .divider2 {
            border: none;
            border-top: 1px solid #8a8a8f;
            margin-bottom: 0.8rem;
            margin-top: -0.3rem;
          }

          .details-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.6rem;
          }

          .detail-label {
            font-weight: 500;
            color: #4b5563;
            font-size: 0.8rem;
            flex: 1;
            padding-right: 0.8rem;
            text-align: left;
          }

          .detail-value {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.8rem;
            flex: 1;
            text-align: right;
          }

          .bio-content {
            font-size: 0.8rem;
            line-height: 1.5;
            color: #4b5563;
            text-align: left;
          }

          .detail-item2 {
            display: flex;
            flex-direction: column;
            margin-bottom: 1rem;
            text-align: left;
          }

          .detail-value2 {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.8rem;
            margin-top: 0.2rem;
            text-align: left;
          }

          .action-button {
            position: sticky;
            bottom: 0;
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 1) 25%
            );
            padding: 1rem;
            margin-top: 1rem;
            z-index: 150;
            display: flex;
            justify-content: flex-end;
            width: 100%;
            box-sizing: border-box;
          }

          .action-button button {
            background: linear-gradient(135deg, #0c434d, #3b9aa9);
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(12, 67, 77, 0.3);
            font-size: 0.85rem;
          }

          .action-button button:hover {
            background: linear-gradient(135deg, #0a3b44, #328c9a);
            transform: translateY(-1px);
          }

          .confirmation-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
          }

          .confirmation-modal {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            max-width: 350px;
            width: 90%;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          }

          .confirmation-modal h3 {
            margin-top: 0;
            color: #0c434d;
            margin-bottom: 0.8rem;
            font-size: 1.1rem;
          }

          .confirmation-modal p {
            margin: 0.8rem 0;
            color: #4b5563;
            font-size: 0.9rem;
          }

          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.8rem;
            margin-top: 1.2rem;
          }

          .modal-btn {
            padding: 0.4rem 0.8rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            font-size: 0.85rem;
          }

          .modal-btn.cancel {
            background-color: #f0f0f0;
            color: #333;
          }

          .modal-btn.cancel:hover {
            background-color: #e0e0e0;
          }

          .modal-btn.confirm {
            background: linear-gradient(135deg, #0c434d, #3b9aa9);
            color: white;
          }

          .modal-btn.confirm:hover {
            background: linear-gradient(135deg, #0a3b44, #328c9a);
          }

          .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
          }

          .button-group {
            display: flex;
            justify-content: space-between;
            width: 100%;
            gap: 1rem;
          }

          .close-btn-new {
            background: #fff0f0;
            color: #dc2626;
            border: 1px solid #fecaca;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            font-size: 0.85rem;
          }

          .close-btn-new:hover {
            background: #fee2e2;
            border-color: #fca5a5;
          }

          .send-offer-btn {
            background: linear-gradient(135deg, #0c434d, #3b9aa9);
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            font-size: 0.85rem;
          }

          .send-offer-btn:hover {
            background: linear-gradient(135deg, #0a3b44, #328c9a);
            transform: translateY(-1px);
          }

          @media (max-width: 850px) {
            .modal-overlay {
              padding: 1rem;
            }
            .wrapper {
              width: 95%;
              max-width: 95vw;
            }
            .details-section {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
          }

          @media (max-width: 768px) {
            .lower-upper {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .profile-information {
              text-align: center;
            }
            .applicant-name,
            .info-item {
              text-align: center;
            }
            .action-button {
              justify-content: center;
            }
            .button-group {
              justify-content: center;
              flex-direction: column-reverse;
              align-items: stretch;
            }
          }

          @media (max-width: 480px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
            .details-card,
            .bio-card {
              padding: 0.8rem;
            }
            .profile-image {
              width: 80px;
              height: 80px;
            }
            .upper-element {
              padding: 0.8rem 
            }
            .applicant-name,
            .info-item {
              text-align: center;
            }
            .action-button {
              justify-content: center;
            }
            .button-group {
              justify-content: center;
              flex-direction: column-reverse;
              align-items: stretch;
            }
          }

          @media (max-width: 480px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
            .details-card,
            .bio-card {
              padding: 0.8rem;
            }
            .profile-image {
              width: 80px;
              height: 80px;
            }
            .upper-element {
              padding: 0.8rem 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}