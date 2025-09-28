'use client';

import { useState, useEffect } from 'react';

interface Reviewer {
  name: string;
  course: string;
  year: string;
  image?: string;
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  reviewer?: Reviewer;
}

interface ReviewsComponentProps {
  feedbacks?: Feedback[];
}

export default function ReviewsComponent({ feedbacks = [] }: ReviewsComponentProps) {
  const [records, setRecords] = useState<Feedback[]>([]);
  const [recordView, setRecordView] = useState<Feedback | null>(null);
  const [isFeedback, setIsFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const sampleData: Feedback[] = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
      rating: 5,
      comment: "Outstanding teaching methodology. The mentor made difficult concepts easy to understand with practical examples.",
      reviewer: {
        name: "Carol Davis",
        course: "Software Engineering (SE)",
        year: "3rd Year",
        image: "carol.jpg"
      }
    }
  ];

  useEffect(() => {
    const dataToUse = sampleData;
    setRecords(dataToUse);
  }, [feedbacks]);

  const viewFeedback = (record: Feedback) => {
    setIsFeedback(true);
    setRecordView(record);
  };

  const closeFeedback = () => {
    setIsFeedback(false);
    setRecordView(null);
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
      (reviewer.year?.toLowerCase() || '').includes(searchTerm)
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
    return reviewer?.name || 'Unknown Learner';
  };

  const getReviewerCourse = (reviewer?: Reviewer) => {
    return reviewer?.course ? reviewer.course.match(/\(([^)]+)\)/)?.[1] : 'N/A';
  };

  const getReviewerYear = (reviewer?: Reviewer) => {
    return reviewer?.year || 'N/A';
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

      <div className="table-scroll-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>LEARNER&apos;S NAME</th>
              <th>COURSE</th>
              <th>YEAR</th>
              <th>RATING</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>{getReviewerName(record.reviewer)}</td>
                <td>{getReviewerCourse(record.reviewer)}</td>
                <td>{getReviewerYear(record.reviewer)}</td>
                <td>
                  <StarRating rating={record.rating} />
                </td>
                <td>
                  <button 
                    onClick={() => viewFeedback(record)} 
                    className="details-btn"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span>View Feedback</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={5} className="no-users">
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
                <h3>Feedback Details</h3>
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
                      <span className="label">Course:</span>
                      <span className="value">{getReviewerCourse(recordView.reviewer)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Year Level:</span>
                      <span className="value">{getReviewerYear(recordView.reviewer)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Rating:</span>
                      <span className="value">
                        <StarRating rating={recordView.rating} />
                        <span className="rating-text">({recordView.rating}/5)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feedback-section">
                <div className="feedback-card">
                  <h5>Feedback</h5>
                  <div className="feedback-content">
                    <p>{recordView.comment || "No feedback provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="back-btn" onClick={closeFeedback}>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Back to Records
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :root {
          --primary: #3b9aa9;
          --primary-light: #6dd1e3;
          --primary-dark: #0b3e8a;
          --secondary: #ffc107;
          --danger: #f44336;
          --success: #4caf50;
          --warning: #ffa000;
          --text-dark: #0b2548;
          --text-light: #f5f7fa;
          --bg-light: #ffffff;
          --border: #e1e4e8;
        }

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
          overflow-y: scroll;
        }

        .table-container::-webkit-scrollbar {
          display: none;
        }

        .table-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--primary);
        }

        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid rgb(17, 17, 95);
          border-radius: 8px;
          width: 250px;
          font-size: 0.8rem;
          height: 13px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 2px 8px rgba(54, 88, 141, 0.7);
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

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
        }

        .data-table th {
          position: sticky;
          top: 0;
          background-color: #e5e5e5;
          color: var(--text-dark);
          font-weight: 600;
          padding: 0.75rem;
          border-bottom: 2px solid var(--primary);
        }

        .data-table td {
          padding: 0.8rem;
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
          border: 1px solid var(--primary-dark);
          background-color: rgba(73, 152, 164, 0.103);
          color: var(--primary-dark);
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

        .no-users {
          text-align: center;
          padding: 1rem;
          color: var(--text-dark);
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

        /* Modal Body - Fixed Alignment */
        .modal-body {
          padding: 2rem;
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

        .label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .value {
          font-size: 1rem;
          font-weight: 600;
          color: #0b234a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-text {
          color: #666;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        /* Feedback Section */
        .feedback-section {
          margin-top: 2rem;
        }

        .feedback-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .feedback-card h5 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #0b3e8a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .feedback-content p {
          margin: 0;
          line-height: 1.6;
          color: #495057;
          font-size: 0.95rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #3b9aa9;
        }

        /* Modal Footer */
        .modal-footer {
          padding: 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          border-radius: 0 0 12px 12px;
          display: flex;
          justify-content: center;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #e9ecef;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .search-container {
            margin-left: 0;
            width: 100%;
          }

          .search-input {
            width: 100%;
          }

          .user-profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-info h4 {
            text-align: center;
          }

          .detail-item {
            text-align: center;
          }
        }

        @media (max-width: 1200px) {
          .table-container {
            width: 95%;
            margin-left: 1rem;
          }
          
          .modal-content {
            width: 50%;
          }
        }

        @media (max-width: 992px) {
          .modal-content {
            width: 60%;
          }
          
          .user-profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
          }
          
          .profile-info h4 {
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .table-container {
            width: 100%;
            margin-left: 0;
            padding: 0 0.5rem;
          }

          .table-header {
            padding: 1rem;
          }

          .search-input {
            width: 100%;
            border-radius: 8px;
          }

          .data-table th,
          .data-table td {
            padding: 0.5rem;
            font-size: 0.9rem;
          }

          .modal-content {
            width: 90%;
            margin: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .profile-image img {
            width: 100px;
            height: 100px;
          }

          .profile-info h4 {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 576px) {
          .table-title {
            font-size: 1.3rem;
          }

          .data-table {
            font-size: 0.85rem;
          }

          .details-btn span {
            display: none;
          }

          .modal-content {
            width: 95%;
          }

          .profile-image img {
            width: 80px;
            height: 80px;
          }

          .profile-info h4 {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 400px) {
          .table-title {
            font-size: 1.2rem;
          }

          .modal-content {
            width: 98%;
            margin: 0 1%;
          }
        }
      `}</style>
    </div>
  );
}