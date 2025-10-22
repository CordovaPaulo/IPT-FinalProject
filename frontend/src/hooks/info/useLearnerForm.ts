import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitLearnerInfo } from '@/utils/info/api';
import { validateField, validateFormStep } from '@/utils/info/validation';
import { useDropdown } from './useDropdown';

export interface ValidationErrors {
  address?: string;
  contactNumber?: string;
  gender?: string;
  selectedSubjects?: string;
  bio?: string;
  goals?: string;
  [key: string]: string | undefined;
}

export interface Category {
  type: string;
  name: string;
}

export interface AvailableSubjects {
  coreSubjects: string[];
  gecSubjects: string[];
  peNstpSubjects: string[];
}

export const useLearnerForm = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Subjects state
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

  // Dropdown hooks
  const { dropdownOpen, toggleDropdown, closeDropdown, closeAllDropdowns, useClickOutside } = useDropdown();

  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);

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

  const modalityOptions = ['Online', 'In-person', 'Hybrid'];

  // Click outside handler
  const dropdownWrapperRef = useClickOutside(() => {
    closeAllDropdowns();
    setShowCategories(false);
    setShowSubjectsDropdown(false);
  });

  // Computed values
  const availabilityDaysDisplay = selectedDays.join(', ') || 'Select available days';
  const learningStyleDisplay = selectedSessionStyles.join(', ') || 'Select learning style(s)';

  // Form actions
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nextStep = () => {
    if (isSubmitting) return;
    
    if (!validateFormStep(currentStep, { gender, contactNumber, address, selectedSubjects, bio, goals, profileImage }, setValidationErrors)) {
      alert('Please complete all required fields before proceeding');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateFormStep(currentStep, { gender, contactNumber, address, selectedSubjects, bio, goals, profileImage }, setValidationErrors)) {
      alert('Please complete all required fields before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitLearnerInfo({
        program,
        yearLevel,
        contactNumber,
        bio,
        gender,
        goals: goals || 'To improve my academic performance',
        address,
        modality,
        sessionDuration,
        selectedSubjects,
        selectedDays,
        selectedSessionStyles,
        profileImageFile: profileInputRef.current?.files?.[0]
      });
      router.replace('/auth/login');
    } catch (error) {
      console.error('Learner signup error:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsButtonActive(false);
    }
  };

  // Dropdown handlers
  const handleGenderSelect = (value: string) => {
    setGender(value);
    closeDropdown('gender');
  };

  const handleYearLevelSelect = (value: string) => {
    setYearLevel(value);
    closeDropdown('yearLevel');
  };

  const handleProgramSelect = (value: string) => {
    setProgram(value);
    closeDropdown('program');
  };

  const handleModalitySelect = (value: string) => {
    setModality(value);
    closeDropdown('modality');
  };

  const handleSessionDurationSelect = (value: string) => {
    setSessionDuration(value);
    closeDropdown('sessionDuration');
  };

  // Field validation
  const handleFieldValidation = (field: string, value: string) => {
    validateField(field, value, setValidationErrors);
  };

  // Profile picture handling
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

  // Subjects handling
  const toggleSubjectDropdown = () => {
    setShowCategories(!showCategories);
    setShowSubjectsDropdown(false);
    closeAllDropdowns();
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

  // Update available subjects when program changes
  useEffect(() => {
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
    updateAvailableSubjects();
  }, [program]);

  useEffect(() => {
    updateSelectedCounts();
  }, [selectedSubjects]);

  return {
    // State
    currentStep,
    totalSteps,
    gender,
    setGender,
    yearLevel,
    setYearLevel,
    program,
    setProgram,
    contactNumber,
    setContactNumber,
    address,
    setAddress,
    selectedSubjects,
    setSelectedSubjects,
    modality,
    setModality,
    selectedDays,
    setSelectedDays,
    bio,
    setBio,
    selectedSessionStyles,
    setSelectedSessionStyles,
    sessionDuration,
    setSessionDuration,
    goals,
    setGoals,
    profileImage,
    profilePictureName,
    dropdownOpen,
    isSubmitting,
    isButtonActive,
    setIsButtonActive,
    validationErrors,
    availableSubjects,
    showCategories,
    showSubjectsDropdown,
    currentSubjects,
    selectedSubjectCategory,
    selectedSubjectsCount,
    
    // Refs
    profileInputRef,
    dropdownWrapperRef,
    
    // Constants
    daysOfWeek,
    sessionStyles,
    programs,
    categories,
    modalityOptions,
    
    // Computed
    availabilityDaysDisplay,
    learningStyleDisplay,
    
    // Actions
    prevStep,
    nextStep,
    toggleDropdown,
    closeDropdown,
    handleGenderSelect,
    handleYearLevelSelect,
    handleProgramSelect,
    handleModalitySelect,
    handleSessionDurationSelect,
    toggleSubjectDropdown,
    selectCategory,
    handleFieldValidation,
    uploadProfilePicture,
    handleProfileUpload,
    setShowCategories,
    setShowSubjectsDropdown,
    router
  };
};