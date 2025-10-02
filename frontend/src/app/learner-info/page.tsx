'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import './LearnerInfo.css';
import api from "@/lib/axios";

interface DropdownOpenState {
  gender: boolean;
  yearLevel: boolean;
  program: boolean;
  modality: boolean;
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
  goals?: string;
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

const LearnerInfo = () => {
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
  const [selectedSessionStyles, setSelectedSessionStyles] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState('');
  const [goals, setGoals] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profilePictureName, setProfilePictureName] = useState('');
  
  // UI state
  const [dropdownOpen, setDropdownOpen] = useState<DropdownOpenState>({
    gender: false,
    yearLevel: false,
    program: false,
    modality: false,
    availability: false,
    learningStyle: false,
    sessionDuration: false
  });
  
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
  const dropdownRefs = {
    gender: useRef<HTMLDivElement>(null),
    yearLevel: useRef<HTMLDivElement>(null),
    program: useRef<HTMLDivElement>(null),
    modality: useRef<HTMLDivElement>(null),
    availability: useRef<HTMLDivElement>(null),
    learningStyle: useRef<HTMLDivElement>(null),
    sessionDuration: useRef<HTMLDivElement>(null),
    subjects: useRef<HTMLDivElement>(null)
  };
  
  // Computed values
  const availabilityDaysDisplay = selectedDays.join(', ') || 'Select available days';
  const learningStyleDisplay = selectedSessionStyles.join(', ') || 'Select learning style(s)';
  
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
    goals: {
      minLength: 50,
      maxLength: 500,
      message: 'Goals should be between 50-500 characters'
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
    
    // Close subject dropdowns when opening other dropdowns
    if (type !== 'availability' && type !== 'learningStyle') {
      setShowCategories(false);
      setShowSubjectsDropdown(false);
    }
  };
  
