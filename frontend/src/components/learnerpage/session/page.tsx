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
import './SessionComponent.css';

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
}