// src/components/mentorpage/main/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ViewUser from '../viewUser/page';
import styles from './main.module.css';

// Updated interface to match the actual API response
interface User {
  id: string;
  name: string;
  yearLevel: string;
  program?: string; // Make this optional since some learners don't have it
  image?: string | null;
}

interface MentorData {
  [key: string]: any;
}

interface MainComponentProps {
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mentorData?: MentorData;
  setUserId?: (id: string | null) => void;
  userData?: any;
}

export default function MainComponent({ 
  users, 
  searchQuery, 
  setSearchQuery,
  mentorData = {},
  setUserId,
  userData
}: MainComponentProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [isView, setIsView] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter((user) => {
      // Safely handle undefined/null values
      const userName = user.name?.toLowerCase() || '';
      const yearLevel = user.yearLevel?.toLowerCase() || '';
      const program = user.program?.toLowerCase() || '';
      const programAbbreviation = user.program?.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || '';

      return (
        userName.includes(query) ||
        yearLevel.includes(query) ||
        program.includes(query) ||
        programAbbreviation.includes(query)
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

  const openView = (id: string) => {
    setSelectedUserId(id);
    setIsView(true);
    if (setUserId) {
      setUserId(id);
    }
  };

  const closeView = () => {
    setIsView(false);
    setSelectedUserId(null);
    if (setUserId) {
      setUserId(null);
    }
  };

  // Helper function to get program abbreviation or full program name
  const getProgramDisplay = (program?: string) => {
    if (!program) return 'N/A';
    
    // Try to extract abbreviation from parentheses
    const abbreviation = program.match(/\(([^)]+)\)/)?.[1];
    return abbreviation || program;
  };

  // Helper function to handle image URLs
  const getImageUrl = (image?: string | null) => {
    if (!image || image === 'null' || image === null) {
      return 'https://placehold.co/600x400';
    }
    return image;
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
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className={styles.mainUserCard}>
              <div className={styles.mainUpperElement}>
                <img
                  src={getImageUrl(user.image)}
                  alt={`${user.name || 'User'} profile`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400';
                  }}
                />
                <h1>{user.name || 'Unknown User'}</h1>
              </div>
              <div className={styles.mainLowerElement}>
                <p>{user.yearLevel || 'N/A'}</p>
                <p>{getProgramDisplay(user.program)}</p>
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
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No learners found matching your search.</p>
          </div>
        )}
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