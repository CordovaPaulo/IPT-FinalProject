// src/app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './Signup.css';


export default function SignupPage() {
  const router = useRouter();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const scrollToGetStarted = () => {
    router.push('/#get-started');
  };

  const initiateSignUp = (role: string) => {
    setSelectedRole(role);
    setShowConfirmationModal(true);
  };

  const confirmSelection = () => {
    setShowConfirmationModal(false);
    
    // Store role selection
    localStorage.setItem('selectedRole', selectedRole);

    if (selectedRole === 'learner') {
      router.push('/learner-info');
    } else {
      router.push('/mentor-info');
    }
  };

  const cancelSelection = () => {
    setShowConfirmationModal(false);
    setSelectedRole('');
  };

  return (
    <div className="signup-container">
      <button onClick={scrollToGetStarted} className="back-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Your Role</h3>
            <p>
              You've selected to proceed as
              <strong> {selectedRole.toUpperCase()}</strong>. Is this correct?
            </p>
            <div className="modal-actions">
              <button onClick={cancelSelection} className="cancel-btn">Cancel</button>
              <button onClick={confirmSelection} className="confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="header-text">
        <h1>Complete Your Account</h1>
        <p>Pick a role to proceed with your profile setup</p>
      </div>

      <section className="join-section" id="get-started">
        <div className="join-card learner-card" onClick={() => initiateSignUp('learner')}>
          <div className="card-content">
            <div className="role-title">
              <span>PROCEED AS</span>
              <h3>LEARNER</h3>
              <hr className="divider" />
            </div>
            <div className="card-icon">
              <Image 
                src="/learners.png" 
                alt="Learner Icon" 
                width={230}
                height={200}
              />
            </div>
            <button className="join-btn">
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="join-card mentor-card" onClick={() => initiateSignUp('mentor')}>
          <div className="card-content">
            <div className="role-title">
              <span>PROCEED AS</span>
              <h3>MENTOR</h3>
              <hr className="divider" />
            </div>
            <div className="card-icon">
              <Image 
                src="/mentors.png" 
                alt="Mentor Icon" 
                width={230}
                height={200}
              />
            </div>
            <button className="join-btn">
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}