  const toggleSubjectDropdown = () => {
    setShowCategories(!showCategories);
    setShowSubjectsDropdown(false);
    
    // Close other dropdowns
    setDropdownOpen({
      gender: false,
      yearLevel: false,
      program: false,
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
      if (!goals.trim()) errors.goals = 'Learning goals is required';
      if (!profileImage) errors.profileImage = 'Profile Picture is required';
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
      submitLearnerInfo();
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
  
  const updateAvailableSubjects = () => {
    switch (program) {
      case 'Bachelor of Science in Information Technology (BSIT)':
        setAvailableSubjects({
          coreSubjects: [
            'Application Development and Emerging Technologies',
            'Business Analytics',
            'Computer Programming 1',
            'Computer Programming 2',
            'Data Structures and Algorithms',
            'Digital Design with Multimedia Systems',
            'Discrete Structures 1',
            'Event Driven Programming',
            'Fundamentals of Database Systems',
            'Information Assurance and Security 1',
            'Information Assurance and Security 2',
            'Information Management 1',
            'Integrative Programming and Technologies',
            'Introduction to Computing',
            'Introduction to Human-Computer Interaction',
            'IT Elective 1',
            'IT Elective 2',
            'IT Elective 3',
            'IT Elective 4',
            'IT Elective 5',
            'IT Research Methods',
            'IT Seminars and Educational Trips',
            'Networking 1',
            'Networking 2',
            'Object-Oriented Programming',
            'PC Troubleshooting with Basic Electronics',
            'Platform Technologies',
            'Quantitative Methods (Inc. Modelling & Simulation)',
            'Social Issues and Professional Practice in Computing',
            'System Administration and Maintenance',
            'Systems Integration and Architecture 1',
          ],
          gecSubjects: [
            'Art Appreciation',
            'Ethics',
            'Mathematics in the Modern World',
            'People and Earth\'s Ecosystem',
            'Purposive Communication',
            'Reading Visual Arts',
            'Readings in Philippine History with Indigenous People Studies',
            'Science, Technology and Society',
            'The Contemporary World with Peace Studies',
            'The Entrepreneurial Mind',
            'The Life and Works of Rizal',
            'Understanding the Self',
          ],
          peNstpSubjects: [
            'National Service Training Program with Anti-Smoking and Environmental Education',
            'National Service Training Program with GAD and Peace Education',
            'Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency',
            'Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities',
            'Physical Activities Toward Health and Fitness 3 (PATHFit 3)',
            'Physical Activities Toward Health and Fitness 4 (PATHFit 4)',
          ]
        });
        break;

      case 'Bachelor of Science in Computer Science (BSCS)':
        setAvailableSubjects({
          coreSubjects: [
            'Computer Programming 1',
            'Computer Programming 2',
            'Data Structures and Algorithms',
            'Algorithms and Complexity 1',
            'Software Engineering 1',
            'Software Engineering 2',
            'Operating Systems',
            'Object-Oriented Programming',
            'Information Management 1',
            'Discrete Structures 1',
            'Discrete Structures 2',
            'Principles of Statistics and Probability',
            'Graphics and Visual Computing',
            'Automata Theory',
            'Intelligent Systems',
            'Programming Languages',
            'Parallel and Distributed Computing',
            'Architecture and Organization',
            'Information Assurance and Security',
            'CS Thesis Writing 1',
            'CS Thesis Writing 2',
            'CS Elective 1',
            'CS Elective 2',
            'CS Elective 3',
            'CS Elective 4',
            'CS Elective 5',
            'CS Seminars and Educational Trips',
          ],
          gecSubjects: [
            'Introduction to Computing',
            'PC Troubleshooting with Basic Electronics',
            'Understanding the SELF',
            'Readings in Philippine History with Indigenous People Studies',
            'The Life and Works of Jose Rizal',
            'People and Earth\'s Ecosystem',
            'Mathematics in the Modern World',
            'Science, Technology and Society',
            'Reading Visual Arts',
            'Art Appreciation',
            'Purposive Communication',
            'Ethics',
            'The Contemporary World With Peace Studies',
          ],
          peNstpSubjects: [
            'National Service Training Program 1',
            'National Service Training Program 2',
            'Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency',
            'Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities',
            'Physical Activities Toward Health and Fitness 3 (PATHFit 3)',
            'Physical Activities Toward Health and Fitness 4 (PATHFit 4)',
          ]
        });
        break;

      case 'Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)':
        setAvailableSubjects({
          coreSubjects: [
            'Introduction to EM Computing',
            'Computer Programming 1',
            'PC Troubleshooting with Basic Electronics',
            'Computer Programming 2',
            'Usability, HCI, UI Design',
            'Free Hand and Digital Drawing',
            'Data Structures and Algorithms',
            'Information Management 1',
            'Introduction to Game Design and Development',
            'Computer Graphics Programming',
            'Image and Video Processing',
            'Script Writing and Storyboard Design',
            'Applications Development and Emerging Technologies',
            'Principles of 2D Animation',
            'Audio Design and Sound Engineering Modelling and Rigging',
            'Texture and Mapping',
            'Social Issues and Professional Practice in Computing',
            'Lighting and Effects',
            'Principles of 3D Animation',
            'Design and Production Process',
            'Advanced Sound Production',
            'Advanced 2D Animation',
            'EMC Professional Elective 1',
            'Research Methods',
            'Advanced 3D Animation and Scripting',
            'Compositing and Rendering',
            'EMC Professional Elective 2',
            'Animation Design and Production',
            'EMC Professional Elective 3',
            'Computing Seminars and Educational Trips',
          ],
          gecSubjects: [
            'Art Appreciation',
            'Ethics',
            'Mathematics in the Modern World',
            'People and Earth\'s Ecosystem',
            'Purposive Communication',
            'Reading Visual Arts',
            'Readings in Philippine History with Indigenous People Studies',
            'Science, Technology and Society',
            'The Contemporary World with Peace Studies',
            'The Entrepreneurial Mind',
            'The Life and Works of Rizal',
            'Understanding the Self',
          ],
          peNstpSubjects: [
            'National Service Training Program with Anti-Smoking and Environmental Education',
            'National Service Training Program with GAD and Peace Education',
            'Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency',
            'Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities',
            'Physical Activities Toward Health and Fitness 3 (PATHFit 3)',
            'Physical Activities Toward Health and Fitness 4 (PATHFit 4)',
          ]
        });
        break;

      default:
        setAvailableSubjects({
          coreSubjects: [],
          gecSubjects: [],
          peNstpSubjects: []
        });
    }
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
  
  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  const submitLearnerInfo = async () => {
    if (!validateForm()) {
      alert('Please complete all required fields before submitting');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();
      
      // Map frontend values to backend enum values
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
          'In-person': 'face-to-face',
          'Face-to-face': 'face-to-face',
          'Hybrid': 'mixed'
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

      // Add mapped form fields to FormData
      formData.append('program', mapProgram(program));
      formData.append('yearLevel', mapYearLevel(yearLevel));
      formData.append('phoneNumber', contactNumber);
      formData.append('bio', bio);
      formData.append('sex', gender.toLowerCase()); // Map gender to sex (male/female)
      formData.append('goals', goals || 'To improve my academic performance'); // Add goals
      formData.append('address', address);
      formData.append('modality', mapModality(modality));
      formData.append('sessionDur', mapSessionDuration(sessionDuration));
      
      // Convert arrays to JSON strings with mapped values
      formData.append('subjects', JSON.stringify(selectedSubjects));
      formData.append('availability', JSON.stringify(mapAvailability(selectedDays)));
      formData.append('style', JSON.stringify(mapLearningStyle(selectedSessionStyles)));
      
      // Add profile image if selected
      if (profileInputRef.current?.files?.[0]) {
        formData.append('image', profileInputRef.current.files[0]);
      }

      // Get MindMateToken from cookie
      const token = getCookie('MindMateToken');

      // Send request to learner signup endpoint with Authorization header
      const response = await api.post('/api/auth/learner/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log('Learner signup successful:', response.data);
      
      // Redirect to learner dashboard after successful submission
      router.push('/learner');
    } catch (error) {
      console.error('Learner signup error:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsButtonActive(false);
    }
  };
  
  const scrollToGetStarted = () => {
    router.push('/signup');
  };
  
  // Effects
  useEffect(() => {
    updateAvailableSubjects();
  }, [program]);
  
  useEffect(() => {
    updateSelectedCounts();
  }, [selectedSubjects]);

  // Close dropdowns when clicking outside - FIXED VERSION
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside all dropdown containers
      const isOutsideAll = Object.values(dropdownRefs).every(ref => {
        return ref.current && !ref.current.contains(event.target as Node);
      });

      if (isOutsideAll) {
        setDropdownOpen({
          gender: false,
          yearLevel: false,
          program: false,
          modality: false,
          availability: false,
          learningStyle: false,
          sessionDuration: false,
        });
        setShowCategories(false);
        setShowSubjectsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="learnerinfo-container">
      <Head>
        <title>Learner Information</title>
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
        <h1>LEARNER INFO</h1>
        <p>Complete your profile to start learning.</p>
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
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('gender'); }}>
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
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('yearLevel'); }}>
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
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('program'); }}>
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

            {/* Profile Picture Upload */}
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
            </div>

            <div className="divider"></div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="availability-days">
                DAYS OF AVAILABILITY
              </label>
              <div className="availability-dropdown">
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('availability'); }}>
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
              <label className="profile-label required">SUBJECTS OF INTEREST</label>
              <div className="dropdown-wrapper">
                <div className="dropdown-trigger" onClick={(e) => { e.stopPropagation(); toggleSubjectDropdown(); }}>
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
              <label className="profile-label" htmlFor="modality">
                LEARNING MODALITY
              </label>
              <div className="subjmodality-dropdown">
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('modality'); }}>
                  <input
                    type="text"
                    value={modality}
                    disabled={isSubmitting}
                    placeholder="Select learning modality"
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
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('sessionDuration'); }}>
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
              <label className="profile-label" htmlFor="learning-style">
                LEARNING STYLE
              </label>
              <div className="learning-style-dropdown">
                <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('learningStyle'); }}>
                  <input
                    type="text"
                    id="learning-style"
                    value={learningStyleDisplay}
                    disabled={isSubmitting}
                    placeholder="Select learning style(s)"
                    className="profile-input"
                    readOnly
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.learningStyle && (
                  <div className="dropdown-options learning-style-options">
                    {sessionStyles.map(style => (
                      <div key={style} className="dropdown-option learning-style-option">
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
              <label className="profile-label required" htmlFor="goals">
                LEARNING GOALS
              </label>
              <textarea
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
                className={`profile-textarea ${validationErrors.goals ? 'error' : ''}`}
              ></textarea>
              {validationErrors.goals && (
                <span className="validation-message">
                  {validationErrors.goals}
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
          disabled={isSubmitting}
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
    </div>
  );
};

export default LearnerInfo;