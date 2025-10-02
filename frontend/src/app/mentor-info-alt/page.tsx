'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import './MentorInfoalt.css';
import api from "@/lib/axios";

interface DropdownOpenState {
  gender: boolean;
  yearLevel: boolean;
  program: boolean;
  modality: boolean;
  proficiency: boolean;
  availability: boolean;
  learningStyle: boolean;
  sessionDuration: boolean;
}

interface ValidationErrors {
  address?: string;
  contactNumber?: string;
  gender?: string;
  selectedSubjects?: string;
  bio?: string;
  experience?: string;
  [key: string]: string | undefined;
}

interface Category {
  type: string;
  name: string;
}

interface AvailableSubjects {
  coreSubjects: string[];
  gecSubjects: string[];
  peNstpSubjects: string[];
}

interface CredentialFile extends File {
  // We can extend File if needed
}

const MentorInfo = () => {
  const router = useRouter();
  
  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  // Form data
  const [gender, setGender] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [program, setProgram] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [modality, setModality] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [proficiency, setProficiency] = useState('');
  const [selectedSessionStyles, setSelectedSessionStyles] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState('');
  const [experience, setExperience] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profilePictureName, setProfilePictureName] = useState('');
  const [credentials, setCredentials] = useState<CredentialFile[]>([]);
  
  // UI state
  const [dropdownOpen, setDropdownOpen] = useState<DropdownOpenState>({
    gender: false,
    yearLevel: false,
    program: false,
    modality: false,
    proficiency: false,
    availability: false,
    learningStyle: false,
    sessionDuration: false
  });
  
  const [showFileList, setShowFileList] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Dropdown options
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sessionStyles = [
    'Lecture-Based',
    'Interactive Discussion (hands-on)',
    'Q&A Session',
    'Demonstration',
    'Project-based',
    'Step-by-step process'
  ];
  
  const programs = [
    'Bachelor of Science in Information Technology (BSIT)',
    'Bachelor of Science in Computer Science (BSCS)',
    'Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)'
  ];
  
  const categories: Category[] = [
    { type: 'core', name: 'Core Subjects' },
    { type: 'gec', name: 'General Education Course' },
    { type: 'peNstp', name: 'Physical Education & NSTP' }
  ];
  
  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubjects>({
    coreSubjects: [],
    gecSubjects: [],
    peNstpSubjects: []
  });
  
  const [showCategories, setShowCategories] = useState(false);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  const [currentSubjects, setCurrentSubjects] = useState<string[]>([]);
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState('');
  const [selectedSubjectsCount, setSelectedSubjectsCount] = useState({
    core: 0,
    gec: 0,
    peNstp: 0
  });
  
  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const credentialInputRef = useRef<HTMLInputElement>(null);
  
  // Computed values
  const availabilityDaysDisplay = selectedDays.join(', ') || 'Select available days';
  const learningStyleDisplay = selectedSessionStyles.join(', ') || 'Select teaching style(s)';
  
  // Validation rules
  const validationRules = {
    address: {
      minLength: 10,
      message: 'Address should be at least 10 characters long'
    },
    contactNumber: {
      pattern: /^09\d{9}$/,
      message: 'Contact number should start with 09 and have 11 digits'
    },
    bio: {
      minLength: 50,
      maxLength: 500,
      message: 'Bio should be between 50-500 characters'
    },
    experience: {
      minLength: 50,
      maxLength: 500,
      message: 'Experience should be between 50-500 characters'
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
  };
  
  const validateField = (field: string, value: string) => {
    const rules = validationRules[field as keyof typeof validationRules];
    if (!rules) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = rules.message;
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = rules.message;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
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
    
    if (currentStep === 1) {
      if (!gender) errors.gender = 'Gender is required';
      if (!contactNumber || contactNumber.length !== 11) errors.contactNumber = 'Valid Contact Number is required (11 digits)';
      if (!address.trim()) errors.address = 'Address is required';
    }
    
    if (currentStep === 2) {
      if (selectedSubjects.length === 0) errors.selectedSubjects = 'At least one subject is required';
      if (!bio.trim()) errors.bio = 'Short Bio is required';
      if (!experience.trim()) errors.experience = 'Tutoring experience is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const nextStep = () => {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      alert('Please complete all required fields before proceeding');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      submitApplication();
    }
  };
  
  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };
  
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
      
      if (file.size > 2000000) {
        alert('File size should be less than 2MB');
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
  
  const uploadCredentials = () => {
    credentialInputRef.current?.click();
  };
  
  const handleCredentialUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setCredentials(prev => [...prev, ...files as CredentialFile[]]);
  };
  
  const deleteCredential = (index: number) => {
    setCredentials(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleFileList = () => {
    setShowFileList(!showFileList);
  };
  
  const closeFileList = () => {
    setShowFileList(false);
  };
  
  const updateAvailableSubjects = () => {
    // This would be populated based on the selected program
    // For brevity, I'm leaving the implementation similar to the Vue version
    switch (program) {
      case 'Bachelor of Science in Information Technology (BSIT)':
        setAvailableSubjects({
          coreSubjects: [
            'Application Development and Emerging Technologies',
            'Business Analytics',
            // ... other subjects
          ],
          gecSubjects: [
            'Art Appreciation',
            'Ethics',
            // ... other subjects
          ],
          peNstpSubjects: [
            'National Service Training Program with Anti-Smoking and Environmental Education',
            // ... other subjects
          ]
        });
        break;
      // Other cases...
      default:
        setAvailableSubjects({
          coreSubjects: [],
          gecSubjects: [],
          peNstpSubjects: []
        });
    }
  };
  
  const toggleSubjectDropdown = () => {
    setShowCategories(!showCategories);
    setShowSubjectsDropdown(false);
  };
  
  const selectCategory = (category: Category) => {
    setSelectedSubjectCategory(category.name);
    setShowCategories(false);
    showSubjects(category.type);
    updateSelectedCounts();
  };
  
  const showSubjects = (categoryType: string) => {
    switch (categoryType) {
      case 'core':
        setCurrentSubjects(availableSubjects.coreSubjects);
        break;
      case 'gec':
        setCurrentSubjects(availableSubjects.gecSubjects);
        break;
      case 'peNstp':
        setCurrentSubjects(availableSubjects.peNstpSubjects);
        break;
    }
    setShowSubjectsDropdown(true);
  };
  
  const updateSelectedCounts = () => {
    setSelectedSubjectsCount({
      core: selectedSubjects.filter(sub => availableSubjects.coreSubjects.includes(sub)).length,
      gec: selectedSubjects.filter(sub => availableSubjects.gecSubjects.includes(sub)).length,
      peNstp: selectedSubjects.filter(sub => availableSubjects.peNstpSubjects.includes(sub)).length
    });
  };
  
  const submitApplication = async () => {
    if (!validateForm()) {
      alert('Please complete all required fields before submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();

      // Map dropdown values to backend enums
      const mapProgram = (program: string) => {
        const programMap: { [key: string]: string } = {
          'Bachelor of Science in Information Technology (BSIT)': 'BSIT',
          'Bachelor of Science in Computer Science (BSCS)': 'BSCS',
          'Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)': 'BSEMC'
        };
        return programMap[program] || program;
      };

      const mapYearLevel = (yearLevel: string) => {
        const yearMap: { [key: string]: string } = {
          '1st Year': '1st year',
          '2nd Year': '2nd year',
          '3rd Year': '3rd year',
          '4th Year': '4th year',
          'Graduate': 'graduate'
        };
        return yearMap[yearLevel] || yearLevel.toLowerCase();
      };

      const mapModality = (modality: string) => {
        const modalityMap: { [key: string]: string } = {
          'Online': 'online',
          'Offline': 'offline',
          'Mixed': 'mixed'
        };
        return modalityMap[modality] || modality.toLowerCase();
      };

      const mapProficiency = (proficiency: string) => {
        const profMap: { [key: string]: string } = {
          'Beginner': 'beginner',
          'Intermediate': 'intermediate',
          'Advanced': 'advanced'
        };
        return profMap[proficiency] || proficiency.toLowerCase();
      };

      const mapSessionDuration = (duration: string) => {
        const durationMap: { [key: string]: string } = {
          '1 hour': '1hr',
          '2 hours': '2hrs',
          '3 hours': '3hrs'
        };
        return durationMap[duration] || duration;
      };

      const mapAvailability = (days: string[]) => days.map(day => day.toLowerCase());
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

      // Append all required fields
      formData.append('sex', gender.toLowerCase());
      formData.append('program', mapProgram(program));
      formData.append('yearLevel', mapYearLevel(yearLevel));
      formData.append('phoneNumber', contactNumber);
      formData.append('bio', bio);
      formData.append('exp', experience); // experience field required
      formData.append('address', address);
      formData.append('modality', mapModality(modality));
      formData.append('proficiency', mapProficiency(proficiency));
      formData.append('sessionDur', mapSessionDuration(sessionDuration));
      formData.append('subjects', JSON.stringify(selectedSubjects));
      formData.append('availability', JSON.stringify(mapAvailability(selectedDays)));
      formData.append('style', JSON.stringify(mapLearningStyle(selectedSessionStyles)));

      // Add profile image if selected
      if (profileInputRef.current?.files?.[0]) {
        formData.append('image', profileInputRef.current.files[0]);
      }

      // Add credentials (multiple files)
      if (credentialsInputRef.current?.files) {
        Array.from(credentialsInputRef.current.files).forEach(file => {
          formData.append('credentials', file);
        });
      }

      // Get MindMateToken from cookie
      const token = getCookie('MindMateToken');

      // Send request to mentor signup endpoint with Authorization header
      const response = await api.post('/api/auth/mentor/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log('Mentor signup successful:', response.data);
      router.push('/mentor');
    } catch (error) {
      console.error('Mentor signup error:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsButtonActive(false);
    }
  };
  
  const proceedToHome = () => {
    // Clear cookies and localStorage
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    localStorage.clear();
    
    // Redirect to home or login
    router.push('/login');
  };
  
  const scrollToGetStarted = () => {
    // Implementation for scrolling to a specific section
    // This would depend on your page structure
  };
  
  // Effects
  useEffect(() => {
    updateAvailableSubjects();
  }, [program]);
  
  useEffect(() => {
    updateSelectedCounts();
  }, [selectedSubjects]);
  
  return (
    <div className="mentorinfo-container">
      <Head>
        <title>Mentor Information</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </Head>
      
      <button onClick={scrollToGetStarted} className="back-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      <header className="page-header">
        <h1>MENTOR INFO</h1>
        <p>Complete your profile to start mentoring.</p>
      </header>

      <div className="form-container scrollable-content">
        {/* Step 1 Content */}
        {currentStep === 1 && (
          <div>
            <h2 className="title">I. PERSONAL INFORMATION</h2>

            <div className="personal-field">
              <label className="personal-label required" htmlFor="address">ADDRESS</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  validateField('address', e.target.value);
                }}
                onBlur={() => validateField('address', address)}
                placeholder="Enter your address"
                disabled={isSubmitting}
                className={`personal-input ${validationErrors.address ? 'error' : ''}`}
              />
              {validationErrors.address && (
                <span className="validation-message">
                  {validationErrors.address}
                </span>
              )}
            </div>

            <div className="personal-field">
              <label className="personal-label required" htmlFor="contact-number">
                CONTACT NUMBER
              </label>
              <input
                type="text"
                id="contact-number"
                value={contactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setContactNumber(value.slice(0, 11));
                  validateField('contactNumber', value);
                }}
                onBlur={() => validateField('contactNumber', contactNumber)}
                placeholder="Enter your contact number (11 digits)"
                disabled={isSubmitting}
                className={`personal-input ${validationErrors.contactNumber ? 'error' : ''}`}
                maxLength={11}
              />
              {validationErrors.contactNumber && (
                <span className="validation-message">
                  {validationErrors.contactNumber}
                </span>
              )}
            </div>

            <div className="personal-field">
              <label className="personal-label required" htmlFor="gender">
                SEX AT BIRTH
              </label>
              <div className="gender-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('gender')}>
                  <input
                    type="text"
                    value={gender}
                    placeholder="Select your sex"
                    disabled={isSubmitting}
                    className="personal-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.gender && (
                  <div className="dropdown-options">
                    <div className="dropdown-option" onClick={() => {
                      setGender('Female');
                      setDropdownOpen({ ...dropdownOpen, gender: false });
                    }}>
                      Female
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setGender('Male');
                      setDropdownOpen({ ...dropdownOpen, gender: false });
                    }}>
                      Male
                    </div>
                  </div>
                )}
                {validationErrors.gender && (
                  <span className="validation-message">
                    {validationErrors.gender}
                  </span>
                )}
              </div>
            </div>

            <div className="personal-field">
              <label className="personal-label" htmlFor="year-level">YEAR LEVEL </label>
              <div className="year-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('yearLevel')}>
                  <input
                    type="text"
                    value={yearLevel}
                    placeholder="Select your year level"
                    disabled={isSubmitting}
                    className="personal-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.yearLevel && (
                  <div className="dropdown-options">
                    <div className="dropdown-option" onClick={() => {
                      setYearLevel('1st Year');
                      setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                    }}>
                      1st Year
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setYearLevel('2nd Year');
                      setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                    }}>
                      2nd Year
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setYearLevel('3rd Year');
                      setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                    }}>
                      3rd Year
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setYearLevel('4th Year');
                      setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                    }}>
                      4th Year
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="personal-field">
              <label className="personal-label" htmlFor="program">PROGRAM </label>
              <div className="program-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('program')}>
                  <input
                    type="text"
                    value={program}
                    placeholder="Select your program"
                    className="personal-input"
                    disabled={isSubmitting}
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.program && (
                  <div className="dropdown-options">
                    {programs.map(programOption => (
                      <div
                        key={programOption}
                        className="dropdown-option"
                        onClick={() => {
                          setProgram(programOption);
                          setDropdownOpen({ ...dropdownOpen, program: false });
                        }}
                      >
                        {programOption}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Content */}
        {currentStep === 2 && (
          <div>
            <h2 className="title">II. PROFILE INFORMATION</h2>

            {/* Profile Picture and Credentials Upload */}
            <div className="upload-container">
              <div className="profile-picture-upload">
                <label className="profile-label">PROFILE PICTURE</label>
                <div className="upload-controls" onClick={uploadProfilePicture}>
                  <div className="profile-preview-container">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile Preview"
                        className="profile-preview"
                      />
                    ) : (
                      <i className="fas fa-user-circle default-icon"></i>
                    )}
                  </div>
                  <div className="upload-text">
                    <div className="choose-file-container">
                      <i className="fas fa-upload"></i>
                      <span>Choose File</span>
                    </div>
                    <input
                      type="file"
                      ref={profileInputRef}
                      accept="image/*"
                      disabled={isSubmitting}
                      style={{ display: 'none' }}
                      onChange={handleProfileUpload}
                    />
                    <span
                      className="file-name"
                      style={{
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {profilePictureName || 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="credentials-upload">
                <label className="profile-label">CREDENTIALS</label>
                <div className="upload-controls">
                  <i className="fas fa-file-upload upload-icon"></i>
                  <div className="choose-file-container" onClick={uploadCredentials}>
                    <span>Upload Credentials</span>
                  </div>
                  <input
                    type="file"
                    ref={credentialInputRef}
                    multiple
                    disabled={isSubmitting}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={handleCredentialUpload}
                  />
                  <a href="#" onClick={(e) => { e.preventDefault(); toggleFileList(); }} className="file-link">
                    View Uploaded Files ({credentials.length})
                  </a>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="availability-days">
                DAYS OF AVAILABILITY
              </label>
              <div className="availability-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('availability')}>
                  <input
                    type="text"
                    id="availability-days"
                    value={availabilityDaysDisplay}
                    placeholder="Select available days"
                    disabled={isSubmitting}
                    className="profile-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.availability && (
                  <div className="dropdown-options availability-options">
                    {daysOfWeek.map(day => (
                      <div key={day} className="dropdown-option availability-option">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
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
                        />
                        <label htmlFor={`day-${day}`}>{day}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label required">SUBJECTS OFFERED</label>
              <div className="dropdown-wrapper">
                <div className="dropdown-trigger" onClick={toggleSubjectDropdown}>
                  <input
                    type="text"
                    placeholder={
                      selectedSubjects.length
                        ? `${selectedSubjects.length} subjects selected`
                        : 'Select subjects'
                    }
                    readOnly
                    disabled={isSubmitting}
                    className={`profile-input ${validationErrors.selectedSubjects ? 'error' : ''}`}
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>

                {showCategories && (
                  <div className="dropdown-menu categories">
                    {categories.map(category => (
                      <div
                        key={category.type}
                        className="dropdown-item"
                        onClick={() => selectCategory(category)}
                      >
                        {category.name}
                        {selectedSubjectsCount[category.type as keyof typeof selectedSubjectsCount] > 0 && (
                          <span className="count-badge">
                            {selectedSubjectsCount[category.type as keyof typeof selectedSubjectsCount]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showSubjectsDropdown && (
                  <div className="dropdown-menu subjects">
                    {currentSubjects.length > 0 ? (
                      currentSubjects.map(subject => (
                        <div key={subject} className="dropdown-item subject-item">
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
                          />
                          <label htmlFor={subject}>{subject}</label>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item no-subjects">
                        No subjects available
                      </div>
                    )}
                  </div>
                )}
              </div>
              {validationErrors.selectedSubjects && (
                <span className="validation-message">
                  {validationErrors.selectedSubjects}
                </span>
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="teaching-style">
                TEACHING STYLE
              </label>
              <div className="teaching-style-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('learningStyle')}>
                  <input
                    type="text"
                    id="teaching-style"
                    value={learningStyleDisplay}
                    disabled={isSubmitting}
                    placeholder="Select teaching style(s)"
                    className="profile-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.learningStyle && (
                  <div className="dropdown-options teaching-style-options">
                    {sessionStyles.map(style => (
                      <div key={style} className="dropdown-option teaching-style-option">
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
                        />
                        <label htmlFor={`style-${style}`}>{style}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label required" htmlFor="modality">
                TEACHING MODALITY
              </label>
              <div className="subjmodality-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('modality')}>
                  <input
                    type="text"
                    value={modality}
                    disabled={isSubmitting}
                    placeholder="Select teaching modality"
                    className="profile-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.modality && (
                  <div className="dropdown-options">
                    <div className="dropdown-option" onClick={() => {
                      setModality('Online');
                      setDropdownOpen({ ...dropdownOpen, modality: false });
                    }}>
                      Online
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setModality('In-person');
                      setDropdownOpen({ ...dropdownOpen, modality: false });
                    }}>
                      In-person
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setModality('Hybrid');
                      setDropdownOpen({ ...dropdownOpen, modality: false });
                    }}>
                      Hybrid
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="session-duration">
                PREFERRED SESSION DURATION
              </label>
              <div className="session-duration-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('sessionDuration')}>
                  <input
                    type="text"
                    value={sessionDuration}
                    disabled={isSubmitting}
                    placeholder="Select duration"
                    className="profile-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.sessionDuration && (
                  <div className="dropdown-options">
                    <div className="dropdown-option" onClick={() => {
                      setSessionDuration('1 hour');
                      setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                    }}>
                      1 hour
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setSessionDuration('2 hours');
                      setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                    }}>
                      2 hours
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setSessionDuration('3 hours');
                      setDropdownOpen({ ...dropdownOpen, sessionDuration: false });
                    }}>
                      3 hours
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="proficiency">
                PROFICIENCY LEVEL
              </label>
              <div className="proficiency-dropdown">
                <div className="dropdown-container" onClick={() => toggleDropdown('proficiency')}>
                  <input
                    type="text"
                    value={proficiency}
                    disabled={isSubmitting}
                    placeholder="Select proficiency level"
                    className="profile-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.proficiency && (
                  <div className="dropdown-options">
                    <div className="dropdown-option" onClick={() => {
                      setProficiency('Beginner');
                      setDropdownOpen({ ...dropdownOpen, proficiency: false });
                    }}>
                      Beginner
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setProficiency('Intermediate');
                      setDropdownOpen({ ...dropdownOpen, proficiency: false });
                    }}>
                      Intermediate
                    </div>
                    <div className="dropdown-option" onClick={() => {
                      setProficiency('Advanced');
                      setDropdownOpen({ ...dropdownOpen, proficiency: false });
                    }}>
                      Advanced
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label required" htmlFor="bio">SHORT BIO</label>
              <textarea
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
                className={`profile-textarea ${validationErrors.bio ? 'error' : ''}`}
              ></textarea>
              {validationErrors.bio && (
                <span className="validation-message">
                  {validationErrors.bio}
                </span>
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label required" htmlFor="experience">
                TUTORING EXPERIENCE
              </label>
              <textarea
                id="experience"
                value={experience}
                onChange={(e) => {
                  setExperience(e.target.value);
                  validateField('experience', e.target.value);
                }}
                onBlur={() => validateField('experience', experience)}
                disabled={isSubmitting}
                placeholder="Describe your tutoring experience (50-500 characters)"
                rows={4}
                className={`profile-textarea ${validationErrors.experience ? 'error' : ''}`}
              ></textarea>
              {validationErrors.experience && (
                <span className="validation-message">
                  {validationErrors.experience}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="step-indicator-container">
        <div className="step-indicator">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
            <div
              key={step}
              className={`step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              onClick={() => goToStep(step)}
            ></div>
          ))}
        </div>

        <button
          className={`next-button ${isSubmitting ? 'loading' : ''} ${isButtonActive ? 'active' : ''}`}
          onClick={nextStep}
          onMouseDown={() => !isSubmitting && setIsButtonActive(true)}
          onMouseUp={() => setIsButtonActive(false)}
          onMouseLeave={() => setIsButtonActive(false)}
        >
          {isSubmitting ? (
            <span className="loading-spinner"></span>
          ) : currentStep === totalSteps ? (
            'SUBMIT'
          ) : (
            'NEXT'
          )}
        </button>
      </div>

      {/* File List Modal */}
      {showFileList && (
        <div className="Credmodal-overlay" onClick={closeFileList}>
          <div className="Credmodal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Uploaded Files</h3>
            <ul className="file-list">
              {credentials.map((file, index) => (
                <li key={index}>
                  <span className="file-info">
                    <i className="fas fa-file-alt"></i>
                    {file.name}
                  </span>
                  <button onClick={() => deleteCredential(index)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button className="close-button" onClick={closeFileList}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Application Status Popup */}
      {showStatusPopup && (
        <div className="status-popup-overlay">
          <div className="status-popup-content">
            <h3>APPLICATION STATUS</h3>
            <p className="status-text">
              Your mentor application is under review. You will receive an email once
              it&apos;s approved. Thank you!
            </p>
            <button className="proceed-button" onClick={proceedToHome}>
              PROCEED TO HOME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorInfo;

// Helper to get cookie value (works only for non-httpOnly cookies)
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}