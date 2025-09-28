// components/mentorpage/information/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
  id: number | null;
  name: string;
  email: string;
  role: string;
}

interface Mentor {
  address: string;
  proficiency: string;
  year: string;
  course: string;
  availability: string[];
  prefSessDur: string;
  bio: string;
  subjects: string[];
  image: string;
  phoneNum: string;
  teach_sty: string[];
  credentials: string[];
  exp: string;
  rating_ave: number;
  gender?: string;
  learn_modality?: string;
}

interface UserData {
  user: User;
  ment: Mentor;
  image_url: string | null;
}

interface EditInformationComponentProps {
  userData: UserData;
  onSave: (updatedData: UserData) => void;
  onCancel: () => void;
}

export default function EditInformationComponent({ userData, onSave, onCancel }: EditInformationComponentProps) {
  const [personalData, setPersonalData] = useState({
    gender: '',
    otherGender: '',
    yearLevel: '',
    program: '',
    address: '',
    contactNumber: '',
  });
  
  const [profileData, setProfileData] = useState({
    courseOffered: [] as string[],
    shortBio: '',
    tutoringExperience: '',
    teachingModality: '',
    daysOfAvailability: [] as string[],
    proficiencyLevel: '',
    teachingStyle: [] as string[],
    preferredSessionDuration: '',
  });
  
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const [availableSubjects, setAvailableSubjects] = useState({
    coreSubjects: [] as string[],
    gecSubjects: [] as string[],
    peNstpSubjects: [] as string[],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Options
  const yearLevelOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const programOptions = [
    'Bachelor of Science in Information Technology (BSIT)',
    'Bachelor of Science in Computer Science (BSCS)',
    'Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)',
  ];
  const genderOptions = ['Male', 'Female'];
  const teachingModalityOptions = ['Online', 'In-person', 'Hybrid'];
  const proficiencyOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const durationOptions = ['1 hour', '2 hours', '3 hours'];
  
  const daysOptions = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];
  
  const teachingStyleOptions = [
    { label: 'Lecture-Based', value: 'Lecture-Based' },
    { label: 'Interactive Discussion', value: 'Interactive Discussion' },
    { label: 'Q&A Session', value: 'Q&A Session' },
    { label: 'Demonstration', value: 'Demonstration' },
    { label: 'Project-based', value: 'Project-based' },
    { label: 'Step-by-step process', value: 'Step-by-step process' },
  ];

  const inputFieldPersonalInformation = [
    { field: 'Year Level', type: 'select', options: yearLevelOptions },
    { field: 'Program', type: 'select', options: programOptions },
    { field: 'Address', type: 'text' },
    { field: 'Contact Number', type: 'text' },
  ];

  const inputFieldProfileInformation = [
    { field: 'Teaching Modality', type: 'select', options: teachingModalityOptions },
    { field: 'Days of Availability', type: 'checkbox', options: daysOptions },
    { field: 'Proficiency Level', type: 'select', options: proficiencyOptions },
    { field: 'Teaching Style', type: 'checkbox', options: teachingStyleOptions },
    { field: 'Preferred Session Duration', type: 'select', options: durationOptions },
    { field: 'Course Offered', type: 'select' },
  ];

  const bioAndExperienceFields = [
    { field: 'Short Bio', column: 1 },
    { field: 'Tutoring Experience', column: 2 },
  ];

  // Helper functions
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return 'Not specified';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  };

  const getPlaceholder = (field: string, section: 'personal' | 'profile') => {
    const mappings = {
      personal: {
        'Full Name': userData.user.name,
        'Year Level': userData.ment.year,
        'Program': userData.ment.course,
        'Address': userData.ment.address,
        'Contact Number': userData.ment.phoneNum,
        'Sex at Birth': capitalizeFirstLetter(userData.ment.gender || ''),
      },
      profile: {
        'Teaching Modality': userData.ment.learn_modality,
        'Days of Availability': userData.ment.availability?.join(', '),
        'Proficiency Level': userData.ment.proficiency,
        'Teaching Style': userData.ment.teach_sty?.join(', ') || '',
        'Preferred Session Duration': userData.ment.prefSessDur,
        'Course Offered': userData.ment.subjects?.join(', '),
        'Short Bio': userData.ment.bio,
        'Tutoring Experience': userData.ment.exp,
      },
    };

    return mappings[section][field];
  };

  const updateAvailableSubjects = (program: string) => {
    const selectedProgram = program || userData.ment.course;

    switch (selectedProgram) {
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
          ],
        });
        break;

      case 'Bachelor of Science in Computer Science (BSCS)':
        setAvailableSubjects({
          coreSubjects: [
            'Computer Programming 1',
            'Computer Programming 2',
            'Introduction to Computing',
            'PC Troubleshooting with Basic Electronics',
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
            'National Service Training Program 1',
            'National Service Training Program 2',
            'Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency',
            'Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities',
            'Physical Activities Toward Health and Fitness 3 (PATHFit 3)',
            'Physical Activities Toward Health and Fitness 4 (PATHFit 4)',
          ],
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
          ],
        });
        break;

      default:
        setAvailableSubjects({
          coreSubjects: [],
          gecSubjects: [],
          peNstpSubjects: [],
        });
    }
  };

  // Initialize data
  useEffect(() => {
    updateAvailableSubjects(userData.ment.course);
    
    // Set personal data from props
    setPersonalData({
      gender: userData.ment.gender || '',
      otherGender: '',
      yearLevel: userData.ment.year || '',
      program: userData.ment.course || '',
      address: userData.ment.address || '',
      contactNumber: userData.ment.phoneNum || '',
    });
    
    // Set profile data from props
    setProfileData(prev => ({
      ...prev,
      courseOffered: userData.ment.subjects || [],
      daysOfAvailability: userData.ment.availability || [],
      teachingStyle: userData.ment.teach_sty || [],
      teachingModality: userData.ment.learn_modality || '',
      proficiencyLevel: userData.ment.proficiency || '',
      preferredSessionDuration: userData.ment.prefSessDur || '',
      shortBio: userData.ment.bio || '',
      tutoringExperience: userData.ment.exp || '',
    }));
  }, [userData]);

  // Watch for program changes
  useEffect(() => {
    if (personalData.program) {
      updateAvailableSubjects(personalData.program);
    }
  }, [personalData.program]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (field: string) => {
    setDropdownOpen(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        if (key !== field) newState[key] = false;
      });
      newState[field] = !prev[field];
      return newState;
    });
  };

  const selectOption = (field: string, value: string, section: 'personal' | 'profile' = 'profile') => {
    if (section === 'personal') {
      setPersonalData(prev => ({ ...prev, [field]: value }));
    } else {
      if (Array.isArray(profileData[field as keyof typeof profileData])) {
        const currentArray = profileData[field as keyof typeof profileData] as string[];
        const index = currentArray.indexOf(value);
        let newArray;
        
        if (index === -1) {
          newArray = [...currentArray, value];
        } else {
          newArray = currentArray.filter(item => item !== value);
        }
        
        setProfileData(prev => ({ ...prev, [field]: newArray }));
      } else {
        setProfileData(prev => ({ ...prev, [field]: value }));
      }
    }
    setDropdownOpen(prev => ({ ...prev, [field]: false }));
  };

  const selectGender = (gender: string) => {
    setPersonalData(prev => ({ ...prev, gender }));
    setDropdownOpen(prev => ({ ...prev, gender: false }));
  };

  const handleCourseOfferedChange = (subject: string) => {
    setProfileData(prev => {
      const currentSubjects = prev.courseOffered;
      const index = currentSubjects.indexOf(subject);
      let newSubjects;
      
      if (index === -1) {
        newSubjects = [...currentSubjects, subject];
      } else {
        newSubjects = currentSubjects.filter(item => item !== subject);
      }
      
      return { ...prev, courseOffered: newSubjects };
    });
  };

  const getDisplayValue = (field: string) => {
    const value = profileData[field as keyof typeof profileData];
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        if (field === 'daysOfAvailability') {
          return userData.ment.availability?.join(', ') || '';
        }
        if (field === 'teachingStyle') {
          return userData.ment.teach_sty?.join(', ') || '';
        }
      }
      return value.join(', ');
    }
    return value || '';
  };

  const validateField = (field: string, value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return;
    }

    let error = '';
    switch (field) {
      case 'shortBio':
        if (trimmedValue.length < 20) {
          error = 'Short Bio should be at least 20 characters.';
        }
        break;
      case 'tutoringExperience':
        if (trimmedValue.length < 10) {
          error = 'Tutoring Experience should be at least 10 characters.';
        }
        break;
      case 'contactNumber':
        if (trimmedValue.length !== 11) {
          error = 'Contact Number should be 11 digits.';
        } else if (!/^\d+$/.test(trimmedValue)) {
          error = 'Contact Number should contain only digits.';
        }
        break;
      case 'address':
        if (trimmedValue.length < 10) {
          error = 'Address should be at least 10 characters.';
        }
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const saveChanges = async () => {
    // Validate all fields
    Object.keys(personalData).forEach(key => {
      validateField(key, personalData[key as keyof typeof personalData]);
    });
    Object.keys(profileData).forEach(key => {
      if (typeof profileData[key as keyof typeof profileData] === 'string') {
        validateField(key, profileData[key as keyof typeof profileData] as string);
      }
    });

    // Check if there are any validation errors
    if (Object.values(validationErrors).some(error => error)) {
      alert('Please fix validation errors before saving.');
      return;
    }

    try {
      const response = await fetch('/api/mentor/edit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: userData.user.name,
          gender: capitalizeFirstLetter(personalData.gender || userData.ment.gender || ''),
          phoneNum: personalData.contactNumber || userData.ment.phoneNum,
          address: personalData.address || userData.ment.address,
          course: personalData.program || userData.ment.course,
          department: 'College of Computer Studies',
          year: personalData.yearLevel || userData.ment.year,
          subjects: JSON.stringify(profileData.courseOffered.length ? profileData.courseOffered : userData.ment.subjects || []),
          proficiency: profileData.proficiencyLevel || userData.ment.proficiency,
          learn_modality: profileData.teachingModality || userData.ment.learn_modality,
          teach_sty: JSON.stringify((profileData.teachingStyle?.length ? profileData.teachingStyle : userData.ment.teach_sty || []).filter(Boolean)),
          availability: JSON.stringify((profileData.daysOfAvailability?.length ? profileData.daysOfAvailability : userData.ment.availability || []).filter(Boolean)),
          prefSessDur: profileData.preferredSessionDuration || userData.ment.prefSessDur,
          bio: profileData.shortBio || userData.ment.bio,
          exp: profileData.tutoringExperience || userData.ment.exp,
        }),
      });

      if (response.ok) {
        alert('Changes saved successfully!');
        
        // Update the user data with new values
        const updatedUserData: UserData = {
          ...userData,
          user: {
            ...userData.user,
            name: userData.user.name, // Name remains the same
          },
          ment: {
            ...userData.ment,
            gender: capitalizeFirstLetter(personalData.gender || userData.ment.gender || ''),
            phoneNum: personalData.contactNumber || userData.ment.phoneNum,
            address: personalData.address || userData.ment.address,
            course: personalData.program || userData.ment.course,
            year: personalData.yearLevel || userData.ment.year,
            subjects: profileData.courseOffered.length ? profileData.courseOffered : userData.ment.subjects || [],
            proficiency: profileData.proficiencyLevel || userData.ment.proficiency,
            learn_modality: profileData.teachingModality || userData.ment.learn_modality,
            teach_sty: profileData.teachingStyle?.length ? profileData.teachingStyle : userData.ment.teach_sty || [],
            availability: profileData.daysOfAvailability?.length ? profileData.daysOfAvailability : userData.ment.availability || [],
            prefSessDur: profileData.preferredSessionDuration || userData.ment.prefSessDur,
            bio: profileData.shortBio || userData.ment.bio,
            exp: profileData.tutoringExperience || userData.ment.exp,
          },
        };
        
        onSave(updatedUserData);
      } else {
        alert('An error occurred while saving changes.');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('An error occurred while saving changes.');
    }
  };

  const closeEditInformation = () => {
    onCancel();
  };

  return (
    <>
      {/* Background Overlay */}
      <div className="edit-information-overlay" onClick={closeEditInformation} />
      
      {/* Edit Information Modal */}
      <div className="edit-information-modal" ref={dropdownRef}>
        <div className="edit-information">
          <div className="upper-element">
            <h1>Edit Information</h1>
            <img 
              src="/exit.svg" 
              alt="exit" 
              className="exit-icon"
              onClick={closeEditInformation}
            />
          </div>
          <div className="lower-element">
            <div className="personal-information">
              <h1>I. PERSONAL INFORMATION</h1>
              <div className="input-wrapper">
                {inputFieldPersonalInformation.map((item, index) => (
                  <div key={index} className="input-fields">
                    <label>{item.field}</label>

                    {item.type === 'text' ? (
                      <>
                        <input
                          type="text"
                          value={personalData[toCamelCase(item.field) as keyof typeof personalData] as string}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setPersonalData(prev => ({ ...prev, [toCamelCase(item.field)]: newValue }));
                            validateField(toCamelCase(item.field), newValue);
                          }}
                          className={`standard-input ${validationErrors[toCamelCase(item.field)] ? 'input-error' : ''}`}
                          placeholder={getPlaceholder(item.field, 'personal') || `Enter your ${item.field.toLowerCase()}`}
                        />
                        {validationErrors[toCamelCase(item.field)] && (
                          <span className="error-message">
                            {validationErrors[toCamelCase(item.field)]}
                          </span>
                        )}
                      </>
                    ) : item.type === 'select' && item.field !== 'Gender' ? (
                      <div className="custom-dropdown">
                        <div
                          className="dropdown-container"
                          onClick={() => toggleDropdown(toCamelCase(item.field))}
                        >
                          <input
                            type="text"
                            value={personalData[toCamelCase(item.field) as keyof typeof personalData] as string}
                            placeholder={getPlaceholder(item.field, 'personal') || `Select ${item.field.toLowerCase()}`}
                            readOnly
                            className="standard-input"
                          />
                          <i className={`dropdown-icon ${dropdownOpen[toCamelCase(item.field)] ? 'open' : ''}`}>▼</i>
                        </div>
                        {dropdownOpen[toCamelCase(item.field)] && (
                          <div className="dropdown-options">
                            {item.options.map((option, i) => (
                              <div
                                key={i}
                                className="dropdown-option"
                                onClick={() => selectOption(toCamelCase(item.field), option, 'personal')}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* Gender Dropdown */}
                <div className="input-fields">
                  <label>Sex at Birth</label>
                  <div className="gender-section">
                    <div className="gender-dropdown">
                      <div
                        className="dropdown-container"
                        onClick={() => toggleDropdown('gender')}
                      >
                        <input
                          type="text"
                          value={personalData.gender}
                          placeholder={capitalizeFirstLetter(userData.ment.gender || '') || 'Select your sex at birth'}
                          className="standard-input"
                          readOnly
                        />
                        <i className={`dropdown-icon ${dropdownOpen.gender ? 'open' : ''}`}>▼</i>
                      </div>
                      {dropdownOpen.gender && (
                        <div className="dropdown-options gender-options">
                          <div className="dropdown-option" onClick={() => selectGender('Female')}>
                            Female
                          </div>
                          <div className="dropdown-option" onClick={() => selectGender('Male')}>
                            Male
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-information">
              <h1>II. PROFILE INFORMATION</h1>
              <div className="input-wrapper">
                {inputFieldProfileInformation.map((item, index) => (
                  <div key={index} className="input-fields">
                    <label>{item.field}</label>

                    {item.type === 'select' && item.field !== 'Course Offered' ? (
                      <div className="custom-dropdown">
                        <div
                          className="dropdown-container"
                          onClick={() => toggleDropdown(toCamelCase(item.field))}
                        >
                          <input
                            type="text"
                            value={profileData[toCamelCase(item.field) as keyof typeof profileData] as string}
                            placeholder={getPlaceholder(item.field, 'profile') || `Select ${item.field.toLowerCase()}`}
                            readOnly
                            className="standard-input"
                          />
                          <i className={`dropdown-icon ${dropdownOpen[toCamelCase(item.field)] ? 'open' : ''}`}>▼</i>
                        </div>
                        {dropdownOpen[toCamelCase(item.field)] && (
                          <div className="dropdown-options">
                            {item.options.map((option, i) => (
                              <div
                                key={i}
                                className="dropdown-option"
                                onClick={() => selectOption(toCamelCase(item.field), option)}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : item.field === 'Course Offered' ? (
                      <div className="custom-dropdown">
                        <div
                          className="dropdown-container"
                          onClick={() => toggleDropdown(toCamelCase(item.field))}
                        >
                          <input
                            type="text"
                            value={getDisplayValue('courseOffered')}
                            placeholder={getPlaceholder(item.field, 'profile')}
                            readOnly
                            className="standard-input"
                          />
                          <i className={`dropdown-icon ${dropdownOpen[toCamelCase(item.field)] ? 'open' : ''}`}>▼</i>
                        </div>
                        {dropdownOpen[toCamelCase(item.field)] && (
                          <div className="dropdown-options checkbox-options">
                            {availableSubjects.coreSubjects.length > 0 && (
                              <div className="category-section">
                                <h4>Core Subjects</h4>
                                {availableSubjects.coreSubjects.map((option, i) => (
                                  <div key={`core-${i}`} className="checkbox-option">
                                    <input
                                      type="checkbox"
                                      id={`core-${i}`}
                                      value={option}
                                      checked={profileData.courseOffered.includes(option)}
                                      onChange={() => handleCourseOfferedChange(option)}
                                    />
                                    <label htmlFor={`core-${i}`}>{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {availableSubjects.gecSubjects.length > 0 && (
                              <div className="category-section">
                                <h4>GEC Subjects</h4>
                                {availableSubjects.gecSubjects.map((option, i) => (
                                  <div key={`gec-${i}`} className="checkbox-option">
                                    <input
                                      type="checkbox"
                                      id={`gec-${i}`}
                                      value={option}
                                      checked={profileData.courseOffered.includes(option)}
                                      onChange={() => handleCourseOfferedChange(option)}
                                    />
                                    <label htmlFor={`gec-${i}`}>{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {availableSubjects.peNstpSubjects.length > 0 && (
                              <div className="category-section">
                                <h4>NSTP & PE Subjects</h4>
                                {availableSubjects.peNstpSubjects.map((option, i) => (
                                  <div key={`pe-${i}`} className="checkbox-option">
                                    <input
                                      type="checkbox"
                                      id={`pe-${i}`}
                                      value={option}
                                      checked={profileData.courseOffered.includes(option)}
                                      onChange={() => handleCourseOfferedChange(option)}
                                    />
                                    <label htmlFor={`pe-${i}`}>{option}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : item.type === 'checkbox' ? (
                      <div className="custom-dropdown">
                        <div
                          className="dropdown-container"
                          onClick={() => toggleDropdown(toCamelCase(item.field))}
                        >
                          <input
                            type="text"
                            value={getDisplayValue(toCamelCase(item.field))}
                            placeholder={getPlaceholder(item.field, 'profile')}
                            readOnly
                            className="standard-input"
                          />
                          <i className={`dropdown-icon ${dropdownOpen[toCamelCase(item.field)] ? 'open' : ''}`}>▼</i>
                        </div>
                        {dropdownOpen[toCamelCase(item.field)] && (
                          <div className="dropdown-options checkbox-options">
                            {item.options.map((option, i) => (
                              <div key={i} className="checkbox-option">
                                <input
                                  type="checkbox"
                                  id={`${toCamelCase(item.field)}-${i}`}
                                  value={option.value}
                                  checked={profileData[toCamelCase(item.field) as keyof typeof profileData].includes(option.value)}
                                  onChange={() => selectOption(toCamelCase(item.field), option.value)}
                                />
                                <label htmlFor={`${toCamelCase(item.field)}-${i}`}>
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="bio-experience-wrapper">
              <div className="bio-experience-grid">
                {bioAndExperienceFields.map((item, index) => (
                  <div key={`bio-${index}`} className="input-fields">
                    <label>{item.field}</label>
                    <textarea
                      value={profileData[toCamelCase(item.field) as keyof typeof profileData] as string}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setProfileData(prev => ({ ...prev, [toCamelCase(item.field)]: newValue }));
                        validateField(toCamelCase(item.field), newValue);
                      }}
                      className={`fixed-textarea ${validationErrors[toCamelCase(item.field)] ? 'input-error' : ''}`}
                      placeholder={getPlaceholder(item.field, 'profile') || 
                        (item.field === 'Short Bio' ? 'Tell us about yourself' : 'Describe your tutoring experience')}
                    />
                    {validationErrors[toCamelCase(item.field)] && (
                      <span className="error-message">
                        {validationErrors[toCamelCase(item.field)]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="save">
            <button className="save-button" onClick={saveChanges}>Save Changes</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Background Overlay */
        .edit-information-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1999;
        }

        /* Modal Container */
        .edit-information-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .edit-information {
          width: 500px !important;
          max-height: 700px;
          height: 700px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          border-radius: 20px;
          background-color: white;
        }

        .upper-element {
          display: flex;
          flex-direction: row;
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          justify-content: center;
          align-items: center;
          padding: 15px 20px;
          border-radius: 20px 20px 0 0;
          position: relative;
        }

        .upper-element h1 {
          font-size: 24px;
          color: #ffffff;
          margin: 0;
        }

        .exit-icon {
          position: absolute;
          right: 20px;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .lower-element {
          padding: 0 20px;
          background-color: white;
          overflow-y: auto;
          flex: 1;
        }

        .lower-element h1 {
          font-size: 17px;
          color: #0c434d;
          margin-bottom: 20px;
        }

        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .input-fields {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }

        .input-fields label {
          color: #116174;
          margin-bottom: 5px;
          font-size: 13px;
        }

        .standard-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #0c434d;
          font-size: 12px;
          color: #0c434d;
          background-color: #d9d9d9;
          box-sizing: border-box;
          height: 35px;
        }

        .personal-information,
        .profile-information {
          padding: 0 0 20px 0;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }

        .custom-dropdown {
          position: relative;
          width: 100%;
        }

        .gender-section {
          position: relative;
          width: 100%;
        }

        .gender-dropdown {
          position: relative;
          width: 100%;
        }

        .dropdown-container {
          position: relative;
          cursor: pointer;
        }

        .dropdown-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          transition: transform 0.2s;
          color: #0c434d;
          pointer-events: none;
        }

        .dropdown-icon.open {
          transform: translateY(-50%) rotate(180deg);
        }

        .dropdown-options {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 200px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ddd;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .gender-options {
          z-index: 1001;
        }

        .dropdown-option {
          padding: 8px 10px;
          cursor: pointer;
          color: #0c434d;
          font-size: 12px;
        }

        .dropdown-option:hover {
          background-color: #f0f0f0;
        }

        .checkbox-options {
          padding: 5px;
        }

        .checkbox-option {
          display: flex;
          align-items: center;
          padding: 5px 10px;
          cursor: pointer;
        }

        .checkbox-option:hover {
          background-color: #f0f0f0;
        }

        .checkbox-option input[type="checkbox"] {
          margin-right: 8px;
          cursor: pointer;
        }

        .checkbox-option label {
          font-size: 12px;
          color: #0c434d;
          cursor: pointer;
        }

        .category-section {
          padding: 5px 10px;
          border-bottom: 1px solid #eee;
        }

        .category-section h4 {
          margin: 5px 0;
          color: #0c434d;
          font-size: 12px;
          font-weight: bold;
        }

        .bio-experience-wrapper {
          margin-top: 20px;
        }

        .bio-experience-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .fixed-textarea {
          border-radius: 10px;
          border: 1px solid #0c434d;
          font-size: 12px;
          color: #0c434d;
          background-color: #d9d9d9;
          padding: 8px 10px;
          height: 70px;
          width: 100%;
          resize: none;
          box-sizing: border-box;
        }

        .save {
          display: flex;
          justify-content: flex-end;
          padding: 10px;
          border-radius: 0 0 20px 20px !important;
        }

        .save-button {
          background-color: #006981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
        }

        .input-error {
          border-color: #f87171;
          background-color: #fff1f2;
          outline: none;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .edit-information {
            width: calc(80vw - 30px) !important;
            height: 85vh;
            max-height: 85vh;
            margin-right: 10px;
            border-radius: 15px;
          }

          .upper-element {
            padding: 12px 15px;
            border-radius: 15px 15px 0 0;
          }

          .upper-element h1 {
            font-size: 20px;
          }

          .exit-icon {
            right: 15px;
            width: 18px;
            height: 18px;
          }

          .lower-element {
            padding: 0 15px;
            max-height: calc(85vh - 120px);
            overflow-y: auto;
          }

          .input-wrapper {
            gap: 12px;
          }

          .input-fields {
            margin-bottom: 12px;
          }

          .standard-input,
          .dropdown-option,
          .checkbox-option label,
          .category-section h4,
          .fixed-textarea {
            font-size: 11px;
          }

          .save-button {
            padding: 8px 16px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .edit-information {
            width: calc(95vw - 10px) !important;
            margin-right: 5px;
            height: 90vh;
            max-height: 90vh;
          }

          .upper-element h1 {
            font-size: 18px;
          }

          .lower-element {
            max-height: calc(90vh - 120px);
          }

          .lower-element h1 {
            font-size: 15px;
            margin-bottom: 15px;
          }
        }
      `}</style>
    </>
  );
}