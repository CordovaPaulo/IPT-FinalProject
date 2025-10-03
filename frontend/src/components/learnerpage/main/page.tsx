'use client';

import { useState, useEffect } from 'react';
import ViewUser from '@/components/learnerpage/viewUser/page';
import styles from './MainComponent.module.css';

interface User {
  id: string;
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
      <span key={i} className={styles.filledStar}>
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

  const formatProficiency = (proficiency: string) => {
    if (!proficiency) return '';
    return proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase();
  };

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name, course, or year..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.searchButton}>
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

      <div className={styles.userGrid}>
        {filteredUsers.map((user) => (
          <div key={user.id} className={styles.userCard}>
            <div className={styles.upperElement}>
              <img
                src={user.image_url || 'https://placehold.co/600x400'}
                alt="profile-pic"
              />
              <h1>{user.userName}</h1>
              <div className={styles.stars}>
                {renderStars(user.rating_ave)}
              </div>
            </div>
            <div className={styles.lowerElement}>
              <p>{user.yearLevel}</p>
              <p>{getCourseAbbreviation(user.course)}</p>
              <p className={styles.proficiency}>{formatProficiency(user.proficiency)}</p>
              <div className={styles.buttonSpacer}></div>
              <button onClick={() => openView(user.id)}>See More</button>
            </div>
          </div>
        ))}
      </div>

      {isView && (
        <div className={styles.viewPopup}>
          <ViewUser userId={selectedUserId} onClose={closeView} />
        </div>
      )}
    </div>
  );
}