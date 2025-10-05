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
  scheduleId?: string;
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

  const fetchExistingFeedbacks = async () => {
    try {
      const response = await api.get('/api/learner/feedback-given');
      console.log('Existing feedbacks:', response.data);
      setExistingFeedbacks(response.data);
    } catch (error: any) {
      console.error('Error fetching existing feedbacks:', error);
      if (error.response?.status === 404) {
        setExistingFeedbacks([]);
      }
    }
  };

  const transformScheduleToFeedback = (schedule: any, existingFeedbacks: FeedbackFromAPI[]): Feedback => {
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
      scheduleId: schedule.id
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
    fetchExistingFeedbacks();
  }, []);

  useEffect(() => {
    console.log("schedForReview received:", schedForReview);
    console.log("data.schedForReview received:", data?.schedForReview);
    console.log("existingFeedbacks:", existingFeedbacks);
    
    if (schedForReview && schedForReview.length > 0) {
      const transformedRecords = schedForReview.map(schedule => 
        transformScheduleToFeedback(schedule, existingFeedbacks)
      );
      setRecords(transformedRecords);
      console.log("Transformed records with feedback:", transformedRecords);
    } else if (data?.schedForReview && data.schedForReview.length > 0) {
      const transformedRecords = data.schedForReview.map(schedule => 
        transformScheduleToFeedback(schedule, existingFeedbacks)
      );
      setRecords(transformedRecords);
      console.log("Using data.schedForReview with feedback:", transformedRecords);
    } else {
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

      const response = await api.post(`/api/learner/feedback/${mentorId}`, {
        schedule: scheduleId,
        rating: tempRating,
        comments: feedbackText
      });

      console.log('Feedback submitted successfully:', response.data);

      const updatedRecord = {
        ...recordView,
        rating: tempRating,
        comment: feedbackText,
        has_feedback: true
      };

      setRecords(prev => prev.map(r => r.id === recordView.id ? updatedRecord : r));
      
      await fetchExistingFeedbacks();
      
      closeFeedback();
      alert('Feedback submitted successfully!');

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 'Failed to submit feedback';
        
        if (statusCode === 401) {
          alert('Session expired. Please log in again.');
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
        alert('Network error. Please check your connection and try again.');
      } else {
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
    <div className="reviews-container">
      <div className="reviews-header">
        <h2 className="reviews-title">
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

      <div className="table-scroll-container">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>MENTOR&apos;S NAME</th>
              <th>SUBJECT</th>
              <th>DATE</th>
              <th>RATING</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>{getReviewerName(record.reviewer)}</td>
                <td>{record.subject || 'N/A'}</td>
                <td>{record.date || 'N/A'}</td>
                <td>
                  <StarRating rating={record.rating} />
                </td>
                <td>
                  <button 
                    onClick={() => viewFeedback(record)} 
                    className={`details-btn ${hasFeedback(record) ? 'sent' : ''}`}
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
                <td colSpan={5} className="no-records">
                  No records to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFeedback && recordView && (
        <div className="modal-overlay" onClick={closeFeedback}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-content">
                <svg className="modal-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <h3>Feedback for {recordView.subject || 'Session'}</h3>
              </div>
              <button className="close-btn" onClick={closeFeedback}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="user-profile">
                <div className="profile-image">
                  <img
                    src={recordView.reviewer?.image 
                      ? `${baseURL}/api/image/${recordView.reviewer.image}`
                      : `https://placehold.co/120x120/3b9aa9/ffffff?text=${getReviewerName(recordView.reviewer).charAt(0)}`
                    }
                    alt={getReviewerName(recordView.reviewer)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/120x120/3b9aa9/ffffff?text=${getReviewerName(recordView.reviewer).charAt(0)}`;
                    }}
                  />
                </div>
                <div className="profile-info">
                  <h4>{getReviewerName(recordView.reviewer)}</h4>
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label">Subject:</span>
                      <span className="detail-value">{recordView.subject || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{recordView.date || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{recordView.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feedback-section">
                <div className="feedback-card">
                  <h5>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                      <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    Rate This Session
                  </h5>
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
                    <div className="current-rating">
                      Your rating: {recordView.rating} stars
                    </div>
                  )}
                </div>

                <div className="feedback-card">
                  <h5>
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                      <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Feedback
                  </h5>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={hasFeedback(recordView) ? '' : 'Enter your feedback here...'}
                    className="feedback-input"
                    disabled={hasFeedback(recordView)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn back" onClick={closeFeedback}>
                <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '0.5rem' }}>
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Back to Records
              </button>
              {!hasFeedback(recordView) && (
                <button
                  onClick={handleSubmitFeedback}
                  className="modal-btn submit"
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
      )}

      <style jsx>{`
        .reviews-container {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(26, 79, 159, 0.5);
          width: 90%;
          margin-top: 2rem;
          margin-left: 2.5rem;
          padding: 0 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          height: 37.4rem;
          max-height: 37.5rem;
          overflow-y: auto;
        }

        .reviews-container::-webkit-scrollbar {
          display: none;
        }

        .reviews-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .reviews-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          padding-bottom: 2rem;
          background: white;
          gap: 1rem;
          flex-wrap: wrap;
          color: #0b2548;
          position: sticky;
          top: 0;
          z-index: 20;
          flex-shrink: 0;
        }

        .reviews-title {
          margin: 0;
          font-size: 1.6rem;
          color: #0b2548;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .header-icon {
          font-size: 1.4rem;
          color: #0b2548;
        }

        .search-container {
          margin-left: auto;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: #3b9aa9;
          z-index: 1;
          font-size: 0.9rem;
        }

        .search-input {
          padding: 0.5rem 0.8rem 0.5rem 2rem;
          border: 1px solid rgb(17, 17, 95);
          border-radius: 6px;
          width: 200px;
          font-size: 0.85rem;
          height: 35px;
          transition: all 0.3s ease;
          position: relative;
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 2px 8px rgba(54, 88, 141, 0.7);
          border-color: #3b9aa9;
        }

        .table-scroll-container {
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }

        .table-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .table-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .reviews-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
        }

        .reviews-table th {
          position: sticky;
          top: 0;
          background-color: #e5e5e5;
          color: #0b2548;
          font-weight: 600;
          padding: 0.75rem;
          border-bottom: 2px solid #3b9aa9;
        }

        .reviews-table td {
          padding: 0.8rem;
          vertical-align: middle;
          border-bottom: 1px solid #eee;
        }

        .reviews-table tr:hover {
          background-color: rgba(59, 154, 169, 0.05);
        }

        .reviews-table th:nth-child(1),
        .reviews-table td:nth-child(1) {
          width: 270px;
          max-width: 300px;
          min-width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }

        .stars {
          display: flex;
          justify-content: center;
          gap: 0.2rem;
        }

        .star {
          font-size: 1.2rem;
          color: #ccc;
        }

        .filled {
          color: #ffd700;
        }

        .details-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #0b3e8a;
          background-color: rgba(73, 152, 164, 0.103);
          color: #0b3e8a;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .details-btn:hover {
          background-color: rgba(59, 154, 169, 0.2);
        }

        .details-btn.sent {
          background-color: rgba(76, 175, 80, 0.1);
          border-color: #4caf50;
          color: #4caf50;
        }

        .no-records {
          text-align: center;
          padding: 1rem;
          color: #0b2548;
        }

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
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 30%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease-out;
        }

        .modal-content::-webkit-scrollbar {
          display: none;
        }

        .modal-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 12px 12px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .modal-icon {
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 2rem;
          padding-bottom: 3rem;
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
          gap: 2rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .profile-image {
          flex-shrink: 0;
        }

        .profile-image img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #e1e4e8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .profile-info {
          flex-grow: 1;
        }

        .profile-info h4 {
          margin: 0 0 1.5rem 0;
          font-size: 1.6rem;
          color: #0b2548;
          font-weight: 700;
          text-align: left;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .detail-label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #0b234a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .feedback-section {
          margin-top: 2rem;
        }

        .feedback-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
          margin-bottom: 1.5rem;
        }

        .feedback-card h5 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #0b3e8a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
          color: #0b3e8a;
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
          border-color: #3b9aa9;
          box-shadow: 0 0 0 2px rgba(59, 154, 169, 0.1);
        }

        .feedback-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
          background-color: #f5f5f5;
          border-top: 2px solid #e0e0e0;
          gap: 12px;
        }

        .modal-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          border: 2px solid transparent;
        }

        .modal-btn.back {
          background-color: #f5f5f5;
          color: #555;
          border-color: #ccc;
        }

        .modal-btn.back:hover {
          background-color: #e0e0e0;
        }

        .modal-btn.submit {
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
          color: white;
          border-color: #0b3e8a;
        }

        .modal-btn.submit:hover {
          background: linear-gradient(135deg, #3b9aa9, #0c434d);
        }

        .modal-btn.submit:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
          opacity: 0.7;
        }

        /* Tablet Responsive Design */
        @media (max-width: 1024px) {
          .reviews-container {
            width: 95%;
            margin: 1.5rem auto;
            margin-left: 1.5rem;
            height: 35rem;
            padding: 0 0.8rem;
          }

          .reviews-header {
            padding: 1.2rem;
            padding-bottom: 1.5rem;
          }

          .reviews-title {
            font-size: 1.4rem;
          }

          .search-input {
            width: 180px;
            height: 32px;
            font-size: 0.8rem;
            padding: 0.4rem 0.7rem 0.4rem 1.8rem;
          }

          .search-icon {
            left: 8px;
            font-size: 0.8rem;
          }

          .modal-content {
            width: 50%;
          }

          .user-profile {
            flex-direction: row;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .profile-info h4 {
            text-align: left;
          }

          .profile-details {
            flex-direction: row;
            gap: 2rem;
          }

          .detail-item {
            text-align: left;
          }
        }

        @media (max-width: 992px) {
          .reviews-container {
            width: 96%;
            margin-left: 0.5rem;
            margin-top: 1rem;
            height: 35rem;
          }

          .reviews-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }

          .search-container {
            margin-left: 0;
          }

          .modal-content {
            width: 70%;
          }

          .search-input {
            width: 160px;
          }
        }

        @media (max-width: 768px) {
          .reviews-container {
            width: 98%;
            margin-left: 0;
            padding: 0 0.5rem;
            height: 32rem;
            border-radius: 12px;
          }

          .reviews-header {
            padding: 1rem;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }

          .reviews-title {
            font-size: 1.4rem;
          }

          .search-container {
            margin-left: 0;
          }

          .search-input {
            width: 150px;
            height: 35px;
          }

          .reviews-table th,
          .reviews-table td {
            padding: 0.6rem;
            font-size: 0.85rem;
          }

          .reviews-table th:nth-child(1),
          .reviews-table td:nth-child(1) {
            width: 150px;
            max-width: 200px;
          }

          .modal-content {
            width: 85%;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .user-profile {
            flex-direction: row;
            gap: 1.5rem;
          }

          .profile-info h4 {
            font-size: 1.3rem;
            text-align: left;
          }

          .profile-details {
            flex-direction: row;
            gap: 1.5rem;
          }

          .modal-header {
            padding: 1.2rem;
          }

          .modal-header h3 {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 576px) {
          .reviews-container {
            width: 100%;
            margin: 0.5rem 0;
            height: 30rem;
            border-radius: 8px;
          }

          .reviews-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .reviews-title {
            font-size: 1.2rem;
          }

          .search-container {
            width: 100%;
          }

          .search-input {
            width: 100%;
            max-width: 250px;
            font-size: 0.8rem;
            height: 32px;
            padding: 0.4rem 0.6rem 0.4rem 1.8rem;
          }

          .search-icon {
            left: 8px;
            font-size: 0.75rem;
          }

          .reviews-table {
            font-size: 0.8rem;
          }

          .reviews-table th,
          .reviews-table td {
            padding: 0.5rem 0.3rem;
          }

          .reviews-table th:nth-child(1),
          .reviews-table td:nth-child(1) {
            width: 120px;
            max-width: 150px;
          }

          .stars {
            gap: 0.1rem;
          }

          .star {
            font-size: 1rem;
          }

          .details-btn {
            padding: 4px 8px;
            font-size: 0.8rem;
          }

          .details-btn span {
            display: none;
          }

          .modal-content {
            width: 92%;
            margin: 0.5rem;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-header h3 {
            font-size: 1.2rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .user-profile {
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
            align-items: center;
          }

          .profile-info h4 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            text-align: center;
          }

          .profile-details {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }

          .detail-item {
            text-align: center;
            align-items: center;
          }

          .detail-label,
          .detail-value {
            font-size: 0.8rem;
            text-align: center;
            justify-content: center;
          }

          .feedback-card {
            padding: 1rem;
          }

          .feedback-card h5 {
            font-size: 1rem;
            justify-content: center;
          }

          .feedback-input {
            font-size: 0.85rem;
            padding: 0.8rem;
          }

          .modal-footer {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.8rem 1rem;
          }

          .modal-btn {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 400px) {
          .reviews-container {
            width: 88%;
            margin: 0.5rem auto;
            height: 28rem;
          }

          .reviews-title {
            font-size: 1.1rem;
          }

          .search-input {
            width: 100%;
            font-size: 0.75rem;
            height: 30px;
          }

          .reviews-table {
            font-size: 0.75rem;
          }

          .reviews-table th,
          .reviews-table td {
            padding: 0.4rem 0.2rem;
          }

          .modal-content {
            width: 96%;
            margin: 0.5rem;
          }

          .user-profile {
            gap: 0.8rem;
            margin-bottom: 1.2rem;
          }

          .profile-info h4 {
            font-size: 1rem;
          }

          .close-btn {
            width: 32px;
            height: 32px;
          }

          .modal-header {
            padding: 0.8rem;
          }

          .modal-header h3 {
            font-size: 1.1rem;
          }
        }

        @media (max-height: 700px) {
          .reviews-container {
            height: 32rem;
          }

          .modal-content {
            max-height: 85vh;
          }
        }

        @media (max-height: 600px) {
          .reviews-container {
            height: 28rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .user-profile {
            margin-bottom: 1rem;
          }

          .profile-info h4 {
            font-size: 1rem;
            margin-bottom: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}