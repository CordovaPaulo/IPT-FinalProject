// src/components/mentorpage/session/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faEllipsisH, 
  faBell, 
  faCalendarAlt, 
  faTimes, 
  faUser, 
  faClock, 
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';
import RescheduleDialog from '../RescheduleDialog/page';

interface SessionItem {
  id: number;
  subject: string;
  date: string;
  time: string;
  location: string;
  learner: {
    user: {
      name: string;
    };
  };
}

interface SessionComponentProps {
  schedule?: SessionItem[];
  upcomingSchedule?: SessionItem[];
}

export default function SessionComponent({ schedule = [], upcomingSchedule = [] }: SessionComponentProps) {
  const [todaySchedule, setTodaySchedule] = useState<SessionItem[]>([]);
  const [upcommingSchedule, setUpcommingSchedule] = useState<SessionItem[]>([]);
  const [selectedSessionID, setSelectedSessionID] = useState<number | null>(null);
  const [activePopup, setActivePopup] = useState<{ type: string | null; index: number | null }>({ type: null, index: null });
  const [showRemindConfirmation, setShowRemindConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SessionItem | null>(null);
  const [reschedIsOpen, setReschedIsOpen] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  // Initialize schedules
  useEffect(() => {
    setTodaySchedule(schedule);
    setUpcommingSchedule(upcomingSchedule);
  }, [schedule, upcomingSchedule]);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup({ type: null, index: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sendReminder = async (item: SessionItem) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/send/session/reminder/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Reminder sent successfully!');
        // You can add toast notification here
      } else {
        console.error('Failed to send reminder.');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setShowRemindConfirmation(false);
    }
  };

  const cancelSession = async (item: SessionItem) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/send/session/cancel/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Session cancelled successfully!');
        // Remove from schedules
        setTodaySchedule(prev => prev.filter(session => session.id !== item.id));
        setUpcommingSchedule(prev => prev.filter(session => session.id !== item.id));
      } else {
        console.error('Failed to cancel session.');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setShowCancelConfirmation(false);
    }
  };

  const handleReschedule = async (selectedDate: Date) => {
    try {
      if (!selectedItem) return;

      // Format date and time
      const formattedDate = selectedDate.toLocaleDateString('en-US');
      const formattedTime = selectedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // Replace with your actual API call
      const response = await fetch(`/api/resched/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          date: formattedDate,
          time: formattedTime,
        }),
      });

      if (response.ok) {
        console.log('Session rescheduled successfully!');
        
        // Update the local state with new session details
        const updatedSession = {
          ...selectedItem,
          date: formattedDate,
          time: formattedTime,
        };

        setTodaySchedule(prev => prev.map(session => 
          session.id === selectedItem.id ? updatedSession : session
        ));
        setUpcommingSchedule(prev => prev.map(session => 
          session.id === selectedItem.id ? updatedSession : session
        ));
        
        setReschedIsOpen(false);
      } else {
        console.error('Failed to reschedule session.');
      }
    } catch (error) {
      console.error('Error rescheduling session:', error);
    }
  };

  const togglePopup = (type: string, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (activePopup.type === type && activePopup.index === index) {
      setActivePopup({ type: null, index: null });
    } else {
      setActivePopup({ type, index });
    }
  };

  const handleOptionClick = (option: string, item: SessionItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedItem(item);

    switch (option) {
      case 'remind':
        setShowRemindConfirmation(true);
        break;
      case 'reschedule':
        setSelectedSessionID(item.id);
        setReschedIsOpen(true);
        break;
      case 'cancel':
        setShowCancelConfirmation(true);
        break;
    }
    setActivePopup({ type: null, index: null });
  };

  return (
    <div className="session-wrapper">
      {/* Header Section */}
      <div className="table-header">
        <h2 className="table-title">
          <FontAwesomeIcon icon={faCalendar} className="header-icon" />
          Session Schedule
        </h2>
      </div>

      {/* Main Content Section */}
      <div className="lower-element">
        <div className="session-grid">
          {/* Today Schedule */}
          <div className="session-card">
            <h1>TODAY</h1>
            <div className="session-card-content">
              {todaySchedule.map((item, index) => (
                <div key={item.id} className="today-card">
                  <div className="card-header">
                    <h1>{item.subject}</h1>
                    <div className="ellipsis-container" ref={popupRef}>
                      <FontAwesomeIcon 
                        icon={faEllipsisH}
                        style={{ cursor: 'pointer', color: '#066678', fontSize: '1.5rem' }}
                        onClick={(e) => togglePopup('today', index, e)}
                      />
                      {activePopup.type === 'today' && activePopup.index === index && (
                        <div className="popup-menu" onClick={(e) => e.stopPropagation()}>
                          <div 
                            className="popup-option"
                            onClick={(e) => handleOptionClick('remind', item, e)}
                          >
                            <FontAwesomeIcon icon={faBell} className="option-icon" />
                            <p className="option-text">Remind</p>
                          </div>
                          <div 
                            className="popup-option"
                            onClick={(e) => handleOptionClick('reschedule', item, e)}
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="option-icon" />
                            <p className="option-text">Reschedule</p>
                          </div>
                          <div 
                            className="popup-option"
                            onClick={(e) => handleOptionClick('cancel', item, e)}
                          >
                            <FontAwesomeIcon icon={faTimes} className="option-icon" />
                            <p className="option-text">Cancel Session</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="info name">
                    <FontAwesomeIcon icon={faUser} style={{ color: '#533566', fontSize: '1.5rem' }} />
                    <h2>{item.learner?.user?.name ?? "Unknown User"}</h2>
                  </div>
                  <div className="info">
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#0084ce', fontSize: '1.5rem' }} />
                    <p>{item.date}</p>
                  </div>
                  <div className="info">
                    <FontAwesomeIcon icon={faClock} style={{ color: '#f8312f', fontSize: '1.5rem' }} />
                    <p>{item.time}</p>
                  </div>
                  <div className="info">
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#f72197', fontSize: '1.5rem' }} />
                    <p>{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="session-card">
            <h1>UPCOMING</h1>
            <div className="session-card-content">
              {upcommingSchedule.map((item, index) => (
                <div key={item.id} className="upcomming-card">
                  <div className="card-header">
                    <h1>{item.subject}</h1>
                    <div className="ellipsis-container" ref={popupRef}>
                      <FontAwesomeIcon 
                        icon={faEllipsisH}
                        style={{ cursor: 'pointer', color: '#066678', fontSize: '1.5rem' }}
                        onClick={(e) => togglePopup('upcoming', index, e)}
                      />
                      {activePopup.type === 'upcoming' && activePopup.index === index && (
                        <div className="popup-menu" onClick={(e) => e.stopPropagation()}>
                          <div 
                            className="popup-option"
                            onClick={(e) => handleOptionClick('remind', item, e)}
                          >
                            <FontAwesomeIcon icon={faBell} className="option-icon" />
                            <p className="option-text">Remind</p>
                          </div>
                          <div 
                            className="popup-option"
                            onClick={(e) => handleOptionClick('reschedule', item, e)}
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="option-icon" />
                            <p className="option-text">Reschedule</p>
                          </div>
                          <div 
                            className="popup-option"
                            onClick={(e) => handleOptionClick('cancel', item, e)}
                          >
                            <FontAwesomeIcon icon={faTimes} className="option-icon" />
                            <p className="option-text">Cancel</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="info name">
                    <FontAwesomeIcon icon={faUser} style={{ color: '#533566', fontSize: '1.5rem' }} />
                    <h2>{item.learner.user.name}</h2>
                  </div>
                  <div className="info">
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#0084ce', fontSize: '1.5rem' }} />
                    <p>{item.date}</p>
                  </div>
                  <div className="info">
                    <FontAwesomeIcon icon={faClock} style={{ color: '#f8312f', fontSize: '1.5rem' }} />
                    <p>{item.time}</p>
                  </div>
                  <div className="info">
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#f72197', fontSize: '1.5rem' }} />
                    <p>{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Remind Confirmation Modal */}
      {showRemindConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Reminder</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to send a reminder for
                <strong> {selectedItem?.subject} </strong> to
                <strong> {selectedItem?.learner.user.name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button cancel"
                onClick={() => setShowRemindConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm"
                onClick={() => selectedItem && sendReminder(selectedItem)}
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cancel Session</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to cancel
                <strong> {selectedItem?.subject} </strong> with
                <strong> {selectedItem?.learner.user.name}</strong>?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button cancel"
                onClick={() => setShowCancelConfirmation(false)}
              >
                No, Keep It
              </button>
              <button
                className="modal-button confirm danger"
                onClick={() => selectedItem && cancelSession(selectedItem)}
              >
                Yes, Cancel Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {reschedIsOpen && selectedItem && (
        <RescheduleDialog
          id={selectedItem.id}
          onClose={() => setReschedIsOpen(false)}
          onReschedule={handleReschedule}
          currentSession={selectedItem}
        />
      )}

      <style jsx>{`
        .session-wrapper {
          background: #ffffff;
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
          overflow: hidden;
        }

        .table-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          padding-bottom: 2rem;
          background: rgb(255, 255, 255);
          gap: 1rem;
          flex-wrap: wrap;
          color: #0b2548;
          position: sticky;
          top: 0;
          z-index: 20;
          flex-shrink: 0;
        }

        .table-title {
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

        .lower-element {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          gap: 1.5rem;
          background-color: #fff;
          overflow: hidden;
          height: 100%;
          padding: 0.8rem;
          flex: 1;
        }

        .session-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 1.5rem;
          width: 100%;
          height: 100%;
          padding: 0 0.5rem;
          overflow: hidden;
        }

        .session-card {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          padding: 0 0.5rem 0.8rem 0.5rem;
          max-width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .session-card h1 {
          color: #0b3e8a;
          font-size: 1.2rem;
          text-align: left;
          margin-bottom: 0.3rem;
          margin-top: 1rem;
          padding-left: 0.5rem;
          flex-shrink: 0;
        }

        .session-card-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 0.2rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .session-card-content::-webkit-scrollbar {
          display: none;
        }

        .today-card,
        .upcomming-card {
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0.9rem;
          background-color: #e4f3f5;
          border-radius: 8px;
          margin-bottom: 0.8rem;
          transition: all 0.3s ease;
          border-left: 5px solid #3b9aa9;
          max-width: 100%;
          box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
          transform: translateY(0);
          flex-shrink: 0;
        }

        .today-card:hover,
        .upcomming-card:hover {
          transform: translateY(-5px);
          box-shadow: 4px 6px 12px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }

        .today-card:nth-of-type(4n + 1) {
          border-left: 5px solid #ff3131;
        }

        .today-card:nth-of-type(4n + 2) {
          border-left: 5px solid #ff66c4;
        }

        .today-card:nth-of-type(4n + 3) {
          border-left: 5px solid #ffe063;
        }

        .today-card:nth-of-type(4n) {
          border-left: 5px solid #ff914d;
        }

        .upcomming-card {
          border-left: 5px solid #006981;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          min-width: 0;
        }

        .card-header h1 {
          color: #0b2548;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          text-decoration: underline;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
          margin-right: 0.5rem;
        }

        .ellipsis-container {
          position: relative;
          flex-shrink: 0;
        }

        .popup-menu {
          position: absolute;
          display: flex;
          flex-direction: column;
          top: 100%;
          right: 0;
          min-width: 140px;
          background-color: white;
          border: 1px solid #e1e4e8;
          border-radius: 5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          overflow: hidden;
        }

        .popup-option {
          padding: 0.5rem 0.8rem;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .popup-option:hover {
          background-color: #f5f5f5;
        }

        .option-icon {
          margin-right: 0.6rem;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .option-text {
          flex-grow: 1;
          text-align: left;
          white-space: nowrap;
          color: #0b2548;
          font-size: 0.85rem;
        }

        .info {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.6rem;
          margin: 0.2rem 0;
        }

        .info h2 {
          color: #0b2548;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .info p {
          color: #0b2548;
          font-size: 0.85rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .modal-content {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          border: 2px solid #e0e0e0;
        }

        .modal-header {
          padding: 1.2rem 1.5rem;
          background-color: #3b9aa9;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid rgba(0, 0, 0, 0.1);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
          color: rgb(36, 56, 92);
        }

        .modal-body {
          padding: 1.5rem;
          text-align: center;
          background-color: #fff;
        }

        .modal-body p {
          margin-bottom: 1rem;
          color: #333;
          font-size: 1rem;
          line-height: 1.5;
        }

        .warning-text {
          color: #f44336;
          font-weight: bold;
          font-size: 1rem;
          background-color: rgba(244, 67, 54, 0.1);
          padding: 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
          background-color: #f5f5f5;
          border-top: 2px solid #e0e0e0;
          gap: 12px;
        }

        .modal-button {
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

        .modal-button.cancel {
          background-color: #f5f5f5;
          color: #555;
          border-color: #ccc;
        }

        .modal-button.cancel:hover {
          background-color: #e0e0e0;
        }

        .modal-button.confirm {
          background: linear-gradient(135deg, #0c434d, #3b9aa9);
          color: white;
          border-color: #0b3e8a;
        }

        .modal-button.confirm:hover {
          background: linear-gradient(135deg, #3b9aa9, #0c434d);
        }

        .modal-button.confirm.danger {
          background-color: #f44336;
          color: white;
        }

        .modal-button.confirm.danger:hover {
          background-color: #d32f2f;
        }

        @media (max-width: 1024px) {
          .session-grid {
            grid-template-columns: 1fr;
            grid-gap: 1rem;
          }
          .modal-content {
            width: 85%;
          }
        }

        @media (max-width: 768px) {
          .session-wrapper {
            width: 95%;
            margin: 1rem auto;
            padding: 0.3rem;
          }
          .modal-content {
            width: 90%;
          }
        }

        @media (max-width: 576px) {
          .modal-content {
            width: 95%;
            max-width: 100%;
          }
          .modal-footer {
            flex-direction: column;
            gap: 0.5rem;
          }
          .modal-button {
            width: 100%;
            margin: 0;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}