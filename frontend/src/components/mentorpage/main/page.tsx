// src/components/mentorpage/main/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ViewUser from '../viewUser/page';
interface User {
  id: number;
  userName: string;
  yearLevel: string;
  course: string;
  image_url?: string;
}

interface MentorData {
  [key: string]: any;
}

interface MainComponentProps {
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setUserId: (id: number) => void;
  setShowOffer: (show: boolean) => void;
  mentorData?: MentorData;
}

export default function MainComponent({ 
  users, 
  searchQuery, 
  setSearchQuery, 
  setUserId, 
  setShowOffer,
  mentorData = {} 
}: MainComponentProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [isView, setIsView] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter((user) => {
      return (
        (user.userName && user.userName.toLowerCase().includes(query)) ||
        (user.course && user.course.toLowerCase().includes(query)) ||
        (user.yearLevel && user.yearLevel.toLowerCase().includes(query)) ||
        (user.course.match(/\(([^)]+)\)/)?.[1]?.toLowerCase().includes(query))
      );
    });
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  const openView = (id: number) => {
    setSelectedUserId(id);
    setIsView(true);
  };

  const closeView = () => {
    setIsView(false);
    setSelectedUserId(null);
  };

  return (
    <div className="main-wrapper">
      <form onSubmit={handleSearchSubmit} className="search-container">
        <input
          value={searchQuery}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search by name, course, or year..."
          className="search-input"
        />
        <button type="submit" className="search-button">
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
      </form>
      
      <div className="user-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="upper-element">
              <img
                src={user.image_url || 'https://placehold.co/600x400'}
                alt="profile-pic"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400';
                }}
              />
              <h1>{user.userName}</h1>
            </div>
            <div className="lower-element">
              <p>{user.yearLevel}</p>
              <p>{user.course.match(/\(([^)]+)\)/)?.[1] || user.course}</p>
              <div className="button-group">
                <button 
                  className="see-more-btn"
                  onClick={() => openView(user.id)}
                >
                  See More
                </button>
                <button 
                  className="offer-btn"
                  onClick={() => {
                    setUserId(user.id);
                    setShowOffer(true);
                  }}
                >
                  Make Offer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View User Popup */}
      {isView && selectedUserId && (
        <div className="view-popup-overlay">
          <div className="view-popup">
            <ViewUser 
              userId={selectedUserId} 
              mentorData={mentorData}
              onClose={closeView}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .main-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 1.5rem;
          position: relative;
        }

        .search-container {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
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
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
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
          gap: 1.25rem;
          width: 100%;
          max-width: 1100px;
        }

        .user-card {
          background: #e3e6e7;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e0dcd7;
          position: relative;
          z-index: 1;
        }

        .user-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
        }

        .user-card:hover::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(138, 43, 226, 0.2) 0%,
            rgba(75, 0, 130, 0.3) 100%
          );
          z-index: -1;
          border-radius: 10px;
        }

        .upper-element {
          padding: 1.25rem;
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
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #f5f3f0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: opacity 0.3s ease;
        }

        .user-card img[src="https://placehold.co/600x400"] {
          opacity: 0.7;
        }

        .user-card h1 {
          color: #3a3631;
          font-size: 1rem;
          font-weight: 600;
          margin: 0.75rem 0 0.4rem;
          text-align: center;
        }

        .lower-element {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #eaeef1;
        }

        .lower-element p {
          color: #5a5651;
          font-size: 0.8rem;
          text-align: center;
          margin: 0.15rem 0;
          line-height: 1.4;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          margin-top: 1rem;
        }

        .see-more-btn, .offer-btn {
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 18px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          width: 100%;
        }

        .see-more-btn:hover, .offer-btn:hover {
          background: linear-gradient(135deg, #3b9aa9, #0c434d);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        }

        .see-more-btn {
          background: linear-gradient(135deg, #6c757d, #adb5bd);
        }

        .see-more-btn:hover {
          background: linear-gradient(135deg, #5a6268, #6c757d);
        }

        .view-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .view-popup {
          max-width: 90%;
          max-height: 90vh;
          overflow: auto;
        }

        .stars {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.25rem;
          margin: 0.5rem 0;
        }

        .filledStar {
          font-size: 1.5rem;
        }

        @media (max-width: 768px) {
          .search-container {
            justify-content: flex-start;
            margin-bottom: 1rem;
            padding-left: 0.5rem;
          }

          .search-input {
            width: 100%;
            max-width: 400px;
            margin-right: 0.75rem;
          }

          .search-input:focus {
            width: 100%;
            max-width: 400px;
          }

          .user-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
          }

          .user-card {
            border-radius: 8px;
          }

          .upper-element,
          .lower-element {
            padding: 1rem;
          }

          .user-card img {
            width: 70px;
            height: 70px;
          }

          .user-card h1 {
            font-size: 0.9rem;
          }

          .lower-element p {
            font-size: 0.75rem;
          }

          .see-more-btn, .offer-btn {
            padding: 0.4rem 1rem;
            font-size: 0.75rem;
          }

          .view-popup {
            max-width: 95%;
            max-height: 95vh;
          }
        }

        @media (max-width: 480px) {
          .main-wrapper {
            padding: 1rem 1rem;
            width: 90%;
          }

          .search-container {
            padding-left: 0.25rem;
          }

          .user-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
          }

          .user-card img {
            width: 60px;
            height: 60px;
          }

          .user-card h1 {
            font-size: 0.85rem;
            margin: 0.5rem 0 0.3rem;
          }

          .stars {
            margin: 0.3rem 0;
          }

          .filledStar {
            font-size: 1.2rem;
          }

          .see-more-btn, .offer-btn {
            margin-top: 0.75rem;
          }

          .button-group {
            gap: 0.3rem;
          }
        }
      `}</style>
    </div>
  );
}