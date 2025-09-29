'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisH, 
  faCalendarAlt, 
  faTimes, 
  faUser, 
  faClock, 
  faMapMarkerAlt, 
  faFileAlt, 
  faEye, 
  faDownload,
  faFile
} from '@fortawesome/free-solid-svg-icons';
import RescheduleDialog from '@/components/learnerpage/RescheduleDialog/page';

interface ScheduleItem {
  id: number;
  subject: string;
  mentor: {
    user: {
      name: string;
    };
    ment_inf_id: number;
  };
  date: string;
  time: string;
  location: string;
  files?: any[];
}

interface SessionComponentProps {
  schedule?: ScheduleItem[];
  upcomingSchedule?: ScheduleItem[];
  mentFiles?: {
    files: Array<{
      id: number;
      file_name: string;
      file_id: string;
      owner_id: number;
    }>;
  };
  schedForReview?: ScheduleItem[];
  userInformation?: any[];
  userData?: any;
}

interface PopupState {
  type: string | null;
  index: number | null;
}

export default function SessionComponent({ 
  schedule = [], 
  upcomingSchedule = [], 
  mentFiles = { files: [] },
  schedForReview = [],
  userInformation = [],
  userData
}: SessionComponentProps) {
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<PopupState>({ type: null, index: null });
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [upcommingSchedule, setUpcommingSchedule] = useState<ScheduleItem[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [reschedIsOpen, setReschedIsOpen] = useState(false);
  const [selectedSessionID, setSelectedSessionID] = useState<number | null>(null);

  // Filter files for selected mentor
  const filteredFiles = mentFiles?.files?.filter(file => 
    String(file.owner_id) === String(selectedMentorId)
  ) || [];

  const openFileModal = (files: any[], event: React.MouseEvent, mentorId: number) => {
    event.stopPropagation();
    setSelectedMentorId(mentorId);
    setIsFileModalOpen(true);
  };

  const closeFileModal = () => {
    setIsFileModalOpen(false);
    setSelectedMentorId(null);
  };

  const togglePopup = (type: string, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (activePopup.type === type && activePopup.index === index) {
      setActivePopup({ type: null, index: null });
    } else {
      setActivePopup({ type, index });
    }
  };

  const handleOptionClick = (option: string, item: ScheduleItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedItem(item);

    switch (option) {
      case "reschedule":
        setSelectedSessionID(item.id);
        setReschedIsOpen(true);
        break;
      case "cancel":
        setShowCancelConfirmation(true);
        break;
    }
    setActivePopup({ type: null, index: null });
  };

  const cancelSession = async (item: ScheduleItem | null) => {
    if (!item) return;
    
    try {
      // Replace with your API call
      const response = await fetch(`/api/send/session/cancel/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setTodaySchedule(prev => prev.filter(session => session.id !== item.id));
        setUpcommingSchedule(prev => prev.filter(session => session.id !== item.id));
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setShowCancelConfirmation(false);
    }
  };

  const previewFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/preview/file/${fileId}`);
      const data = await response.json();
      window.open(data.webViewLink, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error);
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/download/file/${fileId}`);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleReschedule = async (newDate: string, newTime: string) => {
    if (!selectedSessionID) return;
    
    try {
      // Replace with your API call
      const response = await fetch(`/api/send/session/reschedule/${selectedSessionID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime
        }),
      });

      if (response.ok) {
        // Update the local state with the new schedule
        const updatedSchedule = todaySchedule.map(session => 
          session.id === selectedSessionID 
            ? { ...session, date: newDate, time: newTime }
            : session
        );
        setTodaySchedule(updatedSchedule);

        const updatedUpcomingSchedule = upcommingSchedule.map(session => 
          session.id === selectedSessionID 
            ? { ...session, date: newDate, time: newTime }
            : session
        );
        setUpcommingSchedule(updatedUpcomingSchedule);

        setReschedIsOpen(false);
        alert('Session rescheduled successfully!');
      }
    } catch (error) {
      console.error('Error rescheduling session:', error);
      alert('Failed to reschedule session. Please try again.');
    }
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside any popup menu
      if (!(event.target as Element).closest('.popup-menu') && 
          !(event.target as Element).closest('.ellipsis-container')) {
        setActivePopup({ type: null, index: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Initialize schedules
  useEffect(() => {
    console.log('SessionComponent received schedule:', schedule);
    console.log('SessionComponent received upcomingSchedule:', upcomingSchedule);
    console.log('SessionComponent received mentFiles:', mentFiles);
    
    setTodaySchedule(schedule || []);
    setUpcommingSchedule(upcomingSchedule || []);
  }, [schedule, upcomingSchedule]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="session-wrapper">
      <div className="table-header">
        <h2 className="table-title">
          <FontAwesomeIcon icon={faCalendarAlt} className="header-icon" />
          Session Schedule
        </h2>
      </div>

      <div className="lower-element">
        <div className="session-grid">
          {/* Today Schedule */}
          <div className="session-card">
            <h1>TODAY</h1>
            <div className="session-card-content">
              {todaySchedule.length === 0 ? (
                <div className="no-sessions">
                  <p>No sessions scheduled for today</p>
                </div>
              ) : (
                todaySchedule.map((item, index) => (
                  <div key={item.id} className="today-card">
                    <div className="card-header">
                      <h1>{item.subject}</h1>
                      <div className="ellipsis-container">
                        <FontAwesomeIcon
                          icon={faEllipsisH}
                          size="2x"
                          style={{ color: '#066678', cursor: 'pointer' }}
                          onClick={(e) => togglePopup('today', index, e)}
                        />
                        {activePopup.type === 'today' && activePopup.index === index && (
                          <div className="popup-menu" onClick={e => e.stopPropagation()}>
                            <div
                              className="popup-option"
                              onClick={(e) => handleOptionClick('reschedule', item, e)}
                            >
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                size="1x"
                                style={{ color: '#066678' }}
                                className="option-icon"
                              />
                              <p className="option-text">Reschedule</p>
                            </div>
                            <div
                              className="popup-option"
                              onClick={(e) => handleOptionClick('cancel', item, e)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                size="1x"
                                style={{ color: '#066678' }}
                                className="option-icon"
                              />
                              <p className="option-text">Cancel Session</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="info name">
                      <FontAwesomeIcon icon={faUser} size="2x" style={{ color: '#533566' }} />
                      <h2>{item.mentor?.user?.name || 'Unknown Mentor'}</h2>
                    </div>
                    <div className="info">
                      <FontAwesomeIcon icon={faCalendarAlt} size="2x" style={{ color: '#0084ce' }} />
                      <p>{formatDate(item.date)}</p>
                    </div>
                    <div className="info">
                      <FontAwesomeIcon icon={faClock} size="2x" style={{ color: '#f8312f' }} />
                      <p>{item.time}</p>
                    </div>
                    <div className="info last">
                      <div className="location-container">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" style={{ color: '#f72197' }} />
                        <p className="location-text">{item.location}</p>
                      </div>
                      <div className="action-icons">
                        <FontAwesomeIcon
                          icon={faFileAlt}
                          size="2x"
                          style={{ color: '#f72197', cursor: 'pointer' }}
                          className="file-icon"
                          onClick={(e) => openFileModal(item.files || [], e, item.mentor?.ment_inf_id || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="session-card">
            <h1>UPCOMING</h1>
            <div className="session-card-content">
              {upcommingSchedule.length === 0 ? (
                <div className="no-sessions">
                  <p>No upcoming sessions</p>
                </div>
              ) : (
                upcommingSchedule.map((item, index) => (
                  <div key={item.id} className="upcomming-card">
                    <div className="card-header">
                      <h1>{item.subject}</h1>
                      <div className="ellipsis-container">
                        <FontAwesomeIcon
                          icon={faEllipsisH}
                          size="2x"
                          style={{ color: '#066678', cursor: 'pointer' }}
                          onClick={(e) => togglePopup('upcoming', index, e)}
                        />
                        {activePopup.type === 'upcoming' && activePopup.index === index && (
                          <div className="popup-menu" onClick={e => e.stopPropagation()}>
                            <div
                              className="popup-option"
                              onClick={(e) => handleOptionClick('reschedule', item, e)}
                            >
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                size="1x"
                                style={{ color: '#066678' }}
                                className="option-icon"
                              />
                              <p className="option-text">Reschedule</p>
                            </div>
                            <div
                              className="popup-option"
                              onClick={(e) => handleOptionClick('cancel', item, e)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                size="1x"
                                style={{ color: '#066678' }}
                                className="option-icon"
                              />
                              <p className="option-text">Cancel Session</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="info name">
                      <FontAwesomeIcon icon={faUser} size="2x" style={{ color: '#533566' }} />
                      <h2>{item.mentor?.user?.name || 'Unknown Mentor'}</h2>
                    </div>
                    <div className="info">
                      <FontAwesomeIcon icon={faCalendarAlt} size="2x" style={{ color: '#0084ce' }} />
                      <p>{formatDate(item.date)}</p>
                    </div>
                    <div className="info">
                      <FontAwesomeIcon icon={faClock} size="2x" style={{ color: '#f8312f' }} />
                      <p>{item.time}</p>
                    </div>
                    <div className="info last">
                      <div className="location-container">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" style={{ color: '#f72197' }} />
                        <p className="location-text">{item.location}</p>
                      </div>
                      <div className="action-icons">
                        <FontAwesomeIcon
                          icon={faFileAlt}
                          size="2x"
                          style={{ color: '#f72197', cursor: 'pointer' }}
                          className="file-icon"
                          onClick={(e) => openFileModal(item.files || [], e, item.mentor?.ment_inf_id || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Modal */}
      {isFileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Mentor&apos;s Files</h3>
              <button onClick={closeFileModal} className="close-button">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {filteredFiles.length === 0 ? (
                <div className="no-files">
                  <p>No files available from this mentor</p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file.id} className="file-item">
                    <FontAwesomeIcon icon={faFile} className="file-icon" />
                    <span className="file-name">{file.file_name}</span>
                    <div className="file-actions">
                      <button
                        className="modal-button preview"
                        onClick={() => previewFile(file.file_id)}
                        title="Preview"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="modal-button download"
                        onClick={() => downloadFile(file.file_id, file.file_name)}
                        title="Download"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                <strong> {selectedItem?.subject}</strong> with
                <strong> {selectedItem?.mentor?.user?.name}</strong>?
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
                onClick={() => cancelSession(selectedItem)}
              >
                Yes, Cancel Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {reschedIsOpen && selectedSessionID && (
        <div className="modal-overlay">
          <RescheduleDialog
            sessionId={selectedSessionID}
            currentDate={selectedItem?.date || ''}
            currentTime={selectedItem?.time || ''}
            onClose={() => setReschedIsOpen(false)}
            onReschedule={handleReschedule}
          />
        </div>
      )}

      <style jsx>{`
        .session-wrapper {
          background: var(--bg-light);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(26, 79, 159, 0.5);
          width: 90%;
          margin-top: 2rem;
          margin-left: 2.5rem;
          padding: 0 1rem;
          text-align: center;
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
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 0.8rem;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .header-icon {
          font-size: 1.4rem;
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
          color: var(--primary-dark);
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
          border-left: 5px solid var(--primary);
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
          color: var(--text-dark);
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
          border: 1px solid var(--border);
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
          flex-shrink: 0;
        }

        .option-text {
          flex-grow: 1;
          text-align: left;
          white-space: nowrap;
          color: var(--text-dark);
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
          color: var(--text-dark);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .info p {
          color: var(--text-dark);
          font-size: 0.85rem;
        }

        .info svg {
          width: 14px;
        }

        .last {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 0.5rem;
          gap: 0.5rem;
        }

        .last > div:first-child {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .last > div:first-child p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.85rem;
          margin: 0;
        }

        .last > div:last-child {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          width: 40px;
        }

        .location-container {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          min-width: 0;
        }

        .location-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.85rem;
        }

        .action-icons {
          display: flex;
          gap: 0.8rem;
          align-items: center;
          flex-shrink: 0;
        }

        .no-sessions {
          padding: 2rem;
          text-align: center;
          color: #666;
          font-style: italic;
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
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.2rem 1.5rem;
          background-color: var(--primary);
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

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: rgb(30, 50, 73);
          font-size: 1.2rem;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
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
          color: var(--danger);
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
          background-color: var(--primary);
          color: white;
          border-color: var(--primary-dark);
        }

        .modal-button.confirm:hover {
          background-color: var(--primary-dark);
        }

        .modal-button.confirm.danger {
          background-color: red;
        }

        .modal-button.confirm.danger:hover {
          background-color: #f55050;
        }

        .file-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
          transition: all 0.2s;
          background-color: #fff;
        }

        .file-item:hover {
          background-color: #f5f5f5;
        }

        .file-icon {
          margin-right: 1rem;
          color: rgb(52, 72, 99);
          font-size: 1.5rem;
        }

        .file-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          color: #2b3544;
          font-size: 1rem;
          font-weight: 500;
        }

        .file-actions {
          display: flex;
          gap: 0.8rem;
        }

        .no-files {
          padding: 1.5rem;
          color: #304453;
          font-size: 1rem;
          background-color: #fafafa;
          border-radius: 4px;
          margin: 1rem;
        }

        .file-actions .modal-button.preview {
          background-color: #2196f3;
          color: white;
          padding: 0.4rem 0.8rem;
        }

        .file-actions .modal-button.preview:hover {
          background-color: #0d8bf2;
        }

        .file-actions .modal-button.download {
          background-color: #4caf50;
          color: white;
          padding: 0.4rem 0.8rem;
        }

        .file-actions .modal-button.download:hover {
          background-color: #3e8e41;
        }

        @media (max-width: 1024px) {
          .session-grid {
            grid-template-columns: 1fr;
            grid-gap: 1rem;
          }

          .lower-element {
            height: auto;
            padding: 0.5rem;
          }

          .session-card {
            padding: 0 0.3rem 0.5rem 0.3rem;
          }
          .modal-content {
            width: 95%;
          }
        }

        @media (max-width: 768px) {
          .session-wrapper {
            width: 95%;
            margin: 1rem auto;
            padding: 0.3rem;
          }

          .table-header {
            padding: 1rem;
          }

          .table-title {
            font-size: 1.1rem;
          }

          .modal-content {
            width: 95%;
            max-width: 400px;
          }

          .today-card,
          .upcomming-card {
            padding: 0.7rem 0.9rem;
          }

          .card-header h1 {
            font-size: 0.9rem;
          }

          .info h2 {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .modal-footer {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modal-button {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }

          .session-card h1 {
            font-size: 1rem;
          }

          .info p {
            font-size: 0.8rem;
          }

          .action-icons {
            gap: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}

export const sampleData = {
  schedule: [
    {
      id: 1,
      subject: "Mathematics",
      mentor: {
        user: {
          name: "John Smith"
        },
        ment_inf_id: 101
      },
      date: new Date().toISOString().split('T')[0], // Today's date
      time: "10:00 AM",
      location: "Room 201, Building A",
      files: []
    },
    {
      id: 2,
      subject: "Physics",
      mentor: {
        user: {
          name: "Sarah Johnson"
        },
        ment_inf_id: 102
      },
      date: new Date().toISOString().split('T')[0], // Today's date
      time: "2:30 PM",
      location: "Online via Zoom",
      files: []
    }
  ],
  
  upcomingSchedule: [
    {
      id: 3,
      subject: "Chemistry",
      mentor: {
        user: {
          name: "Michael Brown"
        },
        ment_inf_id: 103
      },
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: "11:00 AM",
      location: "Lab 305, Science Building",
      files: []
    },
    {
      id: 4,
      subject: "Programming",
      mentor: {
        user: {
          name: "Emily Davis"
        },
        ment_inf_id: 104
      },
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
      time: "3:00 PM",
      location: "Computer Lab 101",
      files: []
    }
  ],

  mentFiles: {
    files: [
      {
        id: 1,
        file_name: "Math_Notes.pdf",
        file_id: "math123",
        owner_id: 101
      },
      {
        id: 2,
        file_name: "Physics_Assignment.docx",
        file_id: "phys456",
        owner_id: 102
      },
      {
        id: 3,
        file_name: "Chemistry_Lab_Guide.pdf",
        file_id: "chem789",
        owner_id: 103
      },
      {
        id: 4,
        file_name: "Programming_Tutorial.pdf",
        file_id: "prog101",
        owner_id: 104
      }
    ]
  }
};