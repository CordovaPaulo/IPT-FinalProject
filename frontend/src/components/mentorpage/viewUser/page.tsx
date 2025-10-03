// src/components/mentorpage/viewUser/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Offer from '../offer/page';
import styles from './view.module.css';

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
      <div className={styles.viewLoadingContainer}>
        <div className={styles.viewSpinner}></div>
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
        </div>

        {/* Modal Body */}
        <div className={styles.viewLowerElement}>
          {/* Learner Profile Section */}
          <div className={styles.viewLowerUpper}>
            <div className={styles.viewProfileImageContainer}>
              <img
                src={imageUrl || 'https://placehold.co/600x400'}
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