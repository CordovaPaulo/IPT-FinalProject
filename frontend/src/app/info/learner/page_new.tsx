'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import styles from './LearnerInfo.module.css';
import api from "@/lib/axios";

// Interfaces
interface DropdownOpenState {
  modality: boolean;
  availability: boolean;
  learningStyle: boolean;
  sessionDuration: boolean;
}

interface ValidationErrors {
  selectedSubjects?: string;
  bio?: string;
  goals?: string;
  [key: string]: string | undefined;
}

interface UserData {
  program: string;
  yearLevel: string;
  phoneNumber: string;
  sex: string;
  address: string;
}

// Constants
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const sessionStyles = [
  'Lecture-Based',
  'Interactive Discussion (hands-on)',
  'Q&A Session',
  'Demonstration',
  'Project-based',
  'Step-by-step process'
];
const modalityOptions = ['Online', 'In-person', 'Hybrid'];

const validationRules = {
  bio: {
    minLength: 50,
    maxLength: 500,
    message: 'Bio should be between 50-500 characters'
  },
  goals: {
    minLength: 50,
    maxLength: 500,
    message: 'Goals should be between 50-500 characters'
  }
};

const LearnerInfo = () => {
  const router = useRouter();
  
  // success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form data state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [modality, setModality] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [selectedSessionStyles, setSelectedSessionStyles] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState('');
  const [goals, setGoals] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profilePictureName, setProfilePictureName] = useState('');
  
  // UI state
  const [dropdownOpen, setDropdownOpen] = useState<DropdownOpenState>({
    modality: false,
    availability: false,
    learningStyle: false,
    sessionDuration: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  
  // Subjects state
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const modalityRef = useRef<HTMLDivElement>(null);
  const sessionDurationRef = useRef<HTMLDivElement>(null);
  const learningStyleRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const goalsRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  // Computed values
  const availabilityDaysDisplay = selectedDays.join(', ') || 'Select available days';
  const learningStyleDisplay = selectedSessionStyles.join(', ') || 'Select learning style(s)';

  // Helper to get cookie value
  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // Fetch user data from backend (which fetches from Supabase)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getCookie('MindMateToken');
        const response = await api.get('/api/auth/check', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (response.data.authenticated && response.data.user) {
          // The backend should provide program, yearLevel, sex, address, phoneNumber
          // For now, we'll need to add an endpoint or extend check-auth to return this
          // Let's assume we get this data from the response
          const user = response.data.user;
          
          // Fetch from a dedicated endpoint that gets Supabase data
          const supabaseDataResponse = await api.get('/api/auth/user/personal-info', {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          
          if (supabaseDataResponse.data) {
            const personalInfo = supabaseDataResponse.data;
            setUserData({
              program: personalInfo.program || '',
              yearLevel: personalInfo.yearLevel || '',
              phoneNumber: personalInfo.phoneNumber || '',
              sex: personalInfo.sex || '',
              address: personalInfo.address || ''
            });
            
            // Set available subjects based on program
            updateAvailableSubjects(personalInfo.program);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Unable to fetch your personal information. Please try again.');
        router.push('/auth/signup');
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  const updateAvailableSubjects = (program: string) => {
    switch (program) {
      case 'BSIT':
        setAvailableSubjects([
          'Web and Mobile Application Development',
          'Network Administration and Security Management',
          'Data Science and Software Design',
          'Service Management for Business Process Outsourcing',
          'Business Analytics',
          'Cloud Computing'
        ]);
        break;

      case 'BSCS':
        setAvailableSubjects([
          'Software Engineering',
          'Artificial Intelligence and Machine Learning',
          'Data Science',
          'Cloud Computing',
          'Cybersecurity'
        ]);
        break;

      case 'BSEMC':
        setAvailableSubjects([
          'Game Development',
          'Digital Animation Technology',
          'Interactive Media and Web Development',
          'Virtual Reality and Augmented Reality',
          'Multimedia Design'
        ]);
        break;

      default:
        setAvailableSubjects([]);
    }
  };

  // Helper functions
  const toggleDropdown = (type: keyof DropdownOpenState) => {
    setDropdownOpen(prev => {
      const newState: DropdownOpenState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key as keyof DropdownOpenState] = key === type ? !prev[key as keyof DropdownOpenState] : false;
      });
      return newState;
    });
    
    if (type !== 'availability' && type !== 'learningStyle') {
      setShowSubjectsDropdown(false);
    }
  };
  
  const toggleSubjectDropdown = () => {
    setShowSubjectsDropdown(!showSubjectsDropdown);
    
    setDropdownOpen({
      modality: false,
      availability: false,
      learningStyle: false,
      sessionDuration: false
    });
  };
  
  const validateField = (field: string, value: string) => {
    const rules = validationRules[field as keyof typeof validationRules];
    if (!rules) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    if ('minLength' in rules && rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = rules.message;
    }
    
    if ('maxLength' in rules && rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = rules.message;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: isValid ? '' : errorMessage
    }));
    
    return isValid;
  };
  
  const validateForm = () => {
    const errors: ValidationErrors = {};
    
    if (selectedSubjects.length === 0) errors.selectedSubjects = 'At least one subject is required';
    if (!bio.trim()) errors.bio = 'Short Bio is required';
    if (!goals.trim()) errors.goals = 'Learning goals is required';
    if (!profileImage) errors.profileImage = 'Profile Picture is required';
    if (!modality) errors.modality = 'Learning modality is required';
    if (selectedDays.length === 0) errors.availability = 'At least one available day is required';
    if (selectedSessionStyles.length === 0) errors.learningStyle = 'At least one learning style is required';
    if (!sessionDuration) errors.sessionDuration = 'Session duration is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // File handling functions
  const uploadProfilePicture = () => {
    profileInputRef.current?.click();
  };
  
  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > (5 * 1024 * 1024)) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setProfilePictureName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitLearnerInfo = async () => {
    if (!validateForm()) {
      alert('Please complete all required fields before submitting');
      return;
    }

    if (!userData) {
      alert('User data not loaded. Please refresh and try again.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      
      const mapModality = (modality: string) => {
        const modalityMap: { [key: string]: string } = {
          'Online': 'online',
          'In-person': 'in-person',
          'Hybrid': 'hybrid'
        };
        return modalityMap[modality] || modality.toLowerCase();
      };

      const mapSessionDuration = (duration: string) => {
        const durationMap: { [key: string]: string } = {
          '1 hour': '1hr',
          '2 hours': '2hrs',
          '3 hours': '3hrs'
        };
        return durationMap[duration] || duration;
      };

      const mapAvailability = (days: string[]) => {
        return days.map(day => day.toLowerCase());
      };

      const mapLearningStyle = (styles: string[]) => {
        const styleMap: { [key: string]: string } = {
          'Lecture-Based': 'lecture-based',
          'Interactive Discussion (hands-on)': 'interactive-discussion',
          'Q&A Session': 'q-and-a-discussion',
          'Demonstration': 'demonstrations',
          'Project-based': 'project-based',
          'Step-by-step process': 'step-by-step-discussion'
        };
        return styles.map(style => styleMap[style] || style.toLowerCase().replace(/\s+/g, '-'));
      };

      // Note: Backend will fetch program, yearLevel, phoneNumber, sex, address from Supabase
      // We only send preferences here
      formData.append('bio', bio);
      formData.append('goals', goals || 'To improve my academic performance');
      formData.append('modality', mapModality(modality));
      formData.append('sessionDur', mapSessionDuration(sessionDuration));
      
      formData.append('specialization', JSON.stringify(selectedSubjects));
      formData.append('availability', JSON.stringify(mapAvailability(selectedDays)));
      formData.append('style', JSON.stringify(mapLearningStyle(selectedSessionStyles)));
      
      if (profileInputRef.current?.files?.[0]) {
        formData.append('image', profileInputRef.current.files[0]);
      }

      const token = getCookie('MindMateToken');

      const response = await api.post('/api/auth/learner/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log('Learner signup successful:', response.data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Learner signup error:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsButtonActive(false);
    }
  };

  const handleCheckboxKeyNavigation = (e: React.KeyboardEvent, 
    type: 'day' | 'style' | 'subject', 
    value: string, 
    currentState: string[], 
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentState.includes(value)) {
        setState(currentState.filter(item => item !== value));
      } else {
        setState([...currentState, value]);
      }
    }
  };

  const handleDropdownKeyNavigation = (e: React.KeyboardEvent, dropdownType: keyof DropdownOpenState) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(dropdownType);
    } else if (e.key === 'Escape' && dropdownOpen[dropdownType]) {
      e.preventDefault();
      setDropdownOpen(prev => ({ ...prev, [dropdownType]: false }));
    }
  };

  const handleSubjectsKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!showSubjectsDropdown) {
        toggleSubjectDropdown();
      }
    } else if (e.key === 'Escape' && showSubjectsDropdown) {
      e.preventDefault();
      setShowSubjectsDropdown(false);
    }
  };

  if (isLoadingUserData) {
    return (
      <div className={`${styles.root} ${styles['learnerinfo-container']}`}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading your information...</h2>
          <div className={styles['loading-spinner']}></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={`${styles.root} ${styles['learnerinfo-container']}`}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Unable to load user data</h2>
          <button onClick={() => router.push('/auth/signup')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles['learnerinfo-container']}`}>
      <Head>
        <title>Learner Information</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </Head>

      <button 
        ref={backButtonRef}
        onClick={() => router.push('/auth/signup')} 
        className={styles['back-btn']}
        tabIndex={0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd"/>
        </svg>
        Back
      </button>

      <header className={styles['page-header']}>
        <h1>LEARNER PREFERENCES</h1>
        <p>Complete your learning preferences to start your journey.</p>
        <p className={styles['info-text']}>
          Program: <strong>{userData.program}</strong> | Year Level: <strong>{userData.yearLevel}</strong>
        </p>
      </header>

      <div className={`${styles['form-container']} ${styles['scrollable-content']}`}>
        <div>
          <h2 className={styles.title}>PROFILE INFORMATION</h2>

          <div className={styles['upload-container']}>
            <div className={styles['profile-picture-upload']}>
              <label className={styles['profile-label']}>PROFILE PICTURE</label>
              <div 
                ref={profileUploadRef}
                className={styles['upload-controls']} 
                onClick={uploadProfilePicture}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    uploadProfilePicture();
                  }
                }}
              >
                <div className={styles['profile-preview-container']}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile Preview" className={styles['profile-preview']} />
                  ) : (
                    <i className="fas fa-user-circle default-icon"></i>
                  )}
                </div>
                <div className={styles['upload-text']}>
                  <div className={styles['choose-file-container']}>
                    <i className="fas fa-upload"></i>
                    <span>Choose File</span>
                  </div>
                  <input type="file" ref={profileInputRef} accept="image/*" disabled={isSubmitting} className={styles['hidden-input']} onChange={handleProfileUpload} aria-label="Upload profile picture" />
                  <span className={styles['file-name']}>
                    {profilePictureName || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="availability-days">DAYS OF AVAILABILITY</label>
            <div 
              ref={availabilityRef}
              className={styles['availability-dropdown']}
              tabIndex={0}
              onKeyDown={(e) => handleDropdownKeyNavigation(e, 'availability')}
            >
              <div className={styles['dropdown-container']} onClick={(e) => { e.stopPropagation(); toggleDropdown('availability'); }}>
                <input
                  type="text"
                  id="availability-days"
                  value={availabilityDaysDisplay}
                  placeholder="Select available days"
                  disabled={isSubmitting}
                  className={styles['profile-input']}
                  readOnly
                  tabIndex={-1}
                />
                <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
              </div>
              {dropdownOpen.availability && (
                <div className={`${styles['dropdown-options']} ${styles['availability-options']}`}>
                  {daysOfWeek.map((day) => {
                    const optionId = `day-${day}`;
                    const isSelected = selectedDays.includes(day);
                    return (
                      <div
                        key={day}
                        className={`${styles['dropdown-option']} ${styles['availability-option']}`}
                      >
                        <input
                          type="checkbox"
                          id={optionId}
                          disabled={isSubmitting}
                          checked={selectedDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDays([...selectedDays, day]);
                            } else {
                              setSelectedDays(selectedDays.filter(d => d !== day));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          tabIndex={0}
                          onKeyDown={(e) => handleCheckboxKeyNavigation(e, 'day', day, selectedDays, setSelectedDays)}
                        />
                        <label htmlFor={optionId}>{day}</label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {validationErrors.availability && (
              <span className={styles['validation-message']}>
                {validationErrors.availability}
              </span>
            )}
          </div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`}>SPECIALIZATION</label>
            <div ref={subjectsRef} className={styles['dropdown-wrapper']} tabIndex={0} onKeyDown={handleSubjectsKeyNavigation}>
              <div className={styles['dropdown-trigger']} onClick={(e) => { e.stopPropagation(); toggleSubjectDropdown(); }}>
                <input
                  type="text"
                  placeholder={
                    selectedSubjects.length
                      ? `${selectedSubjects.length} subjects selected`
                      : 'Select subjects'
                  }
                  readOnly
                  disabled={isSubmitting}
                  className={`${styles['profile-input']} ${validationErrors.selectedSubjects ? styles.error : ''}`}
                  tabIndex={-1}
                />
                <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
              </div>

              {showSubjectsDropdown && (
                <div className={`${styles['dropdown-menu']} ${styles.subjects}`}>
                  {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => (
                      <div key={subject} className={`${styles['dropdown-item']} ${styles['subject-item']}`}>
                        <input
                          type="checkbox"
                          id={subject}
                          disabled={isSubmitting}
                          checked={selectedSubjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects([...selectedSubjects, subject]);
                            } else {
                              setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                            }
                          }}
                          tabIndex={0}
                          onKeyDown={(e) => handleCheckboxKeyNavigation(e, 'subject', subject, selectedSubjects, setSelectedSubjects)}
                        />
                        <label htmlFor={subject}>{subject}</label>
                      </div>
                    ))
                  ) : (
                    <div className={`${styles['dropdown-item']} ${styles['no-subjects']}`}>
                      No subjects available for your program
                    </div>
                  )}
                </div>
              )}
            </div>
            {validationErrors.selectedSubjects && (
              <span className={styles['validation-message']}>
                {validationErrors.selectedSubjects}
              </span>
            )}
          </div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="modality">LEARNING MODALITY</label>
            <div 
              ref={modalityRef}
              className={styles['subjmodality-dropdown']}
              tabIndex={0}
              onKeyDown={(e) => handleDropdownKeyNavigation(e, 'modality')}
            >
              <div className={styles['dropdown-container']} onClick={(e) => { e.stopPropagation(); toggleDropdown('modality'); }}>
                <input
                  type="text"
                  value={modality}
                  disabled={isSubmitting}
                  placeholder="Select learning modality"
                  className={styles['profile-input']}
                  readOnly
                  tabIndex={-1}
                />
                <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
              </div>
              {dropdownOpen.modality && (
                <div className={styles['dropdown-options']}>
                  <div 
                    className={styles['dropdown-option']} 
                    onClick={() => {
                      setModality('Online');
                      setDropdownOpen({ ...dropdownOpen, modality: false });
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setModality('Online');
                        setDropdownOpen({ ...dropdownOpen, modality: false });
                      }
                    }}
                  >
                    Online
                  </div>
                  <div 
                    className={styles['dropdown-option']} 
                    onClick={() => {
                      setModality('In-person');
                      setDropdownOpen({ ...dropdownOpen, modality: false });
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setModality('In-person');
                        setDropdownOpen({ ...dropdownOpen, modality: false });
                      }
                    }}
                  >
                    In-person
                  </div>
                  <div 
                    className={styles['dropdown-option']} 
                    onClick={() => {
                      setModality('Hybrid');
                      setDropdownOpen({ ...dropdownOpen, modality: false });
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setModality('Hybrid');
                        setDropdownOpen({ ...dropdownOpen, modality: false });
                      }
                    }}
                  >
                    Hybrid
                  </div>
                </div>
              )}
            </div>
            {validationErrors.modality && (
              <span className={styles['validation-message']}>
                {validationErrors.modality}
              </span>
            )}
          </div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="session-duration">PREFERRED SESSION DURATION</label>
            <div 
              ref={sessionDurationRef}
              className={styles['session-duration-dropdown']}
              tabIndex={0}
              onKeyDown={(e) => handleDropdownKeyNavigation(e, 'sessionDuration')}
            >
              <div className={styles['dropdown-container']} onClick={(e) => { e.stopPropagation(); toggleDropdown('sessionDuration'); }}>
                <input
                  type="text"
                  value={sessionDuration}
                  disabled={isSubmitting}
                  placeholder="Select duration"
                  className={styles['profile-input']}
                  readOnly
                  tabIndex={-1}
                />
                <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
              </div>
              {dropdownOpen.sessionDuration && (
                <div className={styles['dropdown-options']}>
                  <div 
                    className={styles['dropdown-option']} 
                    onClick={() => {
                      setSessionDuration('1 hour');
                      setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSessionDuration('1 hour');
                        setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                      }
                    }}
                  >
                    1 hour
                  </div>
                  <div 
                    className={styles['dropdown-option']} 
                    onClick={() => {
                      setSessionDuration('2 hours');
                      setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSessionDuration('2 hours');
                        setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                      }
                    }}
                  >
                    2 hours
                  </div>
                  <div 
                    className={styles['dropdown-option']} 
                    onClick={() => {
                      setSessionDuration('3 hours');
                      setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSessionDuration('3 hours');
                        setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                      }
                    }}
                  >
                    3 hours
                  </div>
                </div>
              )}
            </div>
            {validationErrors.sessionDuration && (
              <span className={styles['validation-message']}>
                {validationErrors.sessionDuration}
              </span>
            )}
          </div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="learning-style">LEARNING STYLE</label>
            <div 
              ref={learningStyleRef}
              className={styles['learning-style-dropdown']}
              tabIndex={0}
              onKeyDown={(e) => handleDropdownKeyNavigation(e, 'learningStyle')}
            >
              <div className={styles['dropdown-container']} onClick={(e) => { e.stopPropagation(); toggleDropdown('learningStyle'); }}>
                <input
                  type="text"
                  id="learning-style"
                  value={learningStyleDisplay}
                  disabled={isSubmitting}
                  placeholder="Select learning style(s)"
                  className={styles['profile-input']}
                  readOnly
                  tabIndex={-1}
                />
                <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
              </div>
              {dropdownOpen.learningStyle && (
                <div className={styles['dropdown-options']}>
                  {sessionStyles.map(style => (
                    <div key={style} className={styles['dropdown-option']}>
                      <input
                        type="checkbox"
                        id={`style-${style}`}
                        checked={selectedSessionStyles.includes(style)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSessionStyles([...selectedSessionStyles, style]);
                          } else {
                            setSelectedSessionStyles(selectedSessionStyles.filter(s => s !== style));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        tabIndex={0}
                        onKeyDown={(e) => handleCheckboxKeyNavigation(e, 'style', style, selectedSessionStyles, setSelectedSessionStyles)}
                      />
                      <label htmlFor={`style-${style}`}>{style}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.learningStyle && (
              <span className={styles['validation-message']}>
                {validationErrors.learningStyle}
              </span>
            )}
          </div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="bio">SHORT BIO</label>
            <textarea
              ref={bioRef}
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                validateField('bio', e.target.value);
              }}
              onBlur={() => validateField('bio', bio)}
              disabled={isSubmitting}
              placeholder="Tell us about yourself (50-500 characters)"
              rows={4}
              className={`${styles['profile-textarea']} ${validationErrors.bio ? styles.error : ''}`}
              tabIndex={0}
            ></textarea>
            {validationErrors.bio && (
              <span className={styles['validation-message']}>
                {validationErrors.bio}
              </span>
            )}
          </div>

          <div className={styles['profile-field']}>
            <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="goals">LEARNING GOALS</label>
            <textarea
              ref={goalsRef}
              id="goals"
              value={goals}
              onChange={(e) => {
                setGoals(e.target.value);
                validateField('goals', e.target.value);
              }}
              onBlur={() => validateField('goals', goals)}
              disabled={isSubmitting}
              placeholder="Describe your learning goals (50-500 characters)"
              rows={4}
              className={`${styles['profile-textarea']} ${validationErrors.goals ? styles.error : ''}`}
              tabIndex={0}
            ></textarea>
            {validationErrors.goals && (
              <span className={styles['validation-message']}>
                {validationErrors.goals}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles['next-button-container']}>
        <button
          ref={submitButtonRef}
          className={`${styles['next-button']} ${isSubmitting ? styles.loading : ''} ${isButtonActive ? styles.active : ''}`}
          onClick={submitLearnerInfo}
          onMouseDown={() => !isSubmitting && setIsButtonActive(true)}
          onMouseUp={() => setIsButtonActive(false)}
          onMouseLeave={() => setIsButtonActive(false)}
          disabled={isSubmitting}
          tabIndex={0}
        >
          {isSubmitting ? (
            <span className={styles['loading-spinner']}></span>
          ) : (
            'SUBMIT'
          )}
        </button>
      </div>

      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Registration successful"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 8,
              width: '90%',
              maxWidth: 480,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            <h2 style={{ marginTop: 0, color: '#000' }}>Registration Successful</h2>
            <p style={{ color: '#000' }}>Please verify your account via the link we just sent to your email. You will be redirected to the login page after closing this message.</p>
            <div style={{ marginTop: 18 }}>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.replace('/auth/login');
                }}
                style={{
                  padding: '10px 18px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerInfo;
