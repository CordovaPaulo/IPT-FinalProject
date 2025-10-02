'use client';

import { useState, useEffect } from 'react';
import ViewUser from '@/components/learnerpage/viewUser/page';

interface User {
  id: string; // <-- change from number to string
  userName: string;
  yearLevel: string;
  course: string;
  image_url: string;
  proficiency: string;
  rating_ave: number;
}

interface MainComponentProps {
  userInformation: User[];
  schedule?: any;
  upcomingSchedule?: any;
}

export default function MainComponent({ 
  userInformation = [], 
  schedule, 
  upcomingSchedule 
}: MainComponentProps) {
  const [isView, setIsView] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(userInformation);

  const openView = (id: string) => {
    setSelectedUserId(id);
    setIsView(true);
  };

  const closeView = () => {
    setIsView(false);
  };

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(userInformation);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = userInformation.filter((user) => {
      return (
        user.userName.toLowerCase().includes(query) ||
        user.course.toLowerCase().includes(query) ||
        user.yearLevel.toLowerCase().includes(query)
      );
    });
    setFilteredUsers(filtered);
  }, [searchQuery, userInformation]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="filledStar">
        {i < Math.round(rating || 0) ? (
          <span style={{ color: '#ffd700' }}>★</span>
        ) : (
          <span style={{ color: '#e0e0e0' }}>☆</span>
        )}
      </span>
    ));
  };

  const getCourseAbbreviation = (course: string) => {
    const match = course.match(/\(([^)]+)\)/);
    return match ? match[1] : course;
  };

  // Add this simple formatting function for proficiency
  const formatProficiency = (proficiency: string) => {
    if (!proficiency) return '';
    
    // Convert to proper case (first letter uppercase, rest lowercase)
    return proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase();
  };

  return (
    <div className="main-wrapper">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, course, or year..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      <div className="user-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="upper-element">
              <img
                src={user.image_url || 'https://placehold.co/600x400'}
                alt="profile-pic"
              />
              <h1>{user.userName}</h1>
              <div className="stars">
                {renderStars(user.rating_ave)}
              </div>
            </div>
            <div className="lower-element">
              <p>{user.yearLevel}</p>
              <p>{getCourseAbbreviation(user.course)}</p>
              <p className="proficiency">{formatProficiency(user.proficiency)}</p>
              <div className="button-spacer"></div>
              <button onClick={() => openView(user.id)}>See More</button>
            </div>
          </div>
        ))}
      </div>

      {isView && (
        <div className="view-popup">
          <ViewUser userId={selectedUserId} onClose={closeView} />
        </div>
      )}

      <style jsx>{`
        .main-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 1rem;
          position: relative;
        }

        .search-container {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          width: 100%;
          max-width: 1100px;
          justify-content: flex-end;
        }

        .search-input {
          padding: 0.5rem 1rem;
          border: 1px solid #d8d5d0;
          border-radius: 20px;
          font-size: 0.9rem;
          width: 250px;
          transition: all 0.3s ease;
          margin-right: 0.5rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #349eb1;
          box-shadow: 0 0 0 2px rgba(52, 158, 177, 0.2);
          width: 300px;
        }

        .search-button {
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-button:hover {
          background: #2d8a9d;
          transform: scale(1.05);
        }

        .user-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.3rem;
          width: 100%;
          max-width: 1100px;
        }

        .user-card {
          background: #e3e6e7;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e0dcd7;
          position: relative;
          z-index: 1;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .upper-element {
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #eaeef1;
          position: relative;
        }

        .upper-element::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d8d5d0, transparent);
        }

        .user-card img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #f5f3f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .user-card h1 {
          color: #3a3631;
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0.4rem 0 0.2rem;
          text-align: center;
        }

        .lower-element {
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #eaeef1;
        }

        .lower-element p {
          color: #5a5651;
          font-size: 0.75rem;
          text-align: center;
          margin: 0.05rem 0;
          line-height: 1.2;
        }

        .proficiency {
          color: #349eb1 !important;
          font-weight: bold;
          margin-top: 0.2rem !important;
        }

        .button-spacer {
          height: 0.4rem;
          width: 100%;
        }

        .lower-element button {
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          color: white;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 15px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 0.2rem;
          transition: all 0.2s ease;
          font-size: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          width: 50%;
        }

        .lower-element button:hover {
          background: linear-gradient(135deg, #2b737e, #0b2b31);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .view-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2000;
        }

        .stars {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.15rem;
          margin: 0.1rem 0;
        }

        .filledStar {
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .user-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.6rem;
          }

          .search-container {
            justify-content: center;
          }

          .search-input {
            width: 200px;
          }

          .search-input:focus {
            width: 250px;
          }

          .user-card img {
            width: 60px;
            height: 60px;
          }

          .upper-element {
            padding: 0.7rem;
          }

          .lower-element {
            padding: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .user-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.5rem;
          }

          .user-card h1 {
            font-size: 0.8rem;
          }

          .lower-element p {
            font-size: 0.7rem;
          }

          .lower-element button {
            padding: 0.3rem 0.8rem;
            font-size: 0.7rem;
          }

          .search-input {
            width: 180px;
          }

          .search-input:focus {
            width: 200px;
          }

          .user-card img {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
}