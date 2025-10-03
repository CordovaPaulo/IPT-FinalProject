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
import styles from './session.module.css';

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

  const todayPopupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const upcomingPopupRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize schedules
  useEffect(() => {
    setTodaySchedule(schedule);
    setUpcommingSchedule(upcomingSchedule);
  }, [schedule, upcomingSchedule]);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideToday = todayPopupRefs.current.every(
        ref => ref && !ref.contains(event.target as Node)
      );
      const isOutsideUpcoming = upcomingPopupRefs.current.every(
        ref => ref && !ref.contains(event.target as Node)
      );

      if (isOutsideToday && isOutsideUpcoming) {
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
    const popupId = `${type}-${index}`;
    if (activePopup.type === popupId) {
      setActivePopup({ type: null, index: null });
    } else {
      setActivePopup({ type: popupId, index });
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
    <div className={styles.sessionWrapper}>
      {/* Header Section */}
      <div className={styles.sessionTableHeader}>
        <h2 className={styles.sessionTableTitle}>
          <FontAwesomeIcon icon={faCalendar} className={styles.sessionHeaderIcon} />
          Session Schedule
        </h2>
      </div>

      {/* Main Content Section */}
      <div className={styles.sessionLowerElement}>
        <div className={styles.sessionGrid}>
          {/* Today Schedule */}
          <div className={styles.sessionCard}>
            <h1>TODAY</h1>
            <div className={styles.sessionCardContent}>
              {todaySchedule.map((item, index) => (
                <div key={item.id} className={styles.sessionTodayCard}>
                  <div className={styles.sessionCardHeader}>
                    <h1>{item.subject}</h1>
                    <div 
                      className={styles.sessionEllipsisContainer} 
                      ref={el => todayPopupRefs.current[index] = el}
                    >
                      <FontAwesomeIcon 
                        icon={faEllipsisH}
                        style={{ cursor: 'pointer', color: '#066678', fontSize: '1.2rem' }}
                        onClick={(e) => togglePopup('today', index, e)}
                      />
                      {activePopup.type === `today-${index}` && (
                        <div className={styles.sessionPopupMenu} onClick={(e) => e.stopPropagation()}>
                          <div 
                            className={styles.sessionPopupOption}
                            onClick={(e) => handleOptionClick('remind', item, e)}
                          >
                            <FontAwesomeIcon icon={faBell} className={styles.sessionOptionIcon} />
                            <p className={styles.sessionOptionText}>Remind</p>
                          </div>
                          <div 
                            className={styles.sessionPopupOption}
                            onClick={(e) => handleOptionClick('reschedule', item, e)}
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className={styles.sessionOptionIcon} />
                            <p className={styles.sessionOptionText}>Reschedule</p>
                          </div>
                          <div 
                            className={styles.sessionPopupOption}
                            onClick={(e) => handleOptionClick('cancel', item, e)}
                          >
                            <FontAwesomeIcon icon={faTimes} className={styles.sessionOptionIcon} />
                            <p className={styles.sessionOptionText}>Cancel Session</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faUser} style={{ color: '#533566', fontSize: '1.2rem' }} />
                    <h2>{item.learner?.user?.name ?? "Unknown User"}</h2>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#0084ce', fontSize: '1.2rem' }} />
                    <p>{item.date}</p>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faClock} style={{ color: '#f8312f', fontSize: '1.2rem' }} />
                    <p>{item.time}</p>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#f72197', fontSize: '1.2rem' }} />
                    <p>{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className={styles.sessionCard}>
            <h1>UPCOMING</h1>
            <div className={styles.sessionCardContent}>
              {upcommingSchedule.map((item, index) => (
                <div key={item.id} className={styles.sessionUpcomingCard}>
                  <div className={styles.sessionCardHeader}>
                    <h1>{item.subject}</h1>
                    <div 
                      className={styles.sessionEllipsisContainer} 
                      ref={el => upcomingPopupRefs.current[index] = el}
                    >
                      <FontAwesomeIcon 
                        icon={faEllipsisH}
                        style={{ cursor: 'pointer', color: '#066678', fontSize: '1.2rem' }}
                        onClick={(e) => togglePopup('upcoming', index, e)}
                      />
                      {activePopup.type === `upcoming-${index}` && (
                        <div className={styles.sessionPopupMenu} onClick={(e) => e.stopPropagation()}>
                          <div 
                            className={styles.sessionPopupOption}
                            onClick={(e) => handleOptionClick('remind', item, e)}
                          >
                            <FontAwesomeIcon icon={faBell} className={styles.sessionOptionIcon} />
                            <p className={styles.sessionOptionText}>Remind</p>
                          </div>
                          <div 
                            className={styles.sessionPopupOption}
                            onClick={(e) => handleOptionClick('reschedule', item, e)}
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className={styles.sessionOptionIcon} />
                            <p className={styles.sessionOptionText}>Reschedule</p>
                          </div>
                          <div 
                            className={styles.sessionPopupOption}
                            onClick={(e) => handleOptionClick('cancel', item, e)}
                          >
                            <FontAwesomeIcon icon={faTimes} className={styles.sessionOptionIcon} />
                            <p className={styles.sessionOptionText}>Cancel</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faUser} style={{ color: '#533566', fontSize: '1.2rem' }} />
                    <h2>{item.learner.user.name}</h2>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#0084ce', fontSize: '1.2rem' }} />
                    <p>{item.date}</p>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faClock} style={{ color: '#f8312f', fontSize: '1.2rem' }} />
                    <p>{item.time}</p>
                  </div>
                  <div className={styles.sessionInfo}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#f72197', fontSize: '1.2rem' }} />
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
        <div className={styles.sessionModalOverlay}>
          <div className={styles.sessionModalContent}>
            <div className={styles.sessionModalHeader}>
              <h3>Send Reminder</h3>
            </div>
            <div className={styles.sessionModalBody}>
              <p>
                Are you sure you want to send a reminder for
                <strong> {selectedItem?.subject} </strong> to
                <strong> {selectedItem?.learner.user.name}</strong>?
              </p>
            </div>
            <div className={styles.sessionModalFooter}>
              <button
                className={`${styles.sessionModalButton} ${styles.sessionModalButtonCancel}`}
                onClick={() => setShowRemindConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.sessionModalButton} ${styles.sessionModalButtonConfirm}`}
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
        <div className={styles.sessionModalOverlay}>
          <div className={styles.sessionModalContent}>
            <div className={styles.sessionModalHeader}>
              <h3>Cancel Session</h3>
            </div>
            <div className={styles.sessionModalBody}>
              <p>
                Are you sure you want to cancel
                <strong> {selectedItem?.subject} </strong> with
                <strong> {selectedItem?.learner.user.name}</strong>?
              </p>
              <p className={styles.sessionWarningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.sessionModalFooter}>
              <button
                className={`${styles.sessionModalButton} ${styles.sessionModalButtonCancel}`}
                onClick={() => setShowCancelConfirmation(false)}
              >
                No, Keep It
              </button>
              <button
                className={`${styles.sessionModalButton} ${styles.sessionModalButtonConfirm} ${styles.sessionModalButtonConfirmDanger}`}
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
    </div>
  );
}