'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Reviewer {
  name: string;
  course: string;
  year: string;
  image?: string;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  reviewer?: Reviewer;
  date?: string;
  subject?: string;
  location?: string;
  mentor?: any;
  learner?: any;
  feedback?: any;
  has_feedback?: boolean;
  mentorId?: string;
  scheduleId?: string; // Add this to track which schedule the feedback belongs to
}

interface FeedbackFromAPI {
  _id: string;
  learner: string;
  mentor: string;
  schedule: string;
  rating: number;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsComponentProps {
  schedForReview?: any[];
  userData?: any;
  data?: {
    schedForReview: any[];
  };
}

export default function ReviewsComponent({ schedForReview = [], userData, data }: ReviewsComponentProps) {
  const [records, setRecords] = useState<Feedback[]>([]);
  const [recordView, setRecordView] = useState<Feedback | null>(null);
  const [isFeedback, setIsFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempRating, setTempRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedbacks, setExistingFeedbacks] = useState<FeedbackFromAPI[]>([]);

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch existing feedbacks from the learner
  const fetchExistingFeedbacks = async () => {
    try {
      const response = await api.get('/api/learner/feedback-given');
      console.log('Existing feedbacks:', response.data);
      setExistingFeedbacks(response.data);
    } catch (error: any) {
      console.error('Error fetching existing feedbacks:', error);
      // If no feedbacks found (404), that's okay - set empty array
      if (error.response?.status === 404) {
        setExistingFeedbacks([]);
      }
    }
  };

  // Transform schedForReview data to match the expected Feedback interface
  const transformScheduleToFeedback = (schedule: any, existingFeedbacks: FeedbackFromAPI[]): Feedback => {
    // Find existing feedback for this schedule
    const existingFeedback = existingFeedbacks.find(feedback => 
      feedback.schedule === schedule.id || feedback.schedule === schedule._id
    );

    return {
      id: schedule.id,
      rating: existingFeedback?.rating || schedule.feedback?.rating || 0,
      comment: existingFeedback?.comments || schedule.feedback?.feedback || "",
      date: schedule.date,
      subject: schedule.subject,
      location: schedule.location,
      has_feedback: !!existingFeedback || schedule.has_feedback || false,
      reviewer: {
        name: schedule.mentor?.user?.name || schedule.mentor?.name || "Unknown Mentor",
        course: schedule.mentor?.course || schedule.mentor?.program || "N/A",
        year: schedule.mentor?.year || schedule.mentor?.yearLevel || "N/A",
        image: schedule.mentor?.image || "https://placehold.co/600x400"
      },
      mentor: schedule.mentor,
      learner: schedule.learner,
      feedback: existingFeedback || schedule.feedback,
      mentorId: schedule.mentor?.id || schedule.mentor?._id || schedule.mentor,
      scheduleId: schedule.id // Track the schedule ID for feedback submission
    };
  };

  const sampleData: Feedback[] = [
    {
      id: "1",
      rating: 5,
      comment: "Excellent mentor! Very patient and knowledgeable. The sessions were well-structured and helped me understand complex topics easily.",
      reviewer: {
        name: "Alice Johnson",
        course: "Computer Science (CS)",
        year: "2nd Year",
        image: "alice.jpg"
      }
    },
    {
      id: "2",
      rating: 4,
      comment: "Very helpful sessions with great explanations. The mentor was professional and provided valuable insights.",
      reviewer: {
        name: "Bob Smith",
        course: "Information Technology (IT)",
        year: "1st Year",
        image: "bob.jpg"
      }
    },
    {
      id: "3",
      rating: 0,
      comment: "",
      reviewer: {
        name: "Carol Davis",
        course: "Software Engineering (SE)",
        year: "3rd Year",
        image: "carol.jpg"
      }
    }
  ];

  // Fetch existing feedbacks when component mounts
  useEffect(() => {
    fetchExistingFeedbacks();
  }, []);

  // Update records when schedForReview or existingFeedbacks change
  useEffect(() => {
    console.log("schedForReview received:", schedForReview);
    console.log("data.schedForReview received:", data?.schedForReview);
    console.log("existingFeedbacks:", existingFeedbacks);
    
    if (schedForReview && schedForReview.length > 0) {
      // Transform the schedForReview data to match the expected format
      const transformedRecords = schedForReview.map(schedule => 
        transformScheduleToFeedback(schedule, existingFeedbacks)
      );
      setRecords(transformedRecords);
      console.log("Transformed records with feedback:", transformedRecords);
    } else if (data?.schedForReview && data.schedForReview.length > 0) {
      // Use the raw schedForReview from data prop as fallback
      const transformedRecords = data.schedForReview.map(schedule => 
        transformScheduleToFeedback(schedule, existingFeedbacks)
      );
      setRecords(transformedRecords);
      console.log("Using data.schedForReview with feedback:", transformedRecords);
    } else {
      // Use sample data as fallback
      setRecords(sampleData);
      console.log("Using sample data");
    }
  }, [schedForReview, data, existingFeedbacks]);

  const viewFeedback = (record: Feedback) => {
    setIsFeedback(true);
    setRecordView(record);
    setTempRating(record.rating || 0);
    setFeedbackText(record.comment || '');
  };

  const closeFeedback = () => {
    setIsFeedback(false);
    setRecordView(null);
    setTempRating(0);
    setHoverRating(0);
    setFeedbackText('');
  };

  const handleSetRating = (rating: number) => {
    setTempRating(rating);
  };

  const handleSubmitFeedback = async () => {
    if (tempRating === 0) {
      alert('Please provide a rating before submitting feedback.');
      return;
    }

    if (!recordView) {
      alert('No session selected for feedback.');
      return;
    }

    // Get the mentor ID from the record
    const mentorId = recordView.mentorId;
    const scheduleId = recordView.scheduleId;
    
    if (!mentorId) {
      alert('Mentor ID not found. Cannot submit feedback.');
      return;
    }

    if (!scheduleId) {
      alert('Schedule ID not found. Cannot submit feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting feedback:', {
        mentorId: mentorId,
        scheduleId: scheduleId,
        rating: tempRating,
        comments: feedbackText
      });

      // Use the axios instance which will automatically handle the token
      const response = await api.post(`/api/learner/feedback/${mentorId}`, {
        schedule: scheduleId, // Use the schedule ID from the record
        rating: tempRating,
        comments: feedbackText
      });

      console.log('Feedback submitted successfully:', response.data);

      // Update the record with new feedback
      const updatedRecord = {
        ...recordView,
        rating: tempRating,
        comment: feedbackText,
        has_feedback: true
      };

      setRecords(prev => prev.map(r => r.id === recordView.id ? updatedRecord : r));
      
      // Refresh existing feedbacks to get the latest data
      await fetchExistingFeedbacks();
      
      closeFeedback();
      alert('Feedback submitted successfully!');

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 'Failed to submit feedback';
        
        if (statusCode === 401) {
          alert('Session expired. Please log in again.');
          // Optionally redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        } else if (statusCode === 403) {
          alert('You are not authorized to perform this action.');
        } else if (statusCode === 400) {
          alert(errorMessage);
        } else {
          alert(`Server error: ${errorMessage}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        alert('Network error. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (!record.reviewer) {
      return false;
    }

    const reviewer = record.reviewer;
    const searchTerm = searchQuery.toLowerCase();
    
    return (
      (reviewer.name?.toLowerCase() || '').includes(searchTerm) ||
      (reviewer.course?.toLowerCase() || '').includes(searchTerm) ||
      (reviewer.year?.toLowerCase() || '').includes(searchTerm) ||
      (record.subject?.toLowerCase() || '').includes(searchTerm) ||
      (record.location?.toLowerCase() || '').includes(searchTerm)
    );
  });

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="star">
            {i < rating ? (
              <span className="filled">★</span>
            ) : (
              <span>☆</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const getReviewerName = (reviewer?: Reviewer) => {
    return reviewer?.name || 'Unknown Mentor';
  };

  const getReviewerCourse = (reviewer?: Reviewer) => {
    return reviewer?.course ? reviewer.course.match(/\(([^)]+)\)/)?.[1] || reviewer.course : 'N/A';
  };

  const getReviewerYear = (reviewer?: Reviewer) => {
    return reviewer?.year || 'N/A';
  };

  const hasFeedback = (record: Feedback) => {
    return record.rating > 0 && record.comment !== '';
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">
          <svg className="header-icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          Session Records
        </h2>

        <div className="search-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search records..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead className="table-head">
            <tr>
              <th>MENTOR&apos;S NAME</th>
              <th>SUBJECT</th>
              <th>DATE</th>
              <th>RATING</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td className="small-text">{getReviewerName(record.reviewer)}</td>
                <td className="small-text">{record.subject || 'N/A'}</td>
                <td className="small-text">{record.date || 'N/A'}</td>
                <td>
                  <StarRating rating={record.rating} />
                </td>
                <td>
                  <button 
                    onClick={() => viewFeedback(record)} 
                    className={`details-btn small-text ${hasFeedback(record) ? 'sent' : ''}`}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span>{hasFeedback(record) ? 'View Feedback' : 'Give Feedback'}</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={5} className="no-users small-text">
                  No records to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFeedback && recordView && (
        <div className="modal-overlay" onClick={closeFeedback}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-content">
                <svg className="modal-title-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <h3 className="modal-title small-text">Feedback for {recordView.subject || 'Session'}</h3>
              </div>
              <button className="close-btn" onClick={closeFeedback}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="user-profile">
                <div className="profile-image-container">
                  <img
                    src={recordView.reviewer?.image 
                      ? `${baseURL}/api/image/${recordView.reviewer.image}`
                      : `https://placehold.co/120x120/3b9aa9/ffffff?text=${getReviewerName(recordView.reviewer).charAt(0)}`
                    }
                    alt={getReviewerName(recordView.reviewer)}
                    className="profile-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/120x120/3b9aa9/ffffff?text=${getReviewerName(recordView.reviewer).charAt(0)}`;
                    }}
                  />
                </div>

                <div className="profile-info">
                  <h4 className="user-name small-text">
                    {getReviewerName(recordView.reviewer)}
                  </h4>
                  <hr className="divider" />
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label small-text">
                        <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginRight: '0.5rem' }}>
                          <path fill="currentColor" d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                        </svg>
                        Subject
                      </span>
                      <span className="info-value small-text">
                        {recordView.subject || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label small-text">
                        <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginRight: '0.5rem' }}>
                          <path fill="currentColor" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
                        </svg>
                        Date
                      </span>
                      <span className="info-value small-text">
                        {recordView.date || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label small-text">
                        <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginRight: '0.5rem' }}>
                          <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Location
                      </span>
                      <span className="info-value small-text">
                        {recordView.location || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <div className="bio-card">
                  <h4 className="section-title small-text">
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                      <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    Rate This Session
                  </h4>
                  <hr className="divider2" />
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        onClick={() => !hasFeedback(recordView) && handleSetRating(i)}
                        onMouseEnter={() => !hasFeedback(recordView) && setHoverRating(i)}
                        onMouseLeave={() => !hasFeedback(recordView) && setHoverRating(0)}
                        className={`star ${i <= (hoverRating || tempRating) ? 'filled' : ''} ${hasFeedback(recordView) ? 'disabled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {hasFeedback(recordView) && (
                    <div className="current-rating small-text">
                      Your rating: {recordView.rating} stars
                    </div>
                  )}
                </div>

                <div className="bio-card">
                  <h4 className="section-title small-text">
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                      <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Feedback
                  </h4>
                  <hr className="divider2" />
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={hasFeedback(recordView) ? '' : 'Enter your feedback here...'}
                    className="feedback-input small-text"
                    disabled={hasFeedback(recordView)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="footer-actions">
                <button className="footer-btn back small-text" onClick={closeFeedback}>
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                    <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                  Back to Records
                </button>
                {!hasFeedback(recordView) && (
                  <button
                    onClick={handleSubmitFeedback}
                    className="footer-btn submit small-text"
                    disabled={tempRating === 0 || isSubmitting}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                      <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-container {
          background: var(--bg-light);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(26, 79, 159, 0.5);
          width: 90%;
          margin-top: 2rem;
          margin-left: 2.5rem;
          padding: 0 1rem;
          text-align: center;
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          height: 37.4rem;
          max-height: 37.5rem;
          overflow-y: auto;
        }

        .table-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
          gap: 1rem;
          flex-wrap: wrap;
          color: #0b2548;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .table-title {
          margin: 0;
          font-size: 1.6rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .header-icon {
          color: var(--text-light);
        }

        .search-container {
          margin-left: auto;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 0.9rem;
          z-index: 2;
          pointer-events: none;
        }

        .search-input {
          padding: 0.6rem 1rem 0.6rem 2.2rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          width: 100%;
          font-size: 0.8rem;
          height: 38px;
          transition: all 0.3s ease;
          background: white;
          color: #374151;
          box-sizing: border-box;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 154, 169, 0.1);
          border-color: var(--primary);
        }

        .table-wrapper {
          overflow-y: auto;
          flex-grow: 1;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
        }

        .table-head {
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .data-table th {
          background-color: #e5e5e5;
          color: var(--text-dark);
          font-weight: 600;
          padding: 0.8rem 0.5rem;
          border-bottom: 2px solid var(--primary);
          font-size: 0.85rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .data-table td {
          padding: 0.7rem 0.5rem;
          vertical-align: middle;
          border-bottom: 1px solid #eee;
        }

        .data-table tr:hover {
          background-color: rgba(59, 154, 169, 0.05);
        }

        .data-table th:nth-child(1),
        .data-table td:nth-child(1) {
          width: 270px;
          max-width: 300px;
          min-width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 0.8rem;
          padding-right: 0.8rem;
        }

        .stars {
          display: flex;
          justify-content: center;
          gap: 0.2rem;
        }

        .star {
          font-size: 1rem;
          color: #ccc;
        }

        .filled {
          color: #ffd700;
        }

        .details-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--primary-dark);
          background-color: rgba(73, 152, 164, 0.103);
          color: var(--primary-dark);
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
        }

        .details-btn:hover {
          background-color: rgba(59, 154, 169, 0.2);
          transform: translateY(-1px);
        }

        .details-btn.sent {
          background-color: rgba(76, 175, 80, 0.1);
          border-color: var(--success);
          color: var(--success);
        }

        .no-users {
          text-align: center;
          padding: 2rem;
          color: var(--text-dark);
          font-style: italic;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .user-modal {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 35%;
          max-height: 85vh;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
        }

        .user-modal::-webkit-scrollbar {
          display: none;
        }

        .user-modal {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .modal-header {
          padding: 1.2rem;
          background: linear-gradient(135deg, #0b3e8a, #3b9aa9);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-title {
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .modal-title-icon {
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
        }

        .modal-body::-webkit-scrollbar {
          display: none;
        }

        .modal-body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .user-profile {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          align-items: flex-start;
        }

        .profile-image-container {
          position: relative;
          flex-shrink: 0;
        }

        .profile-image {
          width: 85px;
          height: 85px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #e1e4e8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .profile-info {
          flex-grow: 1;
        }

        .user-name {
          margin: 0.3rem 0 1rem 0;
          font-weight: 700;
          text-align: left;
          font-size: 1.1rem;
        }

        .divider {
          border: none;
          border-top: 3px solid #8a8a8f;
          margin-bottom: 1rem;
          margin-top: -0.5rem;
        }

        .info-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          text-align: left;
          min-width: 130px;
          flex: 1 0 auto;
        }

        .info-label {
          color: #6b7280;
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .info-value {
          font-weight: 600;
          color: #0b234a;
          margin-left: 20px;
          font-size: 0.9rem;
        }

        .details-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.2rem;
          margin-bottom: 1rem;
        }

        .bio-card {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .section-title {
          margin: 0 0 1rem 0;
          color: #0b3e8a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
        }

        .divider2 {
          border: none;
          border-top: 1px solid #8a8a8f;
          margin-bottom: 1.2rem;
          margin-top: -0.3rem;
        }

        .rating-stars {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .rating-stars .star {
          font-size: 1.8rem;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rating-stars .star.filled {
          color: #ffd700;
        }

        .rating-stars .star.disabled {
          cursor: default;
        }

        .current-rating {
          text-align: center;
          margin-top: 0.8rem;
          color: var(--primary-dark);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .feedback-input {
          width: 95%;
          min-height: 100px;
          padding: 0.8rem;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.3s;
          font-size: 0.9rem;
        }

        .feedback-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(59, 154, 169, 0.1);
        }

        .feedback-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .modal-footer {
          padding: 1.2rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        .footer-btn {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .footer-actions {
          display: flex;
          gap: 0.8rem;
          width: 100%;
          justify-content: space-between;
        }

        .footer-btn.back {
          background-color: transparent;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .footer-btn.back:hover {
          background-color: #e5e7eb;
        }

        .footer-btn.submit {
          background: linear-gradient(135deg, #3b9aa9, #0b3e8a);
          color: white;
        }

        .footer-btn.submit:hover {
          background: linear-gradient(135deg, #0b3e8a, #3b9aa9);
          transform: translateY(-1px);
        }

        .footer-btn.submit:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
        }

        .small-text {
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .table-container {
            height: auto;
            max-height: 80vh;
            margin: 1rem;
            width: calc(100% - 2rem);
          }

          .table-header {
            position: relative;
            top: auto;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .search-container {
            margin-left: 0;
            width: 100%;
          }

          .search-wrapper {
            width: 100%;
          }

          .search-input {
            width: 100%;
          }

          .user-modal {
            width: 95%;
            margin: 0 auto;
          }

          .user-profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .info-value {
            margin-left: 0;
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .data-table {
            display: block;
            overflow-x: auto;
          }

          .modal-body {
            padding: 1rem;
          }

          .user-profile {
            gap: 1rem;
          }

          .profile-image {
            width: 70px;
            height: 70px;
          }

          .footer-actions {
            flex-direction: column;
            gap: 0.5rem;
          }

          .footer-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}