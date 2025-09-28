// components/mentorpage/logout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="logout-overlay" onClick={handleClose} />
      
      {/* Logout Modal - This appears centered over the mentor page */}
      <div className="logout-modal">
        <div className="logout-wrapper">
          <div className="logout-upper-element">
            <svg 
              onClick={handleClose}
              className="logout-close-icon"
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
          <div className="logout-lower-element">
            <div>
              <h1>Are you sure you want to log out?</h1>
            </div>
            <div className="logout-buttons">
              <button 
                onClick={logOut} 
                className={`confirm-button ${isLoggingOut ? 'disabled-button' : ''}`}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Yes'}
              </button>
              <button 
                className={`cancel-button ${isLoggingOut ? 'disabled-button' : ''}`}
                onClick={handleClose}
                disabled={isLoggingOut}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Background Overlay - This dims the mentor page but keeps it visible */
        .logout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1999;
        }

        /* Modal Container - This appears centered over the mentor page */
        .logout-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logout-wrapper {
          display: flex;
          align-items: center;
          flex-direction: column;
          width: 400px;
          height: 200px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          background-color: white;
        }

        .logout-upper-element {
          display: flex;
          flex-direction: row;
          background-color: #0c434d;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          border-radius: 20px 20px 0 0;
          padding: 10px 15px 10px 0;
          overflow: hidden;
        }

        .logout-close-icon {
          cursor: pointer;
        }

        .logout-lower-element {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fff;
          border-radius: 0 0 20px 20px;
          overflow: hidden;
          height: 100%;
          width: 100%;
          border: 5px solid #0c434d;
          flex-direction: column;
          padding: 20px;
          box-sizing: border-box;
        }

        .logout-lower-element h1 {
          margin-top: 0;
          font-size: 1.3rem;
          color: #0c434d;
          font-weight: 600;
          text-align: center;
          margin-bottom: 25px;
        }

        .logout-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          width: 100%;
        }

        .confirm-button {
          background-color: #0c434d;
          color: white;
          padding: 10px 25px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
          min-width: 80px;
        }

        .confirm-button:hover:not(:disabled) {
          background-color: #0a363e;
        }

        .cancel-button {
          background-color: #f44336;
          color: white;
          padding: 10px 25px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
          min-width: 80px;
        }

        .cancel-button:hover:not(:disabled) {
          background-color: #d32f2f;
        }

        .disabled-button {
          background-color: #666;
          cursor: not-allowed;
        }

        .disabled-button:hover {
          background-color: #666;
        }

        @media (max-width: 768px) {
          .logout-wrapper {
            width: 350px;
            height: 180px;
          }

          .logout-upper-element {
            padding: 8px 12px 8px 0;
          }

          .logout-lower-element {
            padding: 15px;
          }

          .logout-lower-element h1 {
            font-size: 1.2rem;
            margin-bottom: 20px;
          }

          .logout-buttons {
            gap: 15px;
          }

          .confirm-button,
          .cancel-button {
            padding: 8px 20px;
            font-size: 0.9rem;
            min-width: 70px;
          }
        }

        @media (max-width: 480px) {
          .logout-wrapper {
            width: 300px;
            height: 160px;
          }

          .logout-upper-element {
            padding: 6px 10px 6px 0;
          }

          .logout-lower-element {
            padding: 12px;
          }

          .logout-lower-element h1 {
            font-size: 1.1rem;
            margin-bottom: 15px;
          }

          .logout-buttons {
            gap: 12px;
          }

          .confirm-button,
          .cancel-button {
            padding: 8px 16px;
            font-size: 0.9rem;
            min-width: 60px;
          }
        }

        @media (max-width: 360px) {
          .logout-wrapper {
            width: 280px;
            height: 150px;
          }

          .logout-lower-element h1 {
            font-size: 1rem;
          }

          .confirm-button,
          .cancel-button {
            padding: 7px 14px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}