'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './logout.module.css';

interface LogoutComponentProps {
  onCancel: () => void;
}

export default function LogoutComponent({ onCancel }: LogoutComponentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Function to get CSRF token from cookies
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Function to remove token
  const removeToken = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  // Function to show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  };

  const logOut = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Logout successful!', 'success');
        removeToken();
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        showToast('Logout failed!', 'error');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed!', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleClose = () => {
    onCancel();
  };

  return (
    <>
      {/* Background Overlay - This will dim the mentor page background */}
      <div className={styles.overlay} onClick={handleClose} />
      
      {/* Logout Modal - This appears centered over the mentor page */}
      <div className={styles.modal}>
        <div className={styles.wrapper}>
          <div className={styles.upperElement}>
            <svg 
              onClick={handleClose}
              className={styles.closeIcon}
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <div className={styles.lowerElement}>
            <div>
              <h1>Are you sure you want to log out?</h1>
            </div>
            <div className={styles.buttons}>
              <button 
                onClick={logOut} 
                className={`${styles.confirmButton} ${isLoggingOut ? styles.disabledButton : ''}`}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Yes'}
              </button>
              <button 
                className={`${styles.cancelButton} ${isLoggingOut ? styles.disabledButton : ''}`}
                onClick={handleClose}
                disabled={isLoggingOut}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}