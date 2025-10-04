// src/components/mentorpage/viewUser/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Offer from '../offer/page';
import styles from './view.module.css';
import api from '@/lib/axios'; // Import your axios instance

interface ViewUserProps {
  userId: string; // Changed from number to string to match the ID type
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
  id: string; // Changed from number to string
}

// Helper to get cookie value
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
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

  const fetchUserInfo = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching learner details for ID:', id);

      const token = getCookie('MindMateToken');
      
      // Use the correct API endpoint: /api/mentor/learners/:id
      const response = await api.get(`/api/mentor/learners/${id}`, {
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log('Learner details API Response:', response.data);
      
      const data = response.data;
      
      // Map the API response to your UserInfo interface
      // Adjust these mappings based on the actual API response structure
      setUserInfo({
        name: data.name || '',
        year: data.yearLevel || '',
        course: data.program || '',
        gender: data.sex || '',
        phoneNum: data.phoneNumber || '',
        email: data.email || '',
        address: data.address || '',
        bio: data.bio || '',
        subjects: data.subjects || [],
        learn_modality: data.modality || '',
        learn_sty: data.style || [],
        availability: data.availability || [],
        prefSessDur: data.sessionDur || '',
        goals: data.goals || '',
        image: data.image || '',
        id: data._id || data.id || ''
      });

      // Set image URL
      setImageUrl(data.image || '');

      // Prepare data for offer component
      const offerData = [
        data._id || data.id || '', // learner ID
        userId, // userId (same as learner ID in this case)
        data.name || '', // userName
        data.yearLevel || '', // userYear
        data.program || '', // userCourse
        data.sessionDur || '', // userSessionDur
        data.modality || '', // userModality
        data.style || [], // userLearnStyle
        data.availability || [], // userAvailability
        data.modality || '', // userLearnModality (duplicate)
        data.image || '', // userProfilePic
        data.subjects || [], // userSubjects
      ];
      
      setUserDeetsForOffer(offerData);
      
    } catch (error) {
      console.error("Error fetching learner details:", error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        console.error("Learner not found");
      } else if (error.response?.status === 403) {
        console.error("Not authorized to view this learner");
      }
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
      <div className={styles.viewLoadingContainer}>
        <div className={styles.viewSpinner}></div>
        <p>Loading learner details...</p>
      </div>
    );
  }

  return (
    <div className={styles.viewModalOverlay}>
      <div className={styles.viewWrapper}>
        {/* Sticky Modal Header - Title left, close button right */}
        <div className={`${styles.viewUpperElement} ${styles.viewStickyHeader}`}>
          <h3 className={styles.viewModalTitle}>
            <i className={`fas fa-user-graduate ${styles.viewModalTitleIcon}`}></i>
            Learner Profile
          </h3>
          <button 
            className={styles.viewCloseBtn} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.viewLowerElement}>
          {/* Learner Profile Section */}
          <div className={styles.viewLowerUpper}>
            <div className={styles.viewProfileImageContainer}>
              <img
                src={imageUrl || userInfo.image || 'https://placehold.co/600x400'}
                alt="Profile Image"
                className={styles.viewProfileImage}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400';
                }}
              />
            </div>

            <div className={styles.viewProfileInformation}>
              <h4 className={styles.viewApplicantName}>{userInfo.name}</h4>
              <hr className={styles.viewDivider} />
              <div className={styles.viewInfoGrid}>
                <div className={styles.viewInfoItem}>
                  <span className={styles.viewInfoLabel}>
                    <i className="fas fa-venus-mars"></i> Sex at Birth
                  </span>
                  <span className={styles.viewInfoValue}>
                    {capitalizeFirstLetter(userInfo.gender) || "N/A"}
                  </span>
                </div>
                <div className={styles.viewInfoItem}>
                  <span className={styles.viewInfoLabel}>
                    <i className="fas fa-calendar-alt"></i> Year
                  </span>
                  <span className={styles.viewInfoValue}>{userInfo.year || "N/A"}</span>
                </div>
                <div className={styles.viewInfoItem}>
                  <span className={styles.viewInfoLabel}>
                    <i className="fas fa-graduation-cap"></i> Program
                  </span>
                  <span className={styles.viewInfoValue}>{userInfo.course || "N/A"}</span>
                </div>
                <div className={styles.viewInfoItem}>
                  <span className={styles.viewInfoLabel}>
                    <i className="fas fa-phone"></i> Contact
                  </span>
                  <span className={styles.viewInfoValue}>{userInfo.phoneNum || "N/A"}</span>
                </div>
                <div className={styles.viewInfoItem}>
                  <span className={styles.viewInfoLabel}>
                    <i className="fas fa-envelope"></i> Email
                  </span>
                  <span className={styles.viewInfoValue}>{userInfo.email || "N/A"}</span>
                </div>
                <div className={styles.viewInfoItem}>
                  <span className={styles.viewInfoLabel}>
                    <i className="fas fa-map-marker-alt"></i> Address
                  </span>
                  <span className={styles.viewInfoValue}>{userInfo.address || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.viewLowerLower}>
            <div className={styles.viewDetailsSection}>
              <div className={styles.viewDetailsCard}>
                <h4 className={styles.viewSectionTitle}>
                  <i className="fas fa-book-open"></i> Learning Preferences
                </h4>
                <hr className={styles.viewDivider2} />
                <div className={styles.viewDetailsContent}>
                  <div className={styles.viewDetailItem}>
                    <span className={styles.viewDetailLabel}>Subjects of Interest:</span>
                    <span className={`${styles.viewDetailValue} ${styles.viewWrapText}`}>
                      {parseArrayString(userInfo.subjects) || "N/A"}
                    </span>
                  </div>
                  <div className={styles.viewDetailItem}>
                    <span className={styles.viewDetailLabel}>Learning Modality:</span>
                    <span className={styles.viewDetailValue}>
                      {userInfo.learn_modality || "N/A"}
                    </span>
                  </div>
                  <div className={styles.viewDetailItem}>
                    <span className={styles.viewDetailLabel}>Learning Style:</span>
                    <span className={styles.viewDetailValue}>
                      {parseArrayString(userInfo.learn_sty) || "N/A"}
                    </span>
                  </div>
                  <div className={styles.viewDetailItem}>
                    <span className={styles.viewDetailLabel}>Availability:</span>
                    <span className={`${styles.viewDetailValue} ${styles.viewAvailabilityText}`}>
                      {parseArrayString(userInfo.availability) || "N/A"}
                    </span>
                  </div>
                  <div className={styles.viewDetailItem}>
                    <span className={styles.viewDetailLabel}>Preferred Session Duration:</span>
                    <span className={styles.viewDetailValue}>
                      {userInfo.prefSessDur || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.viewBioCard}>
                <h4 className={styles.viewSectionTitle}>
                  <i className="fas fa-user-edit"></i> Bio & Goals
                </h4>
                <hr className={styles.viewDivider2} />
                <div className={styles.viewBioContent}>
                  <div className={styles.viewDetailItem2}>
                    <span className={styles.viewDetailLabel}>Bio:</span>
                    <span className={`${styles.viewDetailValue2} ${styles.viewWrapText}`}>
                      {userInfo.bio || "No bio provided"}
                    </span>
                  </div>
                  <div className={styles.viewDetailItem2}>
                    <span className={styles.viewDetailLabel}>Academic Goals:</span>
                    <span className={`${styles.viewDetailValue2} ${styles.viewWrapText}`}>
                      {userInfo.goals || "No goals provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.viewActionButton}>
              <div className={styles.viewButtonGroup}>
                <button 
                  className={styles.viewCloseBtnNew} 
                  onClick={onClose}
                >
                  Close
                </button>
                <button 
                  className={styles.viewSendOfferBtn} 
                  onClick={() => setShowConfirmationModal(true)}
                >
                  <i className="fas fa-paper-plane"></i> Send Offer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className={styles.viewConfirmationModalOverlay}>
            <div className={styles.viewConfirmationModal}>
              <h3>Confirm Offer</h3>
              <hr className={styles.viewDivider2} />
              <p>Are you sure you want to send a mentoring offer to {userInfo.name}?</p>
              <div className={styles.viewModalActions}>
                <button
                  className={`${styles.viewModalBtn} ${styles.viewModalBtnCancel}`}
                  onClick={() => setShowConfirmationModal(false)}
                >
                  Cancel
                </button>
                <button className={`${styles.viewModalBtn} ${styles.viewModalBtnConfirm}`} onClick={confirmSendOffer}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offer Modal - This will appear when showOffer is true */}
        {showOffer && (
          <div className={styles.viewPopupOverlay}>
            <Offer
              info={userDeetsForOffer}
              mentorId={mentorData.user?.id}
              onClose={() => setShowOffer(false)}
              onConfirm={handleOfferConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
}