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

interface InputField {
  field: string;
  type: string;
  options?: string[] | { label: string; value: string }[];
}

export default function EditInformationComponent({ 
  userData, 
  onSave, 
  onCancel 
}: EditInformationComponentProps) {
  // Personal Data State
  const [personalData, setPersonalData] = useState({
    fullName: '',
    yearLevel: '',
    program: '',
    address: '',
    contactNumber: '',
    gender: '',
  });

  // Profile Data State
  const [profileData, setProfileData] = useState({
    courseOffered: [] as string[],
    teachingModality: '',
    daysOfAvailability: [] as string[],
    proficiencyLevel: '',
    teachingStyle: [] as string[],
    preferredSessionDuration: '',
    shortBio: '',
    tutoringExperience: '',
  });

  // UI State
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const [availableSubjects, setAvailableSubjects] = useState({
    coreSubjects: [] as string[],
    gecSubjects: [] as string[],
    peNstpSubjects: [] as string[],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Constants - Same as Vue component
  const yearLevelOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const programOptions = [
    "Bachelor of Science in Information Technology (BSIT)",
    "Bachelor of Science in Computer Science (BSCS)",
    "Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)",
  ];
  const genderOptions = ["Male", "Female"];
  const teachingModalityOptions = ["Online", "In-person", "Hybrid"];
  const proficiencyOptions = ["Beginner", "Intermediate", "Advanced"];
  const durationOptions = ["1 hour", "2 hours", "3 hours"];

  const daysOptions = [
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
    { label: "Sunday", value: "Sunday" },
  ];

  const teachingStyleOptions = [
    { label: "Lecture-Based", value: "Lecture-Based" },
    { label: "Interactive Discussion", value: "Interactive Discussion" },
    { label: "Q&A Session", value: "Q&A Session" },
    { label: "Demonstration", value: "Demonstration" },
    { label: "Project-based", value: "Project-based" },
    { label: "Step-by-step process", value: "Step-by-step process" },
  ];

  const inputFieldPersonalInformation: InputField[] = [
    { field: "Year Level", type: "select", options: yearLevelOptions },
    { field: "Program", type: "select", options: programOptions },
    { field: "Address", type: "text" },
    { field: "Contact Number", type: "text" },
  ];

  const inputFieldProfileInformation: InputField[] = [
    { field: "Teaching Modality", type: "select", options: teachingModalityOptions },
    { field: "Days of Availability", type: "checkbox", options: daysOptions },
    { field: "Proficiency Level", type: "select", options: proficiencyOptions },
    { field: "Teaching Style", type: "checkbox", options: teachingStyleOptions },
    { field: "Preferred Session Duration", type: "select", options: durationOptions },
    { field: "Course Offered", type: "select" },
  ];

  const bioAndExperienceFields = [
    { field: "Short Bio", column: 1 },
    { field: "Tutoring Experience", column: 2 },
  ];

  // Helper Functions
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "Not specified";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  const getPlaceholder = (field: string, section: 'personal' | 'profile') => {
    const mappings = {
      personal: {
        "Full Name": userData.user.name,
        "Year Level": userData.ment.year,
        "Program": userData.ment.course,
        "Address": userData.ment.address,
        "Contact Number": userData.ment.phoneNum,
        "Sex at Birth": capitalizeFirstLetter(userData.ment.gender || ''),
      },
      profile: {
        "Teaching Modality": userData.ment.learn_modality || '',
        "Days of Availability": userData.ment.availability?.join(", ") || '',
        "Proficiency Level": userData.ment.proficiency,
        "Teaching Style": userData.ment.teach_sty?.join(", ") || '',
        "Preferred Session Duration": userData.ment.prefSessDur,
        "Course Offered": userData.ment.subjects?.join(", ") || '',
        "Short Bio": userData.ment.bio,
        "Tutoring Experience": userData.ment.exp,
      },
    };

    return mappings[section][field as keyof typeof mappings[section]] || '';
  };

  const isOptionChecked = (field: string, value: string) => {
    switch (field) {
      case "Days of Availability":
        return userData.ment.availability?.includes(value);
      case "Teaching Style":
        return userData.ment.teach_sty?.includes(value);
      default:
        return false;
    }
  };

  // Update Available Subjects - Same logic as Vue component
  const updateAvailableSubjects = (program: string) => {
    const selectedProgram = program || userData.ment.course;

    switch (selectedProgram) {
      case "Bachelor of Science in Information Technology (BSIT)":
        setAvailableSubjects({
          coreSubjects: [
            "Application Development and Emerging Technologies",
            "Business Analytics",
            "Computer Programming 1",
            "Computer Programming 2",
            "Data Structures and Algorithms",
            "Digital Design with Multimedia Systems",
            "Discrete Structures 1",
            "Event Driven Programming",
            "Fundamentals of Database Systems",
            "Information Assurance and Security 1",
            "Information Assurance and Security 2",
            "Information Management 1",
            "Integrative Programming and Technologies",
            "Introduction to Computing",
            "Introduction to Human-Computer Interaction",
            "IT Elective 1",
            "IT Elective 2",
            "IT Elective 3",
            "IT Elective 4",
            "IT Elective 5",
            "IT Research Methods",
            "IT Seminars and Educational Trips",
            "Networking 1",
            "Networking 2",
            "Object-Oriented Programming",
            "PC Troubleshooting with Basic Electronics",
            "Platform Technologies",
            "Quantitative Methods (Inc. Modelling & Simulation)",
            "Social Issues and Professional Practice in Computing",
            "System Administration and Maintenance",
            "Systems Integration and Architecture 1",
          ],
          gecSubjects: [
            "Art Appreciation",
            "Ethics",
            "Mathematics in the Modern World",
            "People and Earth's Ecosystem",
            "Purposive Communication",
            "Reading Visual Arts",
            "Readings in Philippine History with Indigenous People Studies",
            "Science, Technology and Society",
            "The Contemporary World with Peace Studies",
            "The Entrepreneurial Mind",
            "The Life and Works of Rizal",
            "Understanding the Self",
          ],
          peNstpSubjects: [
            "National Service Training Program with Anti-Smoking and Environmental Education",
            "National Service Training Program with GAD and Peace Education",
            "Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency",
            "Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities",
            "Physical Activities Toward Health and Fitness 3 (PATHFit 3)",
            "Physical Activities Toward Health and Fitness 4 (PATHFit 4)",
          ],
        });
        break;

      case "Bachelor of Science in Computer Science (BSCS)":
        setAvailableSubjects({
          coreSubjects: [
            "Computer Programming 1",
            "Computer Programming 2",
            "Introduction to Computing",
            "PC Troubleshooting with Basic Electronics",
            "Data Structures and Algorithms",
            "Algorithms and Complexity 1",
            "Software Engineering 1",
            "Software Engineering 2",
            "Operating Systems",
            "Object-Oriented Programming",
            "Information Management 1",
            "Discrete Structures 1",
            "Discrete Structures 2",
            "Principles of Statistics and Probability",
            "Graphics and Visual Computing",
            "Automata Theory",
            "Intelligent Systems",
            "Programming Languages",
            "Parallel and Distributed Computing",
            "Architecture and Organization",
            "Information Assurance and Security",
            "CS Thesis Writing 1",
            "CS Thesis Writing 2",
            "CS Elective 1",
            "CS Elective 2",
            "CS Elective 3",
            "CS Elective 4",
            "CS Elective 5",
            "CS Seminars and Educational Trips",
          ],
          gecSubjects: [
            "Art Appreciation",
            "Ethics",
            "Mathematics in the Modern World",
            "People and Earth's Ecosystem",
            "Purposive Communication",
            "Reading Visual Arts",
            "Readings in Philippine History with Indigenous People Studies",
            "Science, Technology and Society",
            "The Contemporary World with Peace Studies",
            "The Entrepreneurial Mind",
            "The Life and Works of Rizal",
            "Understanding the Self",
          ],
          peNstpSubjects: [
            "National Service Training Program 1",
            "National Service Training Program 2",
            "Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency",
            "Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities",
            "Physical Activities Toward Health and Fitness 3 (PATHFit 3)",
            "Physical Activities Toward Health and Fitness 4 (PATHFit 4)",
          ],
        });
        break;

      case "Bachelor of Science in Entertainment and Multimedia Computing (BSEMC)":
        setAvailableSubjects({
          coreSubjects: [
            "Introduction to EM Computing",
            "Computer Programming 1",
            "PC Troubleshooting with Basic Electronics",
            "Computer Programming 2",
            "Usability, HCI, UI Design",
            "Free Hand and Digital Drawing",
            "Data Structures and Algorithms",
            "Information Management 1",
            "Introduction to Game Design and Development",
            "Computer Graphics Programming",
            "Image and Video Processing",
            "Script Writing and Storyboard Design",
            "Applications Development and Emerging Technologies",
            "Principles of 2D Animation",
            "Audio Design and Sound Engineering Modelling and Rigging",
            "Texture and Mapping",
            "Social Issues and Professional Practice in Computing",
            "Lighting and Effects",
            "Principles of 3D Animation",
            "Design and Production Process",
            "Advanced Sound Production",
            "Advanced 2D Animation",
            "EMC Professional Elective 1",
            "Research Methods",
            "Advanced 3D Animation and Scripting",
            "Compositing and Rendering",
            "EMC Professional Elective 2",
            "Animation Design and Production",
            "EMC Professional Elective 3",
            "Computing Seminars and Educational Trips",
          ],
          gecSubjects: [
            "Art Appreciation",
            "Ethics",
            "Mathematics in the Modern World",
            "People and Earth's Ecosystem",
            "Purposive Communication",
            "Reading Visual Arts",
            "Readings in Philippine History with Indigenous People Studies",
            "Science, Technology and Society",
            "The Contemporary World with Peace Studies",
            "The Entrepreneurial Mind",
            "The Life and Works of Rizal",
            "Understanding the Self",
          ],
          peNstpSubjects: [
            "National Service Training Program with Anti-Smoking and Environmental Education",
            "National Service Training Program with GAD and Peace Education",
            "Physical Activities Toward Health and Fitness 1 (PATHFit 1): Movement Competency",
            "Physical Activities Toward Health and Fitness 2 (PATHFit 2): Exercise-Based Fitness Activities",
            "Physical Activities Toward Health and Fitness 3 (PATHFit 3)",
            "Physical Activities Toward Health and Fitness 4 (PATHFit 4)",
          ],
        });
        break;

      default:
        setAvailableSubjects({ coreSubjects: [], gecSubjects: [], peNstpSubjects: [] });
    }
  };

  // Dropdown Handlers
  const toggleDropdown = (field: string) => {
    setDropdownOpen(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === field ? !prev[key] : false;
      });
      newState[field] = !prev[field];
      return newState;
    });
  };

  const selectOption = (field: string, value: string, section: 'personal' | 'profile' = 'profile') => {
    if (section === 'personal') {
      setPersonalData(prev => ({ ...prev, [field]: value }));
    } else {
      if (Array.isArray((profileData as any)[field])) {
        const currentArray = (profileData as any)[field];
        const index = currentArray.indexOf(value);
        let newArray;
        
        if (index === -1) {
          newArray = [...currentArray, value];
        } else {
          newArray = currentArray.filter((item: string) => item !== value);
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

  // Input Handlers
  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleProfileDataChange = (field: string, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      validateField(field, value);
    }
  };

  const handleCourseOfferedChange = (subject: string, isChecked: boolean) => {
    setProfileData(prev => {
      const currentSubjects = prev.courseOffered;
      let newSubjects;
      
      if (isChecked) {
        newSubjects = [...currentSubjects, subject];
      } else {
        newSubjects = currentSubjects.filter(s => s !== subject);
      }
      
      return { ...prev, courseOffered: newSubjects };
    });
  };

  // Validation - Same as Vue component
  const validateField = (field: string, value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return;
    }

    let error = '';
    
    switch (field) {
      case "shortBio":
        if (trimmedValue.length < 20) {
          error = "Short Bio should be at least 20 characters.";
        }
        break;

      case "tutoringExperience":
        if (trimmedValue.length < 10) {
          error = "Tutoring Experience should be at least 10 characters.";
        }
        break;

      case "contactNumber":
        if (trimmedValue.length !== 11) {
          error = "Contact Number should be 11 digits.";
        } else if (!/^\d+$/.test(trimmedValue)) {
          error = "Contact Number should contain only digits.";
        }
        break;

      case "address":
        if (trimmedValue.length < 10) {
          error = "Address should be at least 10 characters.";
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

  // Save Changes - Same structure as Vue component
  const saveChanges = async () => {
    const updatedUserData: UserData = {
      ...userData,
      user: {
        ...userData.user,
        name: personalData.fullName || userData.user.name,
      },
      ment: {
        ...userData.ment,
        gender: personalData.gender || userData.ment.gender || '',
        phoneNum: personalData.contactNumber || userData.ment.phoneNum,
        address: personalData.address || userData.ment.address,
        course: personalData.program || userData.ment.course,
        year: personalData.yearLevel || userData.ment.year,
        subjects: profileData.courseOffered.length ? profileData.courseOffered : userData.ment.subjects,
        proficiency: profileData.proficiencyLevel || userData.ment.proficiency,
        learn_modality: profileData.teachingModality || userData.ment.learn_modality || '',
        teach_sty: profileData.teachingStyle.length ? profileData.teachingStyle : userData.ment.teach_sty,
        availability: profileData.daysOfAvailability.length ? profileData.daysOfAvailability : userData.ment.availability,
        prefSessDur: profileData.preferredSessionDuration || userData.ment.prefSessDur,
        bio: profileData.shortBio || userData.ment.bio,
        exp: profileData.tutoringExperience || userData.ment.exp,
      }
    };

    onSave(updatedUserData);
  };

  // Initialize data from props
  useEffect(() => {
    setPersonalData({
      fullName: userData.user.name,
      yearLevel: userData.ment.year,
      program: userData.ment.course,
      address: userData.ment.address,
      contactNumber: userData.ment.phoneNum,
      gender: userData.ment.gender || '',
    });

    setProfileData({
      courseOffered: userData.ment.subjects || [],
      teachingModality: userData.ment.learn_modality || '',
      daysOfAvailability: userData.ment.availability || [],
      proficiencyLevel: userData.ment.proficiency,
      teachingStyle: userData.ment.teach_sty || [],
      preferredSessionDuration: userData.ment.prefSessDur,
      shortBio: userData.ment.bio,
      tutoringExperience: userData.ment.exp,
    });

    updateAvailableSubjects(userData.ment.course);
  }, [userData]);

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

  // Render Components
  const renderTextInput = (field: string, section: 'personal' | 'profile') => {
    const camelField = toCamelCase(field);
    const value = section === 'personal' 
      ? (personalData as any)[camelField] 
      : (profileData as any)[camelField];

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => section === 'personal' 
          ? handlePersonalDataChange(camelField, e.target.value)
          : handleProfileDataChange(camelField, e.target.value)
        }
        className={`standard-input ${validationErrors[camelField] ? 'input-error' : ''}`}
        placeholder={getPlaceholder(field, section) || `Enter ${field.toLowerCase()}`}
      />
    );
  };

  const renderSelectDropdown = (field: string, options: string[], section: 'personal' | 'profile') => {
    const camelField = toCamelCase(field);
    const value = section === 'personal' 
      ? (personalData as any)[camelField] 
      : (profileData as any)[camelField];

    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <div className="dropdown-container" onClick={() => toggleDropdown(camelField)}>
          <input
            type="text"
            value={value}
            placeholder={getPlaceholder(field, section) || `Select ${field.toLowerCase()}`}
            readOnly
            className="standard-input"
          />
          <i className={`dropdown-icon ${dropdownOpen[camelField] ? 'open' : ''}`}>▼</i>
        </div>
        {dropdownOpen[camelField] && (
          <div className="dropdown-options">
            {options.map((option, i) => (
              <div
                key={i}
                className="dropdown-option"
                onClick={() => selectOption(camelField, option, section)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCheckboxDropdown = (field: string, options: any[]) => {
    const camelField = toCamelCase(field);
    const values = (profileData as any)[camelField] || [];

    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <div className="dropdown-container" onClick={() => toggleDropdown(camelField)}>
          <input
            type="text"
            value={values.join(", ")}
            placeholder={getPlaceholder(field, 'profile')}
            readOnly
            className="standard-input"
          />
          <i className={`dropdown-icon ${dropdownOpen[camelField] ? 'open' : ''}`}>▼</i>
        </div>
        {dropdownOpen[camelField] && (
          <div className="dropdown-options checkbox-options">
            {options.map((option: any, i: number) => (
              <div key={i} className="checkbox-option" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  id={`${camelField}-${i}`}
                  value={option.value}
                  checked={values.includes(option.value)}
                  onChange={(e) => selectOption(camelField, option.value)}
                />
                <label htmlFor={`${camelField}-${i}`}>{option.label}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCourseOfferedDropdown = () => {
    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <div className="dropdown-container" onClick={() => toggleDropdown('courseOffered')}>
          <input
            type="text"
            value={profileData.courseOffered.join(", ")}
            placeholder={getPlaceholder('Course Offered', 'profile')}
            readOnly
            className="standard-input"
          />
          <i className={`dropdown-icon ${dropdownOpen.courseOffered ? 'open' : ''}`}>▼</i>
        </div>
        {dropdownOpen.courseOffered && (
          <div className="dropdown-options checkbox-options">
            {availableSubjects.coreSubjects.length > 0 && (
              <div className="category-section">
                <h4>Core Subjects</h4>
                {availableSubjects.coreSubjects.map((subject, i) => (
                  <div key={`core-${i}`} className="checkbox-option" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      id={`core-${i}`}
                      checked={profileData.courseOffered.includes(subject)}
                      onChange={(e) => handleCourseOfferedChange(subject, e.target.checked)}
                    />
                    <label htmlFor={`core-${i}`}>{subject}</label>
                  </div>
                ))}
              </div>
            )}

            {availableSubjects.gecSubjects.length > 0 && (
              <div className="category-section">
                <h4>GEC Subjects</h4>
                {availableSubjects.gecSubjects.map((subject, i) => (
                  <div key={`gec-${i}`} className="checkbox-option" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      id={`gec-${i}`}
                      checked={profileData.courseOffered.includes(subject)}
                      onChange={(e) => handleCourseOfferedChange(subject, e.target.checked)}
                    />
                    <label htmlFor={`gec-${i}`}>{subject}</label>
                  </div>
                ))}
              </div>
            )}

            {availableSubjects.peNstpSubjects.length > 0 && (
              <div className="category-section">
                <h4>NSTP & PE Subjects</h4>
                {availableSubjects.peNstpSubjects.map((subject, i) => (
                  <div key={`pe-${i}`} className="checkbox-option" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      id={`pe-${i}`}
                      checked={profileData.courseOffered.includes(subject)}
                      onChange={(e) => handleCourseOfferedChange(subject, e.target.checked)}
                    />
                    <label htmlFor={`pe-${i}`}>{subject}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGenderDropdown = () => {
    return (
      <div className="gender-dropdown" ref={dropdownRef}>
        <div className="dropdown-container" onClick={() => toggleDropdown('gender')}>
          <input
            type="text"
            value={personalData.gender}
            placeholder={getPlaceholder('Sex at Birth', 'personal') || 'Select your sex at birth'}
            readOnly
            className="standard-input"
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
    );
  };

  return (
    <div className="edit-information-popup">
      <div className="popup-overlay" onClick={onCancel}></div>
      <div className="edit-information">
        <div className="upper-element">
          <h1>Edit Information</h1>
          <img 
            src="/exit.svg" 
            alt="exit" 
            onClick={onCancel}
          />
        </div>
        
        <div className="lower-element">
          <div className="personal-information">
            <h1>I. PERSONAL INFORMATION</h1>
            <div className="input-wrapper">
              {inputFieldPersonalInformation.map((item, index) => (
                <div key={index} className="input-fields">
                  <label>{item.field}</label>
                  
                  {item.type === 'text' && renderTextInput(item.field, 'personal')}
                  
                  {item.type === 'select' && item.field !== 'Sex at Birth' && 
                   renderSelectDropdown(item.field, item.options as string[], 'personal')}
                  
                  {item.field === 'Sex at Birth' && renderGenderDropdown()}
                  
                  {validationErrors[toCamelCase(item.field)] && (
                    <span className="error-message">
                      {validationErrors[toCamelCase(item.field)]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="profile-information">
            <h1>II. PROFILE INFORMATION</h1>
            <div className="input-wrapper">
              {inputFieldProfileInformation.map((item, index) => (
                <div key={index} className="input-fields">
                  <label>{item.field}</label>
                  
                  {item.type === 'text' && renderTextInput(item.field, 'profile')}
                  
                  {item.type === 'select' && item.field !== 'Course Offered' && 
                   renderSelectDropdown(item.field, item.options as string[], 'profile')}
                  
                  {item.field === 'Course Offered' && renderCourseOfferedDropdown()}
                  
                  {item.type === 'checkbox' && item.field !== 'Course Offered' && 
                   renderCheckboxDropdown(item.field, item.options as any[])}
                </div>
              ))}
            </div>
          </div>

          <div className="bio-experience-wrapper">
            <div className="bio-experience-grid">
              {bioAndExperienceFields.map((item, index) => {
                const camelField = toCamelCase(item.field);
                return (
                  <div key={`bio-${index}`} className="input-fields">
                    <label>{item.field}</label>
                    <textarea
                      value={(profileData as any)[camelField]}
                      onChange={(e) => handleProfileDataChange(camelField, e.target.value)}
                      className={`fixed-textarea ${validationErrors[camelField] ? 'input-error' : ''}`}
                      placeholder={getPlaceholder(item.field, 'profile') || 
                        (item.field === 'Short Bio' 
                          ? 'Tell us about yourself' 
                          : 'Describe your tutoring experience')}
                    />
                    {validationErrors[camelField] && (
                      <span className="error-message">{validationErrors[camelField]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="save">
          <button onClick={saveChanges}>Save Changes</button>
        </div>
      </div>

      <style jsx>{`
        .edit-information-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .edit-information {
          position: relative;
          z-index: 10001;
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

        .upper-element img {
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

        .custom-dropdown, .gender-dropdown {
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
          margin-bottom: 0;
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
          font-family: inherit;
        }

        .save {
          display: flex;
          justify-content: flex-end;
          padding: 10px;
          border-radius: 0 0 20px 20px !important;
        }

        .save button {
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
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(calc(-50% - 30px), -50%);
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

          .upper-element img {
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

          .save button {
            padding: 8px 16px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .edit-information {
            transform: translate(calc(-50% - 15px), -50%);
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
    </div>
  );
}