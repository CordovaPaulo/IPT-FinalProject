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
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSubmissionSpecialization, setSelectedSubmissionSpecialization] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'submissions'>('challenges');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSubmissionDetailsModal, setShowSubmissionDetailsModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'approve' | 'reject';
    challengeId?: string;
    submission?: Submission;
    feedback?: string;
  } | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [submissionToReject, setSubmissionToReject] = useState<Submission | null>(null);

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    instructions: '',
    specialization: 'programming',
    points: 100,
    deadline: ''
  });

  const specializations = ['all', 'programming', 'mathematics', 'science', 'language', 'business', 'design', 'data-science', 'cybersecurity'];
  const statuses = ['all', 'pending', 'approved', 'rejected'];

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, selectedSpecialization, searchQuery]);

  useEffect(() => {
    filterSubmissions();
  }, [challenges, selectedStatus, selectedSubmissionSpecialization]);

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
                },
                {
                  id: 'file2',
                  name: 'algorithm_explanation.pdf',
                  size: '1.5 MB',
                  url: '#',
                  type: 'pdf',
                  uploadedBy: 'learner',
                  uploadDate: '2024-01-20'
                }
              ]
            },
            {
              id: 'sub2',
              learnerName: 'Bob Smith',
              learnerId: 'learner2',
              challengeId: '1',
              submissionDate: '2024-01-22',
              status: 'pending',
              content: 'Completed 8 out of 10 problems. Struggled with the last two optimization problems but learned a lot in the process.',
              attachedFiles: [
                {
                  id: 'file3',
                  name: 'problem_solutions.zip',
                  size: '3.2 MB',
                  url: '#',
                  type: 'zip',
                  uploadedBy: 'learner',
                  uploadDate: '2024-01-22'
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
          submissions: [
            {
              id: 'sub3',
              learnerName: 'Carol Davis',
              learnerId: 'learner3',
              challengeId: '2',
              submissionDate: '2024-01-18',
              status: 'approved',
              content: 'Solved all problems with detailed explanations and step-by-step solutions. Included proofs for all theorems and derivations.',
              feedback: 'Great mathematical reasoning and clear explanations. Excellent work on the proofs.',
              pointsAwarded: 300,
              attachedFiles: [
                {
                  id: 'file4',
                  name: 'math_solutions.docx',
                  size: '845 KB',
                  url: '#',
                  type: 'document',
                  uploadedBy: 'learner',
                  uploadDate: '2024-01-18'
                }
              ]
            }
          ]
        },
        {
          id: '3',
          title: 'Data Analysis Project',
          description: 'Analyze a real-world dataset and create meaningful visualizations.',
          instructions: 'Use Python with pandas, matplotlib, and seaborn. Include data cleaning steps, exploratory analysis, and insights. Submit your Jupyter notebook and a summary report. Focus on deriving actionable insights from the data.',
          specialization: 'data-science',
          points: 400,
          createdAt: '2024-01-08',
          submissions: [
            {
              id: 'sub4',
              learnerName: 'David Wilson',
              learnerId: 'learner4',
              challengeId: '3',
              submissionDate: '2024-01-25',
              status: 'pending',
              content: 'Completed data cleaning and exploratory analysis. Working on final visualizations and insights generation.',
              attachedFiles: [
                {
                  id: 'file5',
                  name: 'data_analysis.ipynb',
                  size: '4.7 MB',
                  url: '#',
                  type: 'python',
                  uploadedBy: 'learner',
                  uploadDate: '2024-01-25'
                }
              ]
            }
          ]
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

  const filterSubmissions = () => {
    const allSubmissions = challenges.flatMap(challenge => 
      challenge.submissions.map(submission => ({
        ...submission,
        challengeTitle: challenge.title,
        challengePoints: challenge.points,
        specialization: challenge.specialization
      }))
    );

    let filtered = allSubmissions;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(submission => submission.status === selectedStatus);
    }

    if (selectedSubmissionSpecialization !== 'all') {
      filtered = filtered.filter(submission => submission.specialization === selectedSubmissionSpecialization);
    }

    setFilteredSubmissions(filtered);
  };

  const handleCreateChallenge = async () => {
    try {
      const challenge: Challenge = {
        id: Date.now().toString(),
        title: newChallenge.title,
        description: newChallenge.description,
        instructions: newChallenge.instructions,
        specialization: newChallenge.specialization,
        points: newChallenge.points,
        deadline: newChallenge.deadline || undefined,
        createdAt: new Date().toISOString().split('T')[0],
        submissions: [],
      };

      setChallenges(prev => [challenge, ...prev]);
      setShowCreateModal(false);
      resetNewChallenge();
      
      console.log('Creating challenge:', challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const handleEditChallenge = async () => {
    if (!selectedChallenge) return;

    try {
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === selectedChallenge.id 
            ? { ...selectedChallenge, ...newChallenge }
            : challenge
        )
      );
      setShowEditModal(false);
      setSelectedChallenge(null);
      resetNewChallenge();
      
      console.log('Updating challenge:', selectedChallenge.id);
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!confirmAction?.challengeId) return;

    try {
      setChallenges(prev => prev.filter(challenge => challenge.id !== confirmAction.challengeId));
      setShowConfirmModal(false);
      setConfirmAction(null);
      
      console.log('Deleting challenge:', confirmAction.challengeId);
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const handleReviewSubmission = async () => {
    if (!confirmAction?.submission) return;

    const { submission, type, feedback } = confirmAction;

    // Map action types ("approve" | "reject") to submission status values ("approved" | "rejected")
    const actionToStatus = (action: 'approve' | 'reject'): 'approved' | 'rejected' => action === 'approve' ? 'approved' : 'rejected';

    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === submission.challengeId) {
        const updatedSubmissions = challenge.submissions.map(sub =>
          sub.id === submission.id
            ? {
                ...sub,
                status: actionToStatus(type as 'approve' | 'reject'),
                feedback: feedback || (type === 'approve' ? 'Great work! Challenge completed successfully.' : 'Submission needs improvement.'),
                pointsAwarded: type === 'approve' ? challenge.points : 0,
              }
            : sub
        );
        return { ...challenge, submissions: updatedSubmissions };
      }
      return challenge;
    });

    setChallenges(updatedChallenges);
    setShowConfirmModal(false);
    setConfirmAction(null);

    console.log('Reviewing submission:', submission.id, type);
  };

  const resetNewChallenge = () => {
    setNewChallenge({
      title: '',
      description: '',
      instructions: '',
      specialization: 'programming',
      points: 100,
      deadline: ''
    });
  };

  const openEditModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setNewChallenge({
      title: challenge.title,
      description: challenge.description,
      instructions: challenge.instructions,
      specialization: challenge.specialization,
      points: challenge.points,
      deadline: challenge.deadline || ''
    });
    setShowEditModal(true);
  };

  const openSubmissionsModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowSubmissionsModal(true);
  };

  const openSubmissionDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetailsModal(true);
  };

  const openConfirmModal = (type: 'delete' | 'approve' | 'reject', challengeId?: string, submission?: Submission) => {
    if (type === 'delete' && challengeId) {
      setConfirmAction({ type, challengeId });
      setShowConfirmModal(true);
    } else if ((type === 'approve' || type === 'reject') && submission) {
      if (type === 'reject') {
        setSubmissionToReject(submission);
        setRejectionFeedback('');
        setShowRejectionModal(true);
      } else {
        setConfirmAction({ type, submission });
        setShowConfirmModal(true);
      }
    }
  };

  const handleRejectWithFeedback = () => {
    if (!submissionToReject) return;

    setConfirmAction({ 
      type: 'reject', 
      submission: submissionToReject, 
      feedback: rejectionFeedback || 'Submission needs improvement.' 
    });
    setShowRejectionModal(false);
    setShowConfirmModal(true);
  };

  const handleDownloadFile = (file: FileAttachment) => {
    console.log('Downloading file:', file.name);
    alert(`Downloading ${file.name}...`);
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

  const totalSubmissions = challenges.reduce((total, challenge) => total + challenge.submissions.length, 0);
  const pendingSubmissions = challenges.reduce((total, challenge) => 
    total + challenge.submissions.filter(sub => sub.status === 'pending').length, 0
  );

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
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <svg className={styles.plusIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Challenge
        </button>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'challenges' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges ({challenges.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'submissions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions ({totalSubmissions})
          {pendingSubmissions > 0 && (
            <span className={styles.pendingBadge}>{pendingSubmissions}</span>
          )}
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
              <h3>Total Challenges</h3>
              <span className={styles.statNumber}>{challenges.length}</span>
            </div>
            <div className={styles.statCard}>
              <h3>Total Submissions</h3>
              <span className={styles.statNumber}>{totalSubmissions}</span>
            </div>
            <div className={styles.statCard}>
              <h3>Pending Reviews</h3>
              <span className={styles.statNumber}>{pendingSubmissions}</span>
            </div>
          </div>

          <div className={styles.challengesGrid}>
            {filteredChallenges.map(challenge => (
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
                    </div>
                  </div>
                </div>

                <p className={styles.challengeDescription}>{challenge.description}</p>

                <div className={styles.challengeFooter}>
                  <div className={styles.submissionInfo}>
                    <svg className={styles.submissionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{challenge.submissions.length} submissions</span>
                    {challenge.submissions.filter(sub => sub.status === 'pending').length > 0 && (
                      <span className={styles.pendingCount}>
                        {challenge.submissions.filter(sub => sub.status === 'pending').length} pending
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.challengeActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => openSubmissionsModal(challenge)}
                      title="View Submissions"
                    >
                      <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => openEditModal(challenge)}
                      title="Edit Challenge"
                    >
                      <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => openConfirmModal('delete', challenge.id)}
                      title="Delete Challenge"
                    >
                      <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredChallenges.length === 0 && (
              <div className={styles.noResults}>
                <h3>No challenges found</h3>
                <p>Try adjusting your filters or create a new challenge</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'submissions' && (
        <div className={styles.submissionsContainer}>
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.submissionFilters}>
              <div className={styles.selectWrapper}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={styles.submissionFilterSelect}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <svg className={styles.selectArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className={styles.selectWrapper}>
                <select
                  value={selectedSubmissionSpecialization}
                  onChange={(e) => setSelectedSubmissionSpecialization(e.target.value)}
                  className={`${styles.submissionFilterSelect} ${styles.specializationFilter}`}
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

          <div className={styles.submissionsList}>
            {filteredSubmissions.map(submission => {
              const challenge = challenges.find(c => c.id === submission.challengeId);
              return (
                <div key={submission.id} className={styles.submissionCardCompact}>
                  <div className={styles.submissionHeaderCompact}>
                    <div className={styles.submissionInfoCompact}>
                      <h4>{submission.learnerName}</h4>
                      <div className={styles.submissionMeta}>
                        <span className={styles.challengeTitleCompact}>
                          {challenge?.title}
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
                          <span className={styles.specializationBadge}>
                            {formatSpecialization(submission.specialization || '')}
                          </span>
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
                  
                  <div className={styles.submissionActions}>
                    <button
                      className={styles.viewDetailsButton}
                      onClick={() => openSubmissionDetails(submission)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>

                    {submission.status === 'pending' && (
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.approveButton}
                          onClick={() => openConfirmModal('approve', undefined, submission)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => openConfirmModal('reject', undefined, submission)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredSubmissions.length === 0 && (
              <div className={styles.noResults}>
                <h3>No submissions found</h3>
                <p>Try adjusting your filters or check back later for new submissions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions Modal with Instructions */}
      {showSubmissionsModal && selectedChallenge && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '1000px' }}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleSection}>
                <h3>Submissions for: {selectedChallenge.title}</h3>
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
                onClick={() => setShowSubmissionsModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              {/* Challenge Instructions Section */}
              <div className={styles.instructionsSection}>
                <div className={styles.sectionHeader}>
                  <h4>📋 Challenge Instructions</h4>
                </div>
                <div className={styles.instructionsContent}>
                  <p><strong>Description:</strong> {selectedChallenge.description}</p>
                  {selectedChallenge.instructions && (
                    <>
                      <p><strong>Detailed Instructions:</strong></p>
                      <div className={styles.instructionsText}>
                        {selectedChallenge.instructions}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submissions List */}
              <div className={styles.submissionsSection}>
                <div className={styles.sectionHeader}>
                  <h4>👥 Learner Submissions ({selectedChallenge.submissions.length})</h4>
                </div>
                {selectedChallenge.submissions.length > 0 ? (
                  <div className={styles.submissionsListModal}>
                    {selectedChallenge.submissions.map(submission => (
                      <div key={submission.id} className={styles.submissionItemModal}>
                        <div className={styles.submissionHeaderModal}>
                          <div className={styles.submissionLearnerInfo}>
                            <div className={styles.learnerName}>
                              <strong>{submission.learnerName}</strong>
                              <span className={styles.submissionDate}>
                                {new Date(submission.submissionDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(submission.status) }}
                          >
                            {submission.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className={styles.submissionContentModal}>
                          <div className={styles.submissionText}>
                            <p>{submission.content}</p>
                          </div>
                          
                          {submission.attachedFiles && submission.attachedFiles.length > 0 && (
                            <div className={styles.submissionFiles}>
                              <strong>Submitted files ({submission.attachedFiles.length}):</strong>
                              <div className={styles.fileList}>
                                {submission.attachedFiles.map(file => (
                                  <div key={file.id} className={styles.fileItem}>
                                    <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
                                    <span className={styles.fileName}>{file.name}</span>
                                    <span className={styles.fileSize}>{file.size}</span>
                                    <button 
                                      className={styles.downloadButton}
                                      onClick={() => handleDownloadFile(file)}
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
                          
                          {submission.feedback && (
                            <div className={styles.feedbackSection}>
                              <div className={styles.feedbackHeader}>
                                <strong>Your Feedback</strong>
                              </div>
                              <div className={styles.feedbackContent}>
                                <p>{submission.feedback}</p>
                                {submission.pointsAwarded && (
                                  <div className={styles.pointsAwarded}>
                                    <strong>Points Awarded:</strong> {submission.pointsAwarded}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {submission.status === 'pending' && (
                          <div className={styles.submissionActionsModal}>
                            <button
                              className={styles.approveButton}
                              onClick={() => openConfirmModal('approve', undefined, submission)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              className={styles.rejectButton}
                              onClick={() => openConfirmModal('reject', undefined, submission)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noSubmissions}>
                    <p>No submissions yet for this challenge.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSubmissionsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Create New Challenge</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Challenge Title</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter challenge title"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the challenge"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Detailed Instructions</label>
                <textarea
                  value={newChallenge.instructions}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Provide detailed instructions, requirements, and expectations for learners..."
                  rows={5}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Specialization</label>
                  <select
                    value={newChallenge.specialization}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, specialization: e.target.value }))}
                    className={styles.filterSelect}
                  >
                    {specializations.filter(spec => spec !== 'all').map(specialization => (
                      <option key={specialization} value={specialization}>
                        {formatSpecialization(specialization)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Points</label>
                  <input
                    type="number"
                    value={newChallenge.points}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Deadline (Optional)</label>
                <input
                  type="date"
                  value={newChallenge.deadline}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleCreateChallenge}
                disabled={!newChallenge.title || !newChallenge.description}
              >
                Create Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {showEditModal && selectedChallenge && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Edit Challenge</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Challenge Title</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Detailed Instructions</label>
                <textarea
                  value={newChallenge.instructions}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={5}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Specialization</label>
                  <select
                    value={newChallenge.specialization}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, specialization: e.target.value }))}
                    className={styles.filterSelect}
                  >
                    {specializations.filter(spec => spec !== 'all').map(specialization => (
                      <option key={specialization} value={specialization}>
                        {formatSpecialization(specialization)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Points</label>
                  <input
                    type="number"
                    value={newChallenge.points}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Deadline (Optional)</label>
                <input
                  type="date"
                  value={newChallenge.deadline}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleEditChallenge}
                disabled={!newChallenge.title || !newChallenge.description}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showSubmissionDetailsModal && selectedSubmission && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '800px' }}>
            <div className={styles.modalHeader}>
              <h3>Submission Details</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowSubmissionDetailsModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.submissionDetails}>
                <div className={styles.submissionHeader}>
                  <div className={styles.submissionInfo}>
                    <h4>{selectedSubmission.learnerName}</h4>
                    <p>Submitted for: {challenges.find(c => c.id === selectedSubmission.challengeId)?.title}</p>
                    <span className={styles.submissionDate}>
                      {new Date(selectedSubmission.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(selectedSubmission.status) }}
                  >
                    {selectedSubmission.status.toUpperCase()}
                  </span>
                </div>
                
                <div className={styles.submissionContentFull}>
                  <p><strong>Submission Content:</strong></p>
                  <p>{selectedSubmission.content}</p>
                  
                  {selectedSubmission.attachedFiles && selectedSubmission.attachedFiles.length > 0 && (
                    <div className={styles.attachedFiles}>
                      <strong>Learner's Files ({selectedSubmission.attachedFiles.length}):</strong>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>
                        Files uploaded by the learner for your review
                      </p>
                      <div className={styles.fileList}>
                        {selectedSubmission.attachedFiles.map(file => (
                          <div key={file.id} className={styles.fileItem}>
                            <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
                            <span className={styles.fileName}>{file.name}</span>
                            <span className={styles.fileSize}>{file.size}</span>
                            <button 
                              className={styles.downloadButton}
                              onClick={() => handleDownloadFile(file)}
                              title="Download file"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.feedback && (
                    <div style={{ marginTop: '12px' }}>
                      <p><strong>Your Feedback:</strong></p>
                      <p style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                        {selectedSubmission.feedback}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.pointsAwarded && (
                    <p style={{ marginTop: '8px' }}><strong>Points Awarded:</strong> {selectedSubmission.pointsAwarded}</p>
                  )}
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className={styles.submissionActions}>
                    <button
                      className={styles.approveButton}
                      onClick={() => {
                        setShowSubmissionDetailsModal(false);
                        openConfirmModal('approve', undefined, selectedSubmission);
                      }}
                    >
                      <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => {
                        setShowSubmissionDetailsModal(false);
                        openConfirmModal('reject', undefined, selectedSubmission);
                      }}
                    >
                      <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSubmissionDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {showRejectionModal && submissionToReject && (
        <div className={styles.modalOverlay}>
          <div className={styles.rejectionModal}>
            <div className={styles.modalHeader}>
              <h3>Reject Submission</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowRejectionModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p>
                Please provide feedback for rejecting {submissionToReject.learnerName}'s submission. 
                This feedback will help the learner understand what needs improvement.
              </p>
              
              <div className={styles.formGroup}>
                <label>Feedback for Learner</label>
                <textarea
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  placeholder="Explain why this submission was rejected and what improvements are needed..."
                  className={styles.rejectionTextarea}
                />
              </div>

              {rejectionFeedback && (
                <div className={styles.feedbackPreview}>
                  <strong>Preview of your feedback:</strong>
                  <p>{rejectionFeedback}</p>
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.rejectButton}
                onClick={handleRejectWithFeedback}
                disabled={!rejectionFeedback.trim()}
              >
                Reject Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3>
                {confirmAction.type === 'delete' && 'Delete Challenge'}
                {confirmAction.type === 'approve' && 'Approve Submission'}
                {confirmAction.type === 'reject' && 'Reject Submission'}
              </h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowConfirmModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p>
                {confirmAction.type === 'delete' && 'Are you sure you want to delete this challenge? This action cannot be undone.'}
                {confirmAction.type === 'approve' && `Are you sure you want to approve ${confirmAction.submission?.learnerName}'s submission? This will award ${confirmAction.submission && challenges.find(c => c.id === confirmAction.submission?.challengeId)?.points} points.`}
                {confirmAction.type === 'reject' && `Are you sure you want to reject ${confirmAction.submission?.learnerName}'s submission?`}
              </p>
              {confirmAction.type === 'reject' && confirmAction.feedback && (
                <div className={styles.feedbackPreview}>
                  <strong>Your feedback:</strong>
                  <p>{confirmAction.feedback}</p>
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className={confirmAction.type === 'delete' ? styles.deleteButton : confirmAction.type === 'approve' ? styles.approveButton : styles.rejectButton}
                onClick={confirmAction.type === 'delete' ? handleDeleteChallenge : handleReviewSubmission}
              >
                {confirmAction.type === 'delete' && 'Delete Challenge'}
                {confirmAction.type === 'approve' && 'Approve'}
                {confirmAction.type === 'reject' && 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
