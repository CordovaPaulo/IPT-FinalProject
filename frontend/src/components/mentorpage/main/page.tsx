// src/components/mentorpage/main/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ViewUser from '../viewUser/page';
import styles from './main.module.css';

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
  mentorData?: MentorData;
}

export default function MainComponent({ 
  users, 
  searchQuery, 
  setSearchQuery,
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
    <div className={styles.mainWrapper}>
      <form onSubmit={handleSearchSubmit} className={styles.mainSearchContainer}>
        <input
          value={searchQuery}
          onChange={handleSearchChange}
          type="text"
          placeholder="Search by name, course, or year..."
          className={styles.mainSearchInput}
        />
        <button type="submit" className={styles.mainSearchButton}>
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
      
      <div className={styles.mainUserGrid}>
        {filteredUsers.map((user) => (
          <div key={user.id} className={styles.mainUserCard}>
            <div className={styles.mainUpperElement}>
              <img
                src={user.image_url || 'https://placehold.co/600x400'}
                alt="profile-pic"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400';
                }}
              />
              <h1>{user.userName}</h1>
            </div>
            <div className={styles.mainLowerElement}>
              <p>{user.yearLevel}</p>
              <p>{user.course.match(/\(([^)]+)\)/)?.[1] || user.course}</p>
              <div className={styles.mainButtonGroup}>
                <button 
                  className={styles.mainSeeMoreBtn}
                  onClick={() => openView(user.id)}
                >
                  See More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View User Popup */}
      {isView && selectedUserId && (
        <div className={styles.mainViewPopupOverlay}>
          <div className={styles.mainViewPopup}>
            <ViewUser 
              userId={selectedUserId} 
              mentorData={mentorData}
              onClose={closeView}
            />
          </div>
        </div>
      )}
    </div>
  );
}