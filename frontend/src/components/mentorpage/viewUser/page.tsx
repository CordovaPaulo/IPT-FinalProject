// src/components/mentorpage/viewUser/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Offer from '../offer/page';

interface ViewUserProps {
  userId: number;
  mentorData: any;
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
  id: number;
}

export default function ViewUser({ userId, mentorData, onClose }: ViewUserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [userDeetsForOffer, setUserDeetsForOffer] = useState<any[]>([]);
  
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
    id: 0
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

  const fetchUserInfo = async (id: number) => {
    try {
      setIsLoading(true);

      // Replace with your actual API endpoint
      const response = await fetch(`/api/mentor/users/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user info');

      const data = await response.json();
      
      setUserInfo({
        name: data.user.name || '',
        year: data.user_info?.year || '',
        course: data.user_info?.course || '',
        gender: data.user_info?.gender || '',
        phoneNum: data.user_info?.phoneNum || '',
        email: data.user?.email || '',
        address: data.user_info?.address || '',
        bio: data.user_info?.bio || '',
        subjects: data.user_info?.subjects || [],
        learn_modality: data.user_info?.learn_modality || '',
        learn_sty: data.user_info?.learn_sty || [],
        availability: data.user_info?.availability || [],
        prefSessDur: data.user_info?.prefSessDur || '',
        goals: data.user_info?.goals || '',
        image: data.user_info?.image || '',
        id: data.user?.id || 0
      });

      setImageUrl(data.image_url || '');

      // Prepare data for offer component
      const offerData = [
        data.user?.id || 0, // userSchoolId
        userId, // userId
        data.user?.name || '', // userName
        data.user_info?.year || '', // userYear
        data.user_info?.course || '', // userCourse
        data.user_info?.prefSessDur || '', // userSessionDur
        data.user_info?.learn_modality || '', // userModality
        data.user_info?.learn_sty || [], // userLearnStyle
        data.user_info?.availability || [], // userAvailability
        data.user_info?.learn_modality || '', // userLearnModality
        data.user_info?.image || '', // userProfilePic
        data.user_info?.subjects || [], // userSubjects
      ];
      
      setUserDeetsForOffer(offerData);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSendOffer = () => {
    setShowConfirmationModal(false);
    setShowOffer(true);
  };

  const handleOfferConfirm = async (offerData: any) => {
    try {
      setShowOffer(false);
      onClose();
    } catch (error) {
      console.error("Error handling offer confirmation:", error);
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
    <div className="wrapper">
      {/* Sticky Modal Header */}
      <div className="upper-element sticky-header">
        <div className="header-content">
          <i className="fas fa-user-graduate modal-title-icon"></i>
          <h3 className="modal-title">Learner Profile</h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Modal Body */}
      <div className="lower-element">
        {/* Learner Profile Section */}
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
                <i className="fas fa-book-open"></i> Learning Preferences
              </h4>
              <hr className="divider2" />
              <div className="details-content">
                <div className="detail-item">
                  <span className="detail-label">Subjects of Interest:</span>
                  <span className="detail-value right-align wrap-text">
                    {parseArrayString(userInfo.subjects) || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Learning Modality:</span>
                  <span className="detail-value right-align">
                    {userInfo.learn_modality || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Learning Style:</span>
                  <span className="detail-value right-align">
                    {parseArrayString(userInfo.learn_sty) || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Availability:</span>
                  <span className="detail-value availability-text right-align">
                    {parseArrayString(userInfo.availability) || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Preferred Session Duration:</span>
                  <span className="detail-value right-align">
                    {userInfo.prefSessDur || "N/A"}
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
                  <span className="detail-label">Bio:</span>
                  <span className="detail-value2 wrap-text">
                    {userInfo.bio || "No bio provided"}
                  </span>
                </div>
                <div className="detail-item2">
                  <span className="detail-label">Academic Goals:</span>
                  <span className="detail-value2 wrap-text">
                    {userInfo.goals || "No goals provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="action-button">
            <button onClick={() => setShowConfirmationModal(true)}>
              <i className="fas fa-paper-plane"></i> Send Offer
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Offer</h3>
            <hr className="divider2" />
            <p>Are you sure you want to send a mentoring offer to {userInfo.name}?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={confirmSendOffer}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal - This will appear when showOffer is true */}
      {showOffer && (
        <div className="popup-overlay">
          <Offer
            info={userDeetsForOffer}
            mentorId={mentorData.user?.id}
            onClose={() => setShowOffer(false)}
            onConfirm={handleOfferConfirm}
          />
        </div>
      )}

      <style jsx>{`
        .wrapper {
          background: white;
          border-radius: 12px;
          width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 100;
          margin-top: 3rem;
          left: 10rem;
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

        .right-align {
          text-align: right;
          display: block;
          width: 100%;
          white-space: normal;
        }

        .availability-text {
          white-space: pre-line;
          word-break: break-word;
          text-align: right;
          display: inline-block;
          width: 100%;
        }

        .upper-element {
          padding: 1.5rem;
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
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

        .modal-title-icon {
          font-size: 1.2rem;
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

        .lower-upper {
          display: flex;
          gap: 2rem;
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

        .profile-information {
          flex-grow: 1;
          min-width: 0;
        }

        .applicant-name {
          margin: 0.6rem 0 1.5rem 0;
          font-size: 1.5rem;
          color: #0c434d;
          font-weight: 700;
          text-align: left;
        }

        .divider {
          border: none;
          border-top: 4px solid #8a8a8f;
          margin-bottom: 1rem;
          margin-top: -1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .info-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-label i {
          width: 16px;
          text-align: center;
        }

        .info-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0c434d;
          margin-left: 25px;
        }

        .lower-lower {
          margin-top: 1.5rem;
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
          border-radius: 10px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          min-width: 0;
        }

        .section-title {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #0c434d;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .section-title i {
          font-size: 1rem;
        }

        .divider2 {
          border: none;
          border-top: 1px solid #8a8a8f;
          margin-bottom: 1rem;
          margin-top: -0.5rem;
        }

        .details-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .detail-label {
          font-weight: 500;
          color: #4b5563;
          font-size: 0.85rem;
          flex: 1;
          padding-right: 1rem;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.85rem;
          flex: 1;
        }

        .bio-content {
          font-size: 0.85rem;
          line-height: 1.6;
          color: #4b5563;
          text-align: left;
        }

        .detail-item2 {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.5rem;
        }

        .detail-value2 {
          font-weight: 600;
          color: #1f2937;
          text-align: left;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .action-button {
          position: sticky;
          bottom: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 1) 25%
          );
          padding: 1.25rem;
          margin-top: 1rem;
          z-index: 150;
          display: flex;
          justify-content: flex-end;
          width: 100%;
          box-sizing: border-box;
          left: 0;
          margin: 0;
          padding-right: 2rem;
        }

        .action-button button {
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(12, 67, 77, 0.3);
          font-size: 0.9rem;
        }

        .confirmation-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .confirmation-modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          margin: auto;
        }

        .confirmation-modal h3 {
          margin-top: 0;
          color: #0c434d;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .confirmation-modal p {
          margin: 1rem 0;
          color: #4b5563;
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
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
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
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
        }

        @media (max-width: 850px) {
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
          .info-value {
            margin-left: 0;
          }
          .action-button {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .details-card,
          .bio-card {
            padding: 1rem;
          }
          .profile-image {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
}