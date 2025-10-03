'use client';

import { useState, useEffect } from 'react';
import './ReviewsComponent.css';

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
}

interface ReviewsComponentProps {
  schedForReview?: any[];
  userData?: any;
}

export default function ReviewsComponent({ schedForReview = [], userData }: ReviewsComponentProps) {
  const [records, setRecords] = useState<Feedback[]>([]);
  const [recordView, setRecordView] = useState<Feedback | null>(null);
  const [isFeedback, setIsFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempRating, setTempRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Transform schedForReview data to match the expected Feedback interface
  const transformScheduleToFeedback = (schedule: any): Feedback => {
    return {
      id: schedule.id,
      rating: schedule.feedback?.rating || 0,
      comment: schedule.feedback?.feedback || "",
      date: schedule.date,
      subject: schedule.subject,
      location: schedule.location,
      has_feedback: schedule.has_feedback || false,
      reviewer: {
        name: schedule.mentor?.user?.name || schedule.mentor?.name || "Unknown Mentor",
        course: schedule.mentor?.course || schedule.mentor?.program || "N/A",
        year: schedule.mentor?.year || schedule.mentor?.yearLevel || "N/A",
        image: schedule.mentor?.image || "https://placehold.co/600x400"
      },
      mentor: schedule.mentor,
      learner: schedule.learner,
      feedback: schedule.feedback
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

  useEffect(() => {
    console.log("schedForReview received:", schedForReview);
    
    if (schedForReview && schedForReview.length > 0) {
      // Transform the schedForReview data to match the expected format
      const transformedRecords = schedForReview.map(transformScheduleToFeedback);
      setRecords(transformedRecords);
      console.log("Transformed records:", transformedRecords);
    } else {
      // Use sample data as fallback
      setRecords(sampleData);
      console.log("Using sample data");
    }
  }, [schedForReview]);

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

  const handleSubmitFeedback = () => {
    if (tempRating === 0) {
      alert('Please provide a rating before submitting feedback.');
      return;
    }

    // Update the record with new feedback
    if (recordView) {
      const updatedRecord = {
        ...recordView,
        rating: tempRating,
        comment: feedbackText,
        has_feedback: true
      };

      setRecords(prev => prev.map(r => r.id === recordView.id ? updatedRecord : r));
      
      // Here you would typically send the feedback to your API
      console.log('Submitting feedback:', {
        rating: tempRating,
        comment: feedbackText,
        recordId: recordView.id
      });

      closeFeedback();
      alert('Feedback submitted successfully!');
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
                    disabled={tempRating === 0}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                      <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    Submit Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}