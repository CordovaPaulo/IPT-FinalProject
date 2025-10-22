'use client';

import React, { useRef, useId } from 'react';
import Head from 'next/head';
import styles from './LearnerInfo.module.css';
import { useLearnerForm } from '@/hooks/info/useLearnerForm';
import { useKeyboardNavigation } from '@/hooks/info/useKeyboardNavigation';

const LearnerInfo = () => {
  const form = useLearnerForm();
  const keyboard = useKeyboardNavigation(form.currentStep);

  // Refs for form fields
  const addressRef = useRef<HTMLInputElement>(null);
  const contactNumberRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const yearLevelRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const profileUploadRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const modalityRef = useRef<HTMLDivElement>(null);
  const sessionDurationRef = useRef<HTMLDivElement>(null);
  const learningStyleRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const goalsRef = useRef<HTMLTextAreaElement>(null);

  // IDs
  const availabilityListboxId = useId();
  const modalityListboxId = useId();

  // Helper functions for keyboard navigation in dropdowns
  const handleOptionKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    const current = e.currentTarget;
    const options = Array.from(current.parentElement?.querySelectorAll<HTMLElement>('[role="option"]') || []);
    const idx = options.indexOf(current);

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const input = current.querySelector<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
      input?.click();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault();
      options[Math.min(idx + 1, options.length - 1)]?.focus();
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'Up') {
      e.preventDefault();
      options[Math.max(idx - 1, 0)]?.focus();
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      options[0]?.focus();
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      options[options.length - 1]?.focus();
      return;
    }
  };

  function focusFirstOption(listboxId: string) {
    const first = document.querySelector<HTMLElement>(`#${listboxId} [role="option"]`);
    first?.focus();
  }

  const handleComboboxKey =
    (toggleOpen: () => void, isOpen: boolean, listboxId: string) =>
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOpen();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        toggleOpen();
      } else if ((e.key === 'ArrowDown' || e.key === 'Down') && isOpen) {
        e.preventDefault();
        focusFirstOption(listboxId);
      }
    };

  return (
    <div 
      className={`${styles.root} ${styles['learnerinfo-container']}`} 
      ref={form.dropdownWrapperRef}
    >
      <Head>
        <title>Learner Information</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </Head>

      <button 
        ref={keyboard.backButtonRef}
        onClick={() => form.router.push('/auth/signup')} 
        className={styles['back-btn']}
        tabIndex={0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd"/>
        </svg>
        Back
      </button>

      <header className={styles['page-header']}>
        <h1>LEARNER INFO</h1>
        <p>Complete your profile to start learning.</p>
      </header>

      <div className={`${styles['form-container']} ${styles['scrollable-content']}`}>
        {form.currentStep === 1 && (
          <div>
            <h2 className={styles.title}>I. PERSONAL INFORMATION</h2>

            <div className={styles['personal-field']}>
              <label className={`${styles['personal-label']} ${styles.required}`} htmlFor="address">ADDRESS</label>
              <input
                ref={addressRef}
                type="text"
                id="address"
                value={form.address}
                onChange={(e) => {
                  form.setAddress(e.target.value);
                  form.handleFieldValidation('address', e.target.value);
                }}
                onBlur={() => form.handleFieldValidation('address', form.address)}
                placeholder="Enter your address"
                disabled={form.isSubmitting}
                className={`${styles['personal-input']} ${form.validationErrors.address ? styles.error : ''}`}
                tabIndex={0}
              />
              {form.validationErrors.address && (
                <span className={styles['validation-message']}>
                  {form.validationErrors.address}
                </span>
              )}
            </div>

            <div className={styles['personal-field']}>
              <label className={`${styles['personal-label']} ${styles.required}`} htmlFor="contact-number">
                CONTACT NUMBER
              </label>
              <input
                ref={contactNumberRef}
                type="text"
                id="contact-number"
                value={form.contactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  form.setContactNumber(value.slice(0, 11));
                  form.handleFieldValidation('contactNumber', value);
                }}
                onBlur={() => form.handleFieldValidation('contactNumber', form.contactNumber)}
                placeholder="Enter your contact number (11 digits)"
                disabled={form.isSubmitting}
                className={`${styles['personal-input']} ${form.validationErrors.contactNumber ? styles.error : ''}`}
                maxLength={11}
                tabIndex={0}
              />
              {form.validationErrors.contactNumber && (
                <span className={styles['validation-message']}>
                  {form.validationErrors.contactNumber}
                </span>
              )}
            </div>

            <div className={styles['personal-field']}>
              <label className={`${styles['personal-label']} ${styles.required}`} htmlFor="gender">
                SEX AT BIRTH
              </label>
              <div 
                ref={genderRef}
                className={styles['gender-dropdown']}
                tabIndex={0}
                onKeyDown={(e) => keyboard.handleDropdownKeyNavigation(e, 'gender', form.dropdownOpen.gender, () => form.toggleDropdown('gender'), genderRef)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('gender')}>
                  <input
                    type="text"
                    value={form.gender}
                    placeholder="Select your sex"
                    disabled={form.isSubmitting}
                    className={styles['personal-input']}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.gender && (
                  <div className={styles['dropdown-options']}>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleGenderSelect('Female')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleGenderSelect('Female');
                        }
                      }}
                    >
                      Female
                    </div>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleGenderSelect('Male')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleGenderSelect('Male');
                        }
                      }}
                    >
                      Male
                    </div>
                  </div>
                )}
                {form.validationErrors.gender && (
                  <span className={styles['validation-message']}>
                    {form.validationErrors.gender}
                  </span>
                )}
              </div>
            </div>

            <div className={styles['personal-field']}>
               <label className={`${styles['personal-label']} ${styles.required}`} htmlFor="year-level">YEAR LEVEL</label>
              <div 
                ref={yearLevelRef}
                className={styles['year-dropdown']}
                tabIndex={0}
                onKeyDown={(e) => keyboard.handleDropdownKeyNavigation(e, 'yearLevel', form.dropdownOpen.yearLevel, () => form.toggleDropdown('yearLevel'), yearLevelRef)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('yearLevel')}>
                  <input
                    type="text"
                    value={form.yearLevel}
                    placeholder="Select your year level"
                    disabled={form.isSubmitting}
                    className={styles['personal-input']}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.yearLevel && (
                  <div className={styles['dropdown-options']}>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleYearLevelSelect('1st Year')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleYearLevelSelect('1st Year');
                        }
                      }}
                    >
                      1st Year
                    </div>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleYearLevelSelect('2nd Year')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleYearLevelSelect('2nd Year');
                        }
                      }}
                    >
                      2nd Year
                    </div>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleYearLevelSelect('3rd Year')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleYearLevelSelect('3rd Year');
                        }
                      }}
                    >
                      3rd Year
                    </div>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleYearLevelSelect('4th Year')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleYearLevelSelect('4th Year');
                        }
                      }}
                    >
                      4th Year
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles['personal-field']}>
                <label className={`${styles['personal-label']} ${styles.required}`} htmlFor="program">PROGRAM</label>
              <div 
                ref={programRef}
                className={styles['program-dropdown']}
                tabIndex={0}
                onKeyDown={(e) => keyboard.handleDropdownKeyNavigation(e, 'program', form.dropdownOpen.program, () => form.toggleDropdown('program'), programRef)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('program')}>
                  <input
                    type="text"
                    value={form.program}
                    placeholder="Select your program"
                    className={styles['personal-input']}
                    disabled={form.isSubmitting}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.program && (
                  <div className={styles['dropdown-options']}>
                    {form.programs.map(programOption => (
                      <div
                        key={programOption}
                        className={styles['dropdown-option']}
                        onClick={() => form.handleProgramSelect(programOption)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            form.handleProgramSelect(programOption);
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

        {form.currentStep === 2 && (
          <div>
            <h2 className={styles.title}>II. PROFILE INFORMATION</h2>

            <div className={styles['upload-container']}>
              <div className={styles['profile-picture-upload']}>
                <label className={styles['profile-label']}>PROFILE PICTURE</label>
                <div 
                  ref={profileUploadRef}
                  className={styles['upload-controls']} 
                  onClick={form.uploadProfilePicture}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      form.uploadProfilePicture();
                    }
                  }}
                >
                  <div className={styles['profile-preview-container']}>
                    {form.profileImage ? (
                      <img src={form.profileImage} alt="Profile Preview" className={styles['profile-preview']} />
                    ) : (
                      <i className="fas fa-user-circle default-icon"></i>
                    )}
                  </div>
                  <div className={styles['upload-text']}>
                    <div className={styles['choose-file-container']}>
                      <i className="fas fa-upload"></i>
                      <span>Choose File</span>
                    </div>
                    <input type="file" ref={form.profileInputRef} accept="image/*" disabled={form.isSubmitting} className={styles['hidden-input']} onChange={form.handleProfileUpload} aria-label="Upload profile picture" />
                    <span className={styles['file-name']}>
                      {form.profilePictureName || 'No file chosen'}
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
                onKeyDown={handleComboboxKey(() => form.toggleDropdown('availability'), form.dropdownOpen.availability, availabilityListboxId)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('availability')}>
                  <input
                    type="text"
                    id="availability-days"
                    value={form.availabilityDaysDisplay}
                    placeholder="Select available days"
                    disabled={form.isSubmitting}
                    className={styles['profile-input']}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.availability && (
                  <div
                    id={availabilityListboxId}
                    className={`${styles['dropdown-options']} ${styles['availability-options']}`}
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    {form.daysOfWeek.map((day) => {
                      const optionId = `day-${day}`;
                      const isSelected = form.selectedDays.includes(day);
                      return (
                        <div
                          key={day}
                          role="option"
                          aria-selected={`${isSelected}`}
                          tabIndex={-1}
                          className={`${styles['dropdown-option']} ${styles['availability-option']}`}
                          onKeyDown={handleOptionKeyDown}
                        >
                          <input
                            type="checkbox"
                            id={optionId}
                            disabled={form.isSubmitting}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                form.setSelectedDays([...form.selectedDays, day]);
                              } else {
                                form.setSelectedDays(form.selectedDays.filter(d => d !== day));
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            tabIndex={0}
                            onKeyDown={(e) => keyboard.handleCheckboxKeyNavigation(e, 'day', day, form.selectedDays, form.setSelectedDays)}
                          />
                          <label htmlFor={optionId}>{day}</label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className={styles['profile-field']}>
              <label className={`${styles['profile-label']} ${styles.required}`}>SUBJECTS OF INTEREST</label>
              <div ref={subjectsRef} className={styles['dropdown-wrapper']} tabIndex={0} onKeyDown={(e) => keyboard.handleSubjectsKeyNavigation(e, form.showCategories, form.toggleSubjectDropdown)}>
                <div className={styles['dropdown-trigger']} onClick={form.toggleSubjectDropdown}>
                  <input
                    type="text"
                    placeholder={
                      form.selectedSubjects.length
                        ? `${form.selectedSubjects.length} subjects selected`
                        : 'Select subjects'
                    }
                    readOnly
                    disabled={form.isSubmitting}
                    className={`${styles['profile-input']} ${form.validationErrors.selectedSubjects ? styles.error : ''}`}
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>

                {form.showCategories && (
                  <div className={`${styles['dropdown-menu']} ${styles.categories}`}>
                    {form.categories.map(category => (
                      <div
                        key={category.type}
                        className={styles['dropdown-item']}
                        onClick={() => form.selectCategory(category)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            form.selectCategory(category);
                          }
                        }}
                      >
                        {category.name}
                        {form.selectedSubjectsCount[category.type as keyof typeof form.selectedSubjectsCount] > 0 && (
                          <span className={styles['count-badge']}>
                            {form.selectedSubjectsCount[category.type as keyof typeof form.selectedSubjectsCount]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {form.showSubjectsDropdown && (
                  <div className={`${styles['dropdown-menu']} ${styles.subjects}`}>
                    {form.currentSubjects.length > 0 ? (
                      form.currentSubjects.map(subject => (
                        <div key={subject} className={`${styles['dropdown-item']} ${styles['subject-item']}`}>
                          <input
                            type="checkbox"
                            id={subject}
                            disabled={form.isSubmitting}
                            checked={form.selectedSubjects.includes(subject)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                form.setSelectedSubjects([...form.selectedSubjects, subject]);
                              } else {
                                form.setSelectedSubjects(form.selectedSubjects.filter(s => s !== subject));
                              }
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => keyboard.handleCheckboxKeyNavigation(e, 'subject', subject, form.selectedSubjects, form.setSelectedSubjects)}
                          />
                          <label htmlFor={subject}>{subject}</label>
                        </div>
                      ))
                    ) : (
                      <div className={`${styles['dropdown-item']} ${styles['no-subjects']}`}>
                        No subjects available
                      </div>
                    )}
                  </div>
                )}
              </div>
              {form.validationErrors.selectedSubjects && (
                <span className={styles['validation-message']}>
                  {form.validationErrors.selectedSubjects}
                </span>
              )}
            </div>

            <div className={styles['profile-field']}>
               <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="modality">LEARNING MODALITY</label>
              <div 
                ref={modalityRef}
                className={styles['subjmodality-dropdown']}
                tabIndex={0}
                onKeyDown={handleComboboxKey(() => form.toggleDropdown('modality'), form.dropdownOpen.modality, modalityListboxId)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('modality')}>
                  <input
                    type="text"
                    value={form.modality}
                    disabled={form.isSubmitting}
                    placeholder="Select learning modality"
                    className={styles['profile-input']}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.modality && (
                  <div
                    id={modalityListboxId}
                    className={styles['dropdown-options']}
                    role="listbox"
                    aria-multiselectable="false"
                  >
                    {form.modalityOptions.map((mod) => {
                      const optionId = `modality-${mod}`;
                      const isSelected = form.modality === mod;
                      return (
                        <div
                          key={mod}
                          role="option"
                          aria-selected={`${isSelected}`}
                          tabIndex={-1}
                          className={styles['dropdown-option']}
                          onKeyDown={handleOptionKeyDown}
                        >
                          <input
                            type="radio"
                            name="modality"
                            id={optionId}
                            disabled={form.isSubmitting}
                            checked={isSelected}
                            onChange={() => form.handleModalitySelect(mod)}
                          />
                          <label htmlFor={optionId}>{mod}</label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className={styles['profile-field']}>
             <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="session-duration">PREFERRED SESSION DURATION</label>
            <div 
                ref={sessionDurationRef}
                className={styles['session-duration-dropdown']}
                tabIndex={0}
                onKeyDown={(e) => keyboard.handleDropdownKeyNavigation(e, 'sessionDuration', form.dropdownOpen.sessionDuration, () => form.toggleDropdown('sessionDuration'), sessionDurationRef)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('sessionDuration')}>
                  <input
                    type="text"
                    value={form.sessionDuration}
                    disabled={form.isSubmitting}
                    placeholder="Select duration"
                    className={styles['profile-input']}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.sessionDuration && (
                  <div className={styles['dropdown-options']}>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleSessionDurationSelect('1 hour')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleSessionDurationSelect('1 hour');
                        }
                      }}
                    >
                      1 hour
                    </div>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleSessionDurationSelect('2 hours')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleSessionDurationSelect('2 hours');
                        }
                      }}
                    >
                      2 hours
                    </div>
                    <div 
                      className={styles['dropdown-option']} 
                      onClick={() => form.handleSessionDurationSelect('3 hours')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          form.handleSessionDurationSelect('3 hours');
                        }
                      }}
                    >
                      3 hours
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles['profile-field']}>
             <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="learning-style">LEARNING STYLE</label>
            <div 
                ref={learningStyleRef}
                className={styles['learning-style-dropdown']}
                tabIndex={0}
                onKeyDown={(e) => keyboard.handleDropdownKeyNavigation(e, 'learningStyle', form.dropdownOpen.learningStyle, () => form.toggleDropdown('learningStyle'), learningStyleRef)}
              >
                <div className={styles['dropdown-container']} onClick={() => form.toggleDropdown('learningStyle')}>
                  <input
                    type="text"
                    id="learning-style"
                    value={form.learningStyleDisplay}
                    disabled={form.isSubmitting}
                    placeholder="Select learning style(s)"
                    className={styles['profile-input']}
                    readOnly
                    tabIndex={-1}
                  />
                  <i className={`fas fa-chevron-down ${styles['dropdown-icon']}`}></i>
                </div>
                {form.dropdownOpen.learningStyle && (
                  <div className={styles['dropdown-options']}>
                    {form.sessionStyles.map(style => (
                      <div key={style} className={styles['dropdown-option']}>
                        <input
                          type="checkbox"
                          id={`style-${style}`}
                          checked={form.selectedSessionStyles.includes(style)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setSelectedSessionStyles([...form.selectedSessionStyles, style]);
                            } else {
                              form.setSelectedSessionStyles(form.selectedSessionStyles.filter(s => s !== style));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          tabIndex={0}
                          onKeyDown={(e) => keyboard.handleCheckboxKeyNavigation(e, 'style', style, form.selectedSessionStyles, form.setSelectedSessionStyles)}
                        />
                        <label htmlFor={`style-${style}`}>{style}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles['profile-field']}>
               <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="bio">SHORT BIO</label>              <textarea
                ref={bioRef}
                id="bio"
                value={form.bio}
                onChange={(e) => {
                  form.setBio(e.target.value);
                  form.handleFieldValidation('bio', e.target.value);
                }}
                onBlur={() => form.handleFieldValidation('bio', form.bio)}
                disabled={form.isSubmitting}
                placeholder="Tell us about yourself (50-500 characters)"
                rows={4}
                className={`${styles['profile-textarea']} ${form.validationErrors.bio ? styles.error : ''}`}
                tabIndex={0}
              ></textarea>
              {form.validationErrors.bio && (
                <span className={styles['validation-message']}>
                  {form.validationErrors.bio}
                </span>
              )}
            </div>

            <div className={styles['profile-field']}>
             <label className={`${styles['profile-label']} ${styles.required}`} htmlFor="goals">LEARNING GOALS</label>
              <textarea
                ref={goalsRef}
                id="goals"
                value={form.goals}
                onChange={(e) => {
                  form.setGoals(e.target.value);
                  form.handleFieldValidation('goals', e.target.value);
                }}
                onBlur={() => form.handleFieldValidation('goals', form.goals)}
                disabled={form.isSubmitting}
                placeholder="Describe your learning goals (50-500 characters)"
                rows={4}
                className={`${styles['profile-textarea']} ${form.validationErrors.goals ? styles.error : ''}`}
                tabIndex={0}
              ></textarea>
              {form.validationErrors.goals && (
                <span className={styles['validation-message']}>
                  {form.validationErrors.goals}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles['next-button-container']}>
        {form.currentStep === 2 && (
          <button ref={keyboard.prevStepButtonRef} className={styles['prev-step-button']} onClick={form.prevStep} disabled={form.isSubmitting} tabIndex={0}>
            PREVIOUS
          </button>
        )}
        <button
          ref={keyboard.nextButtonRef}
          className={`${styles['next-button']} ${form.isSubmitting ? styles.loading : ''} ${form.isButtonActive ? styles.active : ''}`}
          onClick={form.nextStep}
          onMouseDown={() => !form.isSubmitting && form.setIsButtonActive(true)}
          onMouseUp={() => form.setIsButtonActive(false)}
          onMouseLeave={() => form.setIsButtonActive(false)}
          disabled={form.isSubmitting}
          tabIndex={0}
        >
          {form.isSubmitting ? (
            <span className={styles['loading-spinner']}></span>
          ) : form.currentStep === form.totalSteps ? (
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