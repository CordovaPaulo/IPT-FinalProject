'use client';

import { useState, useEffect } from 'react';
import styles from './challenges.module.css';

interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  specialization: string;
  points: number;
  deadline?: string;
  createdAt: string;
  submissions: Submission[];
}

interface Submission {
  id: string;
  learnerName: string;
  learnerId: string;
  challengeId: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string;
  feedback?: string;
  pointsAwarded?: number;
  attachedFiles?: FileAttachment[];
  challengeTitle?: string;
  challengePoints?: number;
  specialization?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
  type: string;
  uploadedBy: 'learner' | 'mentor';
  uploadDate: string;
}

interface UserData {
  _id: string;
  name: string;
  subjects: string[];
}

interface ChallengesComponentProps {
  userData: UserData;
}

export default function ChallengesComponent({ userData }: ChallengesComponentProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'mySubmissions'>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specializations = ['all', 'programming', 'mathematics', 'science', 'language', 'business', 'design', 'data-science', 'cybersecurity'];

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, selectedSpecialization, searchQuery]);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Algorithm Mastery Challenge',
          description: 'Solve 10 complex algorithm problems within 48 hours.',
          instructions: 'Please solve all problems using Python. Focus on time complexity optimization. Submit your solutions as a zip file containing both the code and a README explaining your approach. Make sure to include comments in your code and test cases for each solution.',
          specialization: 'programming',
          points: 500,
          deadline: '2024-12-31',
          createdAt: '2024-01-15',
          submissions: [
            {
              id: 'sub1',
              learnerName: 'Alice Johnson',
              learnerId: 'learner1',
              challengeId: '1',
              submissionDate: '2024-01-20',
              status: 'approved',
              content: 'Completed all 10 problems with optimal solutions. The solutions demonstrate excellent understanding of data structures and algorithms. Implemented efficient solutions using dynamic programming and graph algorithms.',
              feedback: 'Excellent work! All solutions are correct and well-optimized. Great job on the time complexity analysis.',
              pointsAwarded: 500,
              attachedFiles: [
                {
                  id: 'file1',
                  name: 'solution_code.py',
                  size: '2.1 KB',
                  url: '#',
                  type: 'python',
                  uploadedBy: 'learner',
                  uploadDate: '2024-01-20'
                }
              ]
            }
          ]
        },
        {
          id: '2',
          title: 'Mathematics Problem Set',
          description: 'Complete a series of calculus and linear algebra problems.',
          instructions: 'Show all your work and provide step-by-step solutions. Include proofs where necessary. Submit as a PDF document with clear organization. Each problem should be clearly labeled and solutions should be easy to follow.',
          specialization: 'mathematics',
          points: 300,
          createdAt: '2024-01-10',
          submissions: []
        },
        {
          id: '3',
          title: 'Data Analysis Project',
          description: 'Analyze a real-world dataset and create meaningful visualizations.',
          instructions: 'Use Python with pandas, matplotlib, and seaborn. Include data cleaning steps, exploratory analysis, and insights. Submit your Jupyter notebook and a summary report. Focus on deriving actionable insights from the data.',
          specialization: 'data-science',
          points: 400,
          deadline: '2024-06-30',
          createdAt: '2024-01-08',
          submissions: []
        },
        {
          id: '4',
          title: 'Web Development Challenge',
          description: 'Build a responsive web application with modern frameworks.',
          instructions: 'Create a single-page application using React or Vue.js. Implement proper state management, routing, and API integration. Focus on user experience and responsive design.',
          specialization: 'programming',
          points: 600,
          deadline: '2024-08-15',
          createdAt: '2024-02-01',
          submissions: []
        },
        {
          id: '5',
          title: 'Business Case Study',
          description: 'Analyze a business scenario and provide strategic recommendations.',
          instructions: 'Choose a real business case and conduct SWOT analysis. Provide data-driven recommendations and implementation plan. Include financial projections and risk assessment.',
          specialization: 'business',
          points: 350,
          createdAt: '2024-01-25',
          submissions: []
        }
      ];
      
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = challenges;

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(challenge => challenge.specialization === selectedSpecialization);
    }

    if (searchQuery) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChallenges(filtered);
  };

  const getMySubmissions = () => {
    const allSubmissions: Submission[] = [];
    challenges.forEach(challenge => {
      challenge.submissions.forEach(submission => {
        if (submission.learnerName === userData.name) {
          allSubmissions.push({
            ...submission,
            challengeTitle: challenge.title,
            challengePoints: challenge.points,
            specialization: challenge.specialization
          });
        }
      });
    });
    return allSubmissions;
  };

  const openChallengeDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowChallengeModal(true);
  };

  const openSubmitModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setSubmissionContent('');
    setAttachedFiles([]);
    setShowSubmitModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitChallenge = async () => {
    if (!selectedChallenge || !submissionContent.trim()) {
      alert('Please provide submission content');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSubmission: Submission = {
        id: `sub${Date.now()}`,
        learnerName: userData.name,
        learnerId: userData._id,
        challengeId: selectedChallenge.id,
        submissionDate: new Date().toISOString(),
        status: 'pending',
        content: submissionContent,
        attachedFiles: attachedFiles.map((file, index) => ({
          id: `file${Date.now()}${index}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          url: URL.createObjectURL(file),
          type: file.type.split('/')[1] || 'file',
          uploadedBy: 'learner' as const,
          uploadDate: new Date().toISOString()
        }))
      };

      // Update challenges with new submission
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === selectedChallenge.id 
            ? { ...challenge, submissions: [...challenge.submissions, newSubmission] }
            : challenge
        )
      );

      setShowSubmitModal(false);
      setSubmissionContent('');
      setAttachedFiles([]);
      
      alert('Challenge submitted successfully! Waiting for mentor review.');
    } catch (error) {
      console.error('Error submitting challenge:', error);
      alert('Error submitting challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization) {
      case 'programming': return '💻';
      case 'mathematics': return '📊';
      case 'science': return '🔬';
      case 'language': return '📝';
      case 'business': return '💼';
      case 'design': return '🎨';
      case 'data-science': return '📈';
      case 'cybersecurity': return '🔒';
      default: return '🎯';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'document': return '📝';
      case 'python': return '🐍';
      case 'zip': return '📦';
      case 'image': return '🖼️';
      case 'csv': return '📊';
      default: return '📎';
    }
  };

  const formatSpecialization = (spec: string) => {
    return spec.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const hasSubmitted = (challengeId: string) => {
    return challenges.some(challenge => 
      challenge.id === challengeId && 
      challenge.submissions.some(sub => sub.learnerName === userData.name)
    );
  };

  const getMySubmissionStatus = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    const mySubmission = challenge?.submissions.find(sub => sub.learnerName === userData.name);
    return mySubmission?.status || null;
  };

  const mySubmissions = getMySubmissions();

  if (isLoading) {
    return (
      <div className={styles.challengesContainer}>
        <div className={styles.loading}>Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className={styles.challengesContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Learning Challenges</h1>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'challenges' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Available Challenges ({challenges.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'mySubmissions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('mySubmissions')}
        >
          My Submissions ({mySubmissions.length})
        </button>
      </div>

      {activeTab === 'challenges' && (
        <>
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filters}>
              <div className={styles.selectWrapper}>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className={`${styles.filterSelect} ${styles.specializationFilter}`}
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>
                      {spec === 'all' ? 'All Specializations' : formatSpecialization(spec)}
                    </option>
                  ))}
                </select>
                <svg className={styles.selectArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Available Challenges</h3>
              <span className={styles.statNumber}>{challenges.length}</span>
            </div>
            <div className={styles.statCard}>
              <h3>My Submissions</h3>
              <span className={styles.statNumber}>{mySubmissions.length}</span>
            </div>
            <div className={styles.statCard}>
              <h3>Points Earned</h3>
              <span className={styles.statNumber}>
                {mySubmissions
                  .filter(sub => sub.status === 'approved')
                  .reduce((total, sub) => total + (sub.pointsAwarded || 0), 0)}
              </span>
            </div>
          </div>

          <div className={styles.challengesGrid}>
            {filteredChallenges.map(challenge => {
              const submitted = hasSubmitted(challenge.id);
              const submissionStatus = getMySubmissionStatus(challenge.id);
              
              return (
                <div key={challenge.id} className={styles.challengeCard}>
                  <div className={styles.challengeHeader}>
                    <span className={styles.categoryIcon}>
                      {getSpecializationIcon(challenge.specialization)}
                    </span>
                    <div className={styles.challengeInfo}>
                      <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                      <div className={styles.challengeMeta}>
                        <span className={styles.points}>
                          {challenge.points} pts
                        </span>
                        <span className={styles.specializationTag}>
                          {formatSpecialization(challenge.specialization)}
                        </span>
                        {challenge.deadline && (
                          <span className={styles.deadline}>
                            Due: {new Date(challenge.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className={styles.challengeDescription}>{challenge.description}</p>

                  <div className={styles.challengeFooter}>
                    <div className={styles.submissionInfo}>
                      {submitted ? (
                        <div className={styles.submissionStatus}>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(submissionStatus || 'pending') }}
                          >
                            {submissionStatus?.toUpperCase() || 'SUBMITTED'}
                          </span>
                          {submissionStatus === 'approved' && (
                            <span className={styles.pointsAwarded}>
                              +{challenge.points} points earned!
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.notSubmitted}>Not submitted yet</span>
                      )}
                    </div>
                    
                    <div className={styles.challengeActions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => openChallengeDetails(challenge)}
                        title="View Challenge Details"
                      >
                        <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Details
                      </button>
                      {!submitted && (
                        <button
                          className={styles.submitButton}
                          onClick={() => openSubmitModal(challenge)}
                          title="Submit Solution"
                        >
                          <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredChallenges.length === 0 && (
              <div className={styles.noResults}>
                <h3>No challenges found</h3>
                <p>Try adjusting your filters or check back later for new challenges</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'mySubmissions' && (
        <div className={styles.submissionsContainer}>
          {mySubmissions.length > 0 ? (
            <div className={styles.submissionsList}>
              {mySubmissions.map(submission => {
                const challenge = challenges.find(c => c.id === submission.challengeId);
                return (
                  <div key={submission.id} className={styles.submissionCardCompact}>
                    <div className={styles.submissionHeaderCompact}>
                      <div className={styles.submissionInfoCompact}>
                        <h4>{submission.challengeTitle}</h4>
                        <div className={styles.submissionMeta}>
                          <span className={styles.challengeTitleCompact}>
                            {formatSpecialization(submission.specialization || '')} • {submission.challengePoints} pts
                          </span>
                          <div className={styles.submissionDetailsRow}>
                            <span className={styles.submissionDate}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v14a2 2 0 002 2z" />
                              </svg>
                              {new Date(submission.submissionDate).toLocaleDateString()}
                            </span>
                            {submission.attachedFiles && submission.attachedFiles.length > 0 && (
                              <span className={styles.fileCount}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {submission.attachedFiles.length} file(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(submission.status) }}
                      >
                        {submission.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className={styles.submissionContent}>
                      <p>{submission.content}</p>
                    </div>

                    {submission.feedback && (
                      <div className={styles.feedbackSection}>
                        <strong>Mentor Feedback:</strong>
                        <p>{submission.feedback}</p>
                        {submission.pointsAwarded && (
                          <div className={styles.pointsAwarded}>
                            <strong>Points Awarded:</strong> {submission.pointsAwarded}
                          </div>
                        )}
                      </div>
                    )}

                    {submission.attachedFiles && submission.attachedFiles.length > 0 && (
                      <div className={styles.attachedFiles}>
                        <strong>Your Files:</strong>
                        <div className={styles.fileList}>
                          {submission.attachedFiles.map(file => (
                            <div key={file.id} className={styles.fileItem}>
                              <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
                              <span className={styles.fileName}>{file.name}</span>
                              <span className={styles.fileSize}>{file.size}</span>
                              <button 
                                className={styles.downloadButton}
                                onClick={() => window.open(file.url, '_blank')}
                                title="Download file"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No submissions yet</h3>
              <p>Start by submitting your first challenge!</p>
            </div>
          )}
        </div>
      )}

      {/* Challenge Details Modal */}
      {showChallengeModal && selectedChallenge && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '800px' }}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleSection}>
                <h3>{selectedChallenge.title}</h3>
                <div className={styles.challengeMetaInfo}>
                  <span className={styles.specializationBadge}>
                    {formatSpecialization(selectedChallenge.specialization)}
                  </span>
                  <span className={styles.points}>{selectedChallenge.points} pts</span>
                  {selectedChallenge.deadline && (
                    <span className={styles.deadline}>
                      Deadline: {new Date(selectedChallenge.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button 
                className={styles.closeButton}
                onClick={() => setShowChallengeModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.instructionsSection}>
                <div className={styles.sectionHeader}>
                  <h4>📋 Challenge Description</h4>
                </div>
                <div className={styles.instructionsContent}>
                  <p>{selectedChallenge.description}</p>
                </div>
              </div>

              <div className={styles.instructionsSection}>
                <div className={styles.sectionHeader}>
                  <h4>🎯 Instructions & Requirements</h4>
                </div>
                <div className={styles.instructionsContent}>
                  <div className={styles.instructionsText}>
                    {selectedChallenge.instructions}
                  </div>
                </div>
              </div>

              <div className={styles.submissionGuidelines}>
                <h4>📝 Submission Guidelines:</h4>
                <ul>
                  <li>Clearly describe your solution approach and methodology</li>
                  <li>Include all relevant files (code, documents, datasets, etc.)</li>
                  <li>Ensure your submission meets all requirements mentioned above</li>
                  <li>Mentor will review and provide feedback within 2-3 business days</li>
                  <li>You will earn points only if your submission is approved</li>
                </ul>
              </div>

              <div className={styles.challengeActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowChallengeModal(false)}
                >
                  Close
                </button>
                {!hasSubmitted(selectedChallenge.id) && (
                  <button 
                    className={styles.submitButton}
                    onClick={() => {
                      setShowChallengeModal(false);
                      openSubmitModal(selectedChallenge);
                    }}
                  >
                    Submit Solution
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Challenge Modal */}
      {showSubmitModal && selectedChallenge && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h3>Submit Solution: {selectedChallenge.title}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowSubmitModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Your Solution Description *</label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Describe your approach, methodology, challenges faced, and any important details about your solution..."
                  rows={6}
                  className={styles.submissionTextarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Attach Files (Optional)</label>
                <div className={styles.fileUploadSection}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className={styles.fileUploadLabel}>
                    <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Choose Files
                  </label>
                  <span className={styles.fileUploadHint}>
                    You can attach multiple files (code, documents, images, etc.)
                  </span>
                </div>

                {attachedFiles.length > 0 && (
                  <div className={styles.attachedFilesList}>
                    <h4>Selected Files:</h4>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <span className={styles.fileIcon}>📎</span>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          className={styles.removeFileButton}
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.submissionGuidelines}>
                <h4>📋 Submission Guidelines:</h4>
                <ul>
                  <li>Clearly describe your solution approach and thought process</li>
                  <li>Include all relevant files (code, documents, datasets, etc.)</li>
                  <li>Ensure your submission meets all challenge requirements</li>
                  <li>Mentor will review and provide feedback within 2-3 business days</li>
                  <li>You will earn {selectedChallenge.points} points if approved</li>
                </ul>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSubmitChallenge}
                disabled={!submissionContent.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}