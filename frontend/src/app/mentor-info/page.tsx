'use client';

import React, { useId, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import './MentorInfo.css';
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
  topics: boolean;
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

export default function MentorInfoPage() {
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
    sessionDuration: false,
    topics: false
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

  // Refs for keyboard navigation
  const addressRef = useRef<HTMLInputElement>(null);
  const contactNumberRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const yearLevelRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const profileUploadRef = useRef<HTMLDivElement>(null);
  const credentialsUploadRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const teachingStyleRef = useRef<HTMLDivElement>(null);
  const modalityRef = useRef<HTMLDivElement>(null);
  const sessionDurationRef = useRef<HTMLDivElement>(null);
  const proficiencyRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const experienceRef = useRef<HTMLTextAreaElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const prevStepButtonRef = useRef<HTMLButtonElement>(null);
  
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

  // Previous step function
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Keyboard navigation function
  const handleKeyNavigation = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }

    const currentActiveElement = document.activeElement;
    const allFocusableElements = getFocusableElements();
    
    if (allFocusableElements.length === 0) return;

    const currentIndex = allFocusableElements.indexOf(currentActiveElement as HTMLElement);
    let nextIndex = -1;

    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex < allFocusableElements.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === 'ArrowUp') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : allFocusableElements.length - 1;
    } else if (e.key === 'ArrowLeft') {
      // Handle left arrow navigation specifically for step 1
      if (currentStep === 1) {
        if (currentActiveElement === nextButtonRef.current) {
          e.preventDefault();
          backButtonRef.current?.focus();
          return;
        }
      } else if (currentStep === 2) {
        if (currentActiveElement === nextButtonRef.current) {
          e.preventDefault();
          prevStepButtonRef.current?.focus();
          return;
        } else if (currentActiveElement === prevStepButtonRef.current) {
          e.preventDefault();
          // In step 2, focus should go to the last form element when pressing left from prev button
          const formElements = getFocusableElements().filter(el => 
            el !== backButtonRef.current && 
            el !== prevStepButtonRef.current && 
            el !== nextButtonRef.current
          );
          if (formElements.length > 0) {
            formElements[formElements.length - 1]?.focus();
          }
          return;
        }
      }
    } else if (e.key === 'ArrowRight') {
      // Handle right arrow navigation specifically for step 1
      if (currentStep === 1) {
        if (currentActiveElement === backButtonRef.current) {
          e.preventDefault();
          nextButtonRef.current?.focus();
          return;
        }
      } else if (currentStep === 2) {
        if (currentActiveElement === prevStepButtonRef.current) {
          e.preventDefault();
          nextButtonRef.current?.focus();
          return;
        } else if (currentActiveElement === backButtonRef.current) {
          e.preventDefault();
          // In step 2, focus should go to the first form element when pressing right from back button
          const formElements = getFocusableElements().filter(el => 
            el !== backButtonRef.current && 
            el !== prevStepButtonRef.current && 
            el !== nextButtonRef.current
          );
          if (formElements.length > 0) {
            formElements[0]?.focus();
          }
          return;
        }
      }
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      allFocusableElements[nextIndex]?.focus();
    }
  };

  // Get all focusable elements in current step
  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      'input:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '.dropdown-container',
      '.dropdown-trigger',
      '.upload-controls',
      '.choose-file-container',
      '.file-link'
    ].join(',');

    const currentStepElement = document.querySelector('.form-container');
    if (!currentStepElement) return [];

    const elements = Array.from(currentStepElement.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    if (nextButtonRef.current) {
      elements.push(nextButtonRef.current);
    }
    if (backButtonRef.current) {
      elements.push(backButtonRef.current);
    }
    if (prevStepButtonRef.current && currentStep === 2) {
      elements.push(prevStepButtonRef.current);
    }

    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
  };

  // Focus management for dropdowns
  const focusFirstDropdownOption = (dropdownElement: HTMLElement) => {
    const firstOption = dropdownElement.querySelector('.dropdown-option') as HTMLElement;
    firstOption?.focus();
  };

  // Handle dropdown keyboard navigation
  const handleDropdownKeyNavigation = (e: React.KeyboardEvent, dropdownType: keyof DropdownOpenState) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!dropdownOpen[dropdownType]) {
        toggleDropdown(dropdownType);
        setTimeout(() => {
          const dropdownElement = document.querySelector(`.${dropdownType}-dropdown`) as HTMLElement;
          if (dropdownElement) {
            focusFirstDropdownOption(dropdownElement);
          }
        }, 0);
      }
    } else if (e.key === 'Escape' && dropdownOpen[dropdownType]) {
      e.preventDefault();
      setDropdownOpen(prev => ({ ...prev, [dropdownType]: false }));
    }
  };

  // Handle subjects dropdown keyboard navigation
  const handleSubjectsKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!showCategories) {
        toggleSubjectDropdown();
      }
    } else if (e.key === 'Escape' && (showCategories || showSubjectsDropdown)) {
      e.preventDefault();
      setShowCategories(false);
      setShowSubjectsDropdown(false);
    }
  };

  // Handle checkbox keyboard navigation
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

  // Handle file upload keyboard navigation
  const handleUploadKeyNavigation = (e: React.KeyboardEvent, uploadType: 'profile' | 'credentials') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (uploadType === 'profile') {
        uploadProfilePicture();
      } else {
        uploadCredentials();
      }
    }
  };

  // Handle file list keyboard navigation
  const handleFileListKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFileList();
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
      if (!yearLevel) errors.yearLevel = 'Year level is required'; // Added missing validation
      if (!program) errors.program = 'Program is required'; // Added missing validation
      if (!contactNumber || contactNumber.length !== 11) errors.contactNumber = 'Valid Contact Number is required (11 digits)';
      if (!address.trim()) errors.address = 'Address is required';
    }
    
    if (currentStep === 2) {
      if (selectedSubjects.length === 0) errors.selectedSubjects = 'At least one subject is required';
      if (!modality) errors.modality = 'Teaching modality is required'; // Added missing validation
      if (!proficiency) errors.proficiency = 'Proficiency level is required'; // Added missing validation
      if (!sessionDuration) errors.sessionDuration = 'Session duration is required'; // Added missing validation
      if (selectedDays.length === 0) errors.selectedDays = 'At least one day of availability is required'; // Added missing validation
      if (selectedSessionStyles.length === 0) errors.selectedSessionStyles = 'At least one teaching style is required'; // Added missing validation
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

      // Map dropdown values to backend enums (CORRECTED to match your backend validation)
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
          'In-person': 'in-person', // Backend expects 'in-person'
          'Hybrid': 'hybrid'        // Backend expects 'hybrid'
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

      // Append all required fields to match backend expectations exactly
      formData.append('sex', gender.toLowerCase());
      formData.append('program', mapProgram(program));
      formData.append('yearLevel', mapYearLevel(yearLevel));
      formData.append('phoneNumber', contactNumber);
      formData.append('bio', bio);
      formData.append('exp', experience); // Backend expects 'exp' not 'experience'
      formData.append('address', address);
      formData.append('modality', mapModality(modality));
      formData.append('proficiency', mapProficiency(proficiency));
      formData.append('sessionDur', mapSessionDuration(sessionDuration));
      formData.append('subjects', JSON.stringify(selectedSubjects));
      formData.append('availability', JSON.stringify(mapAvailability(selectedDays)));
      formData.append('style', JSON.stringify(mapLearningStyle(selectedSessionStyles)));

      // Handle profile image properly
      if (profileInputRef.current?.files?.[0]) {
        formData.append('image', profileInputRef.current.files[0]);
      } else {
        // Backend checks for null value specifically
        formData.append('image', 'null');
      }

      // Handle credentials - append multiple files with same field name
      if (credentialInputRef.current?.files && credentialInputRef.current.files.length > 0) {
        Array.from(credentialInputRef.current.files).forEach(file => {
          formData.append('credentials', file);
        });
      }

      // Get token from cookie (matching backend token extraction)
      const token = getCookie('MindMateToken');

      // Send request with proper headers
      const response = await api.post('/api/auth/mentor/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Backend checks Authorization header first, then cookies
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log('Mentor signup successful:', response.data);
      setShowStatusPopup(true);
    } catch (error: any) {
      console.error('Mentor signup error:', error);
      
      // Enhanced error handling matching backend error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.validOptions) {
          alert(`Error: ${errorData.message}\nValid options: ${errorData.validOptions.join(', ')}`);
        } else {
          alert(`Error: ${errorData.message || 'Unknown error occurred'}`);
        }
      } else {
        alert('There was an error submitting your information. Please try again.');
      }
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

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation);
    return () => {
      document.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [currentStep]);
  
  // Reuse helpers
  function focusFirstOption(listboxId: string) { const first = document.querySelector<HTMLElement>(`#${listboxId} [role="option"]`); first?.focus(); }
  const handleComboboxKey = (toggleOpen: () => void, isOpen: boolean, listboxId: string) =>
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); }
      else if (e.key === 'Escape' && isOpen) { e.preventDefault(); toggleOpen(); }
      else if ((e.key === 'ArrowDown' || e.key === 'Down') && isOpen) { e.preventDefault(); focusFirstOption(listboxId); }
    };
  const handleOptionKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    const current = e.currentTarget;
    const options = Array.from(current.parentElement?.querySelectorAll<HTMLElement>('[role="option"]') || []);
    const idx = options.indexOf(current);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); current.querySelector<HTMLInputElement>('input')?.click(); return; }
    if (e.key === 'ArrowDown' || e.key === 'Down') { e.preventDefault(); options[Math.min(idx + 1, options.length - 1)]?.focus(); return; }
    if (e.key === 'ArrowUp' || e.key === 'Up') { e.preventDefault(); options[Math.max(idx - 1, 0)]?.focus(); return; }
    if (e.key === 'Home') { e.preventDefault(); options[0]?.focus(); return; }
    if (e.key === 'End') { e.preventDefault(); options[options.length - 1]?.focus(); return; }
  };

  // Stable, SSR-safe IDs
  const topicComboboxId = useId();
  const topicListboxId = useId(); // if you use aria-controls/role=listbox

  return (
    <div className="mentorinfo-container">
      <Head>
        <title>Mentor Information</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </Head>
      
      <button 
        ref={backButtonRef}
        onClick={() => router.push('/auth/signup')} 
        className="back-btn"
        tabIndex={0}
      >
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
                ref={addressRef}
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
                tabIndex={0}
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
                ref={contactNumberRef}
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
                tabIndex={0}
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
              <div 
                ref={genderRef}
                className="gender-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'gender')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('gender')}>
                  <input
                    type="text"
                    value={gender}
                    placeholder="Select your sex"
                    disabled={isSubmitting}
                    className="personal-input"
                    readOnly
                    tabIndex={-1}
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.gender && (
                  <div className="dropdown-options">
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setGender('Female');
                        setDropdownOpen({ ...dropdownOpen, gender: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setGender('Female');
                          setDropdownOpen({ ...dropdownOpen, gender: false });
                        }
                      }}
                    >
                      Female
                    </div>
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setGender('Male');
                        setDropdownOpen({ ...dropdownOpen, gender: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setGender('Male');
                          setDropdownOpen({ ...dropdownOpen, gender: false });
                        }
                      }}
                    >
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
              <div 
                ref={yearLevelRef}
                className="year-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'yearLevel')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('yearLevel')}>
                  <input
                    type="text"
                    value={yearLevel}
                    placeholder="Select your year level"
                    disabled={isSubmitting}
                    className="personal-input"
                    readOnly
                    tabIndex={-1}
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.yearLevel && (
                  <div className="dropdown-options">
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setYearLevel('1st Year');
                        setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setYearLevel('1st Year');
                          setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                        }
                      }}
                    >
                      1st Year
                    </div>
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setYearLevel('2nd Year');
                        setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setYearLevel('2nd Year');
                          setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                        }
                      }}
                    >
                      2nd Year
                    </div>
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setYearLevel('3rd Year');
                        setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setYearLevel('3rd Year');
                          setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                        }
                      }}
                    >
                      3rd Year
                    </div>
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setYearLevel('4th Year');
                        setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setYearLevel('4th Year');
                          setDropdownOpen({ ...dropdownOpen, yearLevel: false });
                        }
                      }}
                    >
                      4th Year
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="personal-field">
              <label className="personal-label" htmlFor="program">PROGRAM </label>
              <div 
                ref={programRef}
                className="program-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'program')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('program')}>
                  <input
                    type="text"
                    value={program}
                    placeholder="Select your program"
                    className="personal-input"
                    disabled={isSubmitting}
                    readOnly
                    tabIndex={-1}
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
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setProgram(programOption);
                            setDropdownOpen({ ...dropdownOpen, program: false });
                          }
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
                <div 
                  ref={profileUploadRef}
                  className="upload-controls" 
                  onClick={uploadProfilePicture}
                  tabIndex={0}
                  onKeyDown={(e) => handleUploadKeyNavigation(e, 'profile')}
                >
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
                <div 
                  ref={credentialsUploadRef}
                  className="upload-controls"
                  tabIndex={0}
                  onKeyDown={(e) => handleUploadKeyNavigation(e, 'credentials')}
                >
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
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); toggleFileList(); }} 
                    className="file-link"
                    tabIndex={0}
                    onKeyDown={handleFileListKeyNavigation}
                  >
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
              <div 
                ref={availabilityRef}
                className="availability-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'availability')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('availability')}>
                  <input
                    type="text"
                    id="availability-days"
                    value={availabilityDaysDisplay}
                    placeholder="Select available days"
                    disabled={isSubmitting}
                    className="profile-input"
                    readOnly
                    tabIndex={-1}
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
                          tabIndex={0}
                          onKeyDown={(e) => handleCheckboxKeyNavigation(e, 'day', day, selectedDays, setSelectedDays)}
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
              <div 
                ref={subjectsRef}
                className="dropdown-wrapper"
                tabIndex={0}
                onKeyDown={handleSubjectsKeyNavigation}
              >
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
                    tabIndex={-1}
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
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            selectCategory(category);
                          }
                        }}
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
                            tabIndex={0}
                            onKeyDown={(e) => handleCheckboxKeyNavigation(e, 'subject', subject, selectedSubjects, setSelectedSubjects)}
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
              <div 
                ref={teachingStyleRef}
                className="teaching-style-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'learningStyle')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('learningStyle')}>
                  <input
                    type="text"
                    id="teaching-style"
                    value={learningStyleDisplay}
                    disabled={isSubmitting}
                    placeholder="Select teaching style(s)"
                    className="profile-input"
                    readOnly
                    tabIndex={-1}
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
                          tabIndex={0}
                          onKeyDown={(e) => handleCheckboxKeyNavigation(e, 'style', style, selectedSessionStyles, setSelectedSessionStyles)}
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
              <div 
                ref={modalityRef}
                className="subjmodality-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'modality')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('modality')}>
                  <input
                    type="text"
                    value={modality}
                    disabled={isSubmitting}
                    placeholder="Select teaching modality"
                    className={`profile-input ${validationErrors.modality ? 'error' : ''}`}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.modality && (
                  <div className="dropdown-options">
                    <div 
                      className="dropdown-option" 
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
                      className="dropdown-option" 
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
                      className="dropdown-option" 
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
                {validationErrors.modality && (
                  <span className="validation-message">
                    {validationErrors.modality}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="session-duration">
                PREFERRED SESSION DURATION
              </label>
              <div 
                ref={sessionDurationRef}
                className="session-duration-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'sessionDuration')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('sessionDuration')}>
                  <input
                    type="text"
                    value={sessionDuration}
                    disabled={isSubmitting}
                    placeholder="Select duration"
                    className={`profile-input ${validationErrors.sessionDuration ? 'error' : ''}`}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.sessionDuration && (
                  <div className="dropdown-options">
                    <div 
                      className="dropdown-option" 
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
                      className="dropdown-option" 
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
                      className="dropdown-option" 
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
                {validationErrors.sessionDuration && (
                  <span className="validation-message">
                    {validationErrors.sessionDuration}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="proficiency">
                PROFICIENCY LEVEL
              </label>
              <div 
                ref={proficiencyRef}
                className="proficiency-dropdown"
                tabIndex={0}
                onKeyDown={(e) => handleDropdownKeyNavigation(e, 'proficiency')}
              >
                <div className="dropdown-container" onClick={() => toggleDropdown('proficiency')}>
                  <input
                    type="text"
                    value={proficiency}
                    disabled={isSubmitting}
                    placeholder="Select proficiency level"
                    className={`profile-input ${validationErrors.proficiency ? 'error' : ''}`}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </div>
                {dropdownOpen.proficiency && (
                  <div className="dropdown-options">
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setProficiency('Beginner');
                        setDropdownOpen({ ...dropdownOpen, proficiency: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setProficiency('Beginner');
                          setDropdownOpen({ ...dropdownOpen, proficiency: false });
                        }
                      }}
                    >
                      Beginner
                    </div>
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setProficiency('Intermediate');
                        setDropdownOpen({ ...dropdownOpen, proficiency: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setProficiency('Intermediate');
                          setDropdownOpen({ ...dropdownOpen, proficiency: false });
                        }
                      }}
                    >
                      Intermediate
                    </div>
                    <div 
                      className="dropdown-option" 
                      onClick={() => {
                        setProficiency('Advanced');
                        setDropdownOpen({ ...dropdownOpen, proficiency: false });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setProficiency('Advanced');
                          setDropdownOpen({ ...dropdownOpen, proficiency: false });
                        }
                      }}
                    >
                      Advanced
                    </div>
                  </div>
                )}
                {validationErrors.proficiency && (
                  <span className="validation-message">
                    {validationErrors.proficiency}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label required" htmlFor="bio">SHORT BIO</label>
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
                className={`profile-textarea ${validationErrors.bio ? 'error' : ''}`}
                tabIndex={0}
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
                ref={experienceRef}
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
                tabIndex={0}
              ></textarea>
              {validationErrors.experience && (
                <span className="validation-message">
                  {validationErrors.experience}
                </span>
              )}
            </div>

            {/* Example: expertise/topics multi-select */}
            <div
              role="combobox"
              id={topicComboboxId}
              tabIndex={0}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen.topics}
              aria-controls={topicListboxId} // optional
            >
              <div className="dropdown-container" onClick={(e) => { e.stopPropagation(); toggleDropdown('topics'); }}>
                <input role="textbox" readOnly aria-autocomplete="none" aria-controls={topicListboxId} />
              </div>
              {dropdownOpen.topics && (
                <div id={topicListboxId} role="listbox" aria-multiselectable="true" className="dropdown-options topics-options">
                  {topicOptions.map((topic) => {
                    const optionId = `topic-${topic}`;
                    const isSelected = selectedTopics.includes(topic); // wire to your state
                    return (
                      <div key={topic} role="option" aria-selected={isSelected} tabIndex={-1} className="dropdown-option topic-option" onKeyDown={handleOptionKeyDown}>
                        <input type="checkbox" id={optionId} checked={isSelected} />
                        <label htmlFor={optionId}>{topic}</label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buttons Container - Step indicator removed */}
      <div className="next-button-container">
        {currentStep === 2 && (
          <button
            ref={prevStepButtonRef}
            className="prev-step-button"
            onClick={prevStep}
            disabled={isSubmitting}
            tabIndex={0}
          >
            PREVIOUS
          </button>
        )}
        <button
          ref={nextButtonRef}
          className={`next-button ${isSubmitting ? 'loading' : ''} ${isButtonActive ? 'active' : ''}`}
          onClick={nextStep}
          onMouseDown={() => !isSubmitting && setIsButtonActive(true)}
          onMouseUp={() => setIsButtonActive(false)}
          onMouseLeave={() => setIsButtonActive(false)}
          disabled={isSubmitting}
          tabIndex={0}
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

// Helper to get cookie value (works only for non-httpOnly cookies)
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}