// src/components/mentorpage/viewUser/offer.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';

interface OfferProps {
  info: any[];
  mentorId: number;
  onClose: () => void;
  onConfirm: (offerData: any) => void;
}

export default function Offer({ info, mentorId, onClose, onConfirm }: OfferProps) {
  // Destructure the info array to match your Vue component
  const [
    learnerId, // userId
    learnerNo, // userId  
    learnerName, // userName
    learnerYear, // userYear
    learnerCourse, // userCourse
    learnerDur, // sessionDur
    learnerModality, // modality
    learnerStyle, // learnStyle
    learnerAvail, // availability
    learnerMode, // modality again
    learnerPic, // profilePic
    learnerSubjects, // subjects
  ] = info || [];

  // State variables
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('in-person');
  const [notes, setNotes] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<any[]>([]);
  const [showYearSelection, setShowYearSelection] = useState(false);

  // Available times
  const availableTimes = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  // Parse subjects
  const subjectOptions = useMemo(() => {
    try {
      return JSON.parse(learnerSubjects || "[]");
    } catch (e) {
      return [];
    }
  }, [learnerSubjects]);

  // Computed properties
  const isInPersonModality = useMemo(() => {
    const modality = learnerModality?.toLowerCase() || "";
    return modality === "in-person" || modality === "hybrid";
  }, [learnerModality]);

  const isOnlineModality = useMemo(() => {
    const modality = learnerModality?.toLowerCase() || "";
    return modality === "online" || modality === "hybrid";
  }, [learnerModality]);

  const isHybridModality = useMemo(() => {
    const modality = learnerModality?.toLowerCase() || "";
    return modality === "hybrid";
  }, [learnerModality]);

  // Years for selection
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

  // Available days
  const availableDays = useMemo(() => {
    try {
      return JSON.parse(learnerAvail || "[]").map((day: string) => day.toLowerCase());
    } catch (e) {
      return [];
    }
  }, [learnerAvail]);

  // Current month year display
  const currentMonthYear = useMemo(() => {
    return new Date(currentDate).toLocaleDateString("default", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate < today;
  };

  const isDateAvailable = (date: Date) => {
    if (isPastDate(date)) {
      return false;
    }

    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    return availableDays.includes(dayName);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate days for calendar
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthDays = firstDay.getDay();
    const nextMonthDays = 6 - lastDay.getDay();

    const newDays = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthLastDay - prevMonthDays + 1; i <= prevMonthLastDay; i++) {
      const date = new Date(year, month - 1, i);
      newDays.push({
        date,
        isCurrentMonth: false,
        isSelected: false,
        isToday: isToday(date),
        isAvailable: isDateAvailable(date),
      });
    }

    // Current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = formatDateForInput(date);
      newDays.push({
        date,
        isCurrentMonth: true,
        isSelected: selectedDate === dateString,
        isToday: isToday(date),
        isAvailable: isDateAvailable(date),
      });
    }

    // Next month's days
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      newDays.push({
        date,
        isCurrentMonth: false,
        isSelected: false,
        isToday: isToday(date),
        isAvailable: isDateAvailable(date),
      });
    }

    setDays(newDays);
  };

  // Date selection
  const selectDate = (day: any) => {
    if (!day.isAvailable) return;

    if (!day.isCurrentMonth) {
      const newDate = new Date(day.date);
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      return;
    }

    setSelectedDate(formatDateForInput(day.date));
  };

  // Month navigation
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDateForInput(today));
  };

  const selectYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearSelection(false);
  };

  // Confirm schedule
  const confirmSchedule = async () => {
    if (!selectedDate || !selectedTime || !selectedSubject) {
      alert("Please select date, time and subject");
      return;
    }

    if (sessionType === 'in-person' && !meetingLocation) {
      alert("Please enter a meeting location for in-person session");
      return;
    }

    // Format date
    const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    // Format time
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      alert("Invalid time format");
      return;
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;

    // Determine modality
    let selectedModality = learnerModality?.toLowerCase() || "";
    if (isHybridModality) {
      selectedModality = sessionType;
    }

    const scheduleData = {
      learner_id: learnerId,
      mentor_id: mentorId,
      date: formattedDate,
      time: formattedTime,
      modality: selectedModality,
      location: sessionType === 'in-person' ? meetingLocation : "online",
      subject: selectedSubject,
    };

    setIsSubmitting(true);
    setIsButtonActive(false);

    try {
      // Replace with your actual API call
      const response = await fetch('/api/mentor/send-offer', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      if (response.ok) {
        // You can add toast notification here
        console.log("Tutoring offer sent successfully!");
        onConfirm(scheduleData);
        onClose();
      } else {
        alert("Failed to send tutoring offer");
      }
    } catch (error) {
      console.error("Error sending offer:", error);
      alert("Error sending tutoring offer");
    } finally {
      setIsSubmitting(false);
      setIsButtonActive(true);
    }
  };

  // Effects
  useEffect(() => {
    generateDays();
  }, [currentDate, selectedDate]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (currentDate) {
      setSelectedDate(formatDateForInput(currentDate));
    }
  }, [currentDate]);

  return (
    <div className="booking">
      {/* Header */}
      <div className="header">
        <div className="flex items-center space-x-3">
          <h1>Send Offer</h1>
        </div>
        <button onClick={onClose} aria-label="Close" type="button">×</button>
      </div>

      {/* Profile info */}
      <div className="profile">
        <img
          src={learnerPic ? `/api/image/${learnerPic}` : 'https://placehold.co/400x400'}
          alt="Profile image"
          width="64"
          height="64"
        />
        <div>
          <p>
            <strong>{learnerName}</strong>
          </p>
          <p>{learnerYear} - {learnerCourse}</p>
          <p>College of Computer Studies</p>
        </div>
      </div>

      {/* Main content */}
      <div className="content">
        {/* Left side */}
        <div className="left">
          <div className="time-header">
            <h2>Select Time Slots</h2>
            <p>({learnerDur} duration)</p>
          </div>
          <div className="time-slots">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`time-btn ${selectedTime === time ? 'time-selected' : ''}`}
              >
                {time}
              </button>
            ))}
          </div>

          <h3 className="mode-header">Select Mode of Session</h3>
          <div className="mode-buttons">
            <button
              type="button"
              onClick={() => setSessionType('in-person')}
              className={`mode-btn ${sessionType === 'in-person' ? 'mode-active' : ''}`}
              disabled={!isInPersonModality}
            >
              <span aria-label="In Person"><i className="fas fa-user"></i></span>
              <span>In Person</span>
            </button>
            <button
              type="button"
              onClick={() => setSessionType('online')}
              className={`mode-btn ${sessionType === 'online' ? 'mode-active' : ''}`}
              disabled={!isOnlineModality}
            >
              <span aria-label="Online"><i className="fas fa-laptop"></i></span>
              <span>Online</span>
            </button>
          </div>

          {/* Location input */}
          {sessionType === 'in-person' && (
            <div className="location-input">
              <input
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                type="text"
                placeholder="Enter meeting location"
                className="location-field"
                required
              />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="right" style={{ marginLeft: '-20px' }}>
          <div className="calendar">
            <div className="calendar-header">
              <button className="arrow" onClick={prevMonth}>&lt;</button>
              <div className="month-container">
                <button
                  className="month"
                  onClick={() => setShowYearSelection(!showYearSelection)}
                >
                  {currentMonthYear}
                </button>
                <button className="today-btn" onClick={goToToday}>Today</button>
              </div>
              <button className="arrow" onClick={nextMonth}>&gt;</button>
            </div>

            {/* Year selection dropdown */}
            {showYearSelection && (
              <div className="year-select">
                {years.map((year) => (
                  <div
                    key={year}
                    onClick={() => selectYear(year)}
                    className={`year-option ${currentDate.getFullYear() === year ? 'year-active' : ''}`}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}

            {/* Available days legend */}
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-dot available"></span>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot unavailable"></span>
                <span>Unavailable</span>
              </div>
            </div>

            <div className="weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="days">
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day.isAvailable ? selectDate(day) : null}
                  className={[
                    'day',
                    day.isToday ? 'today' : '',
                    day.isSelected ? 'selected' : '',
                    day.isCurrentMonth ? 'current' : 'other',
                    day.isAvailable ? 'available' : 'unavailable',
                  ].join(' ')}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          </div>

          {/* Subject selection */}
          <div className="subject-select">
            <h3 className="subject-header">Select Subject</h3>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="subject-dropdown" 
              required
            >
              <option value="" disabled>Choose a subject</option>
              {subjectOptions.map((subject: string) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <button onClick={onClose} type="button" className="btn-cancel">
          CANCEL
        </button>
        <button 
          onClick={confirmSchedule} 
          type="button" 
          className="btn-proceed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'SENDING...' : 'PROCEED'}
        </button>
      </div>

      <style jsx>{`
        /* Copy all your CSS from the Vue component here */
        .booking {
          border-bottom-width: 4px;
          width: 1000px;
          max-width: 900px;
          margin-left: 10rem;
          margin-right: -10rem;
          top: 1rem;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(26, 79, 159, 0.5);
          position: fixed;
          z-index: 999;
          background: white;
          border-radius: 1.5rem;
        }

        .header {
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          color: white;
          padding: 0.75rem 1.25rem;
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 30;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
          font-weight: 800;
          font-size: 1.125rem;
          user-select: none;
        }

        .header button {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          color: white;
          background: none;
          border: none;
          cursor: pointer;
          user-select: none;
          transition: transform 0.2s;
        }

        .header button:hover {
          transform: scale(1.1);
        }

        .profile {
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          color: #0b3b44;
          border-bottom: 1px solid #e9ecef;
        }

        .profile img {
          width: 4rem;
          height: 4rem;
          border-radius: 9999px;
          border: 2px solid #0b3b44;
          object-fit: cover;
        }

        .profile div p {
          margin: 0.25rem 0;
        }

        .profile div p:first-child {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2.5rem;
          background-color: white;
          overflow-y: auto;
          flex-grow: 1;
          height: calc(100% - 140px);
        }

        @media (min-width: 768px) {
          .content {
            flex-direction: row;
          }
        }

        .left,
        .right {
          flex: 1;
        }

        .time-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .time-header h2 {
          font-weight: 600;
          color: #0b3b44;
          font-size: 0.875rem;
          user-select: none;
          margin: 0;
        }

        .time-header p {
          font-style: italic;
          font-size: 0.75rem;
          color: #6c757d;
          user-select: none;
          margin: 0;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 2rem;
          max-width: 20rem;
        }

        .time-btn {
          background-color: #e9ecef;
          color: #495057;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          user-select: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-btn:hover {
          background-color: #dee2e6;
        }

        .time-selected {
          background-color: #0b3b44;
          color: white;
        }

        .time-selected:hover {
          background-color: #0a2e34;
        }

        .mode-header {
          font-weight: 600;
          color: #0b3b44;
          font-size: 0.875rem;
          margin: 2rem 0 0.75rem 0;
          user-select: none;
        }

        .mode-buttons {
          display: flex;
          gap: 1.5rem;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          user-select: none;
          border: 1px solid #ced4da;
          background-color: white;
          transition: all 0.2s;
        }

        .mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #e9ecef;
        }

        .mode-btn:disabled:hover {
          background-color: #e9ecef;
        }

        .mode-btn:hover {
          background-color: #f1f3f5;
        }

        .mode-active {
          background-color: #0b3b44;
          color: white;
          border-color: #0b3b44;
        }

        .mode-active:hover {
          background-color: #0a2e34;
        }

        .location-input {
          margin-top: 1rem;
        }

        .location-field {
          width: 100%;
          max-width: 300px;
          padding: 0.5rem 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .location-field:focus {
          outline: none;
          border-color: #0b3b44;
          box-shadow: 0 0 0 2px rgba(11, 59, 68, 0.1);
        }

        .right {
          max-width: 22rem;
        }

        .calendar {
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          padding: 0.75rem;
          font-family: Arial, sans-serif;
          font-size: 0.75rem;
          color: #495057;
          width: 100%;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.8125rem;
          color: #6c757d;
        }

        .month-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .calendar-header .month {
          font-weight: 700;
          color: #212529;
          font-size: 0.8125rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }

        .calendar-header .month:hover {
          background-color: #f1f3f5;
        }

        .calendar-header .today-btn {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          background: none;
          border: 1px solid #ced4da;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .calendar-header .today-btn:hover {
          background-color: #f1f3f5;
        }

        .calendar-header .arrow {
          display: flex;
          gap: 0.25rem;
          color: #495057;
          cursor: pointer;
          user-select: none;
          background: none;
          border: none;
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }

        .calendar-header .arrow:hover {
          background-color: #f1f3f5;
        }

        .year-select {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 0.25rem;
          border: 1px solid #e9ecef;
        }

        .year-option {
          padding: 0.25rem;
          text-align: center;
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .year-option:hover {
          background-color: #e9ecef;
        }

        .year-active {
          background-color: #0b3b44;
          color: white;
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin: 0.5rem 0;
          font-size: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.available {
          background-color: #0b3b44;
        }

        .legend-dot.unavailable {
          background-color: #e9ecef;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 0.25rem;
          text-align: center;
          font-size: 0.625rem;
          font-weight: 400;
          color: #6c757d;
          margin-bottom: 0.25rem;
        }

        .days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 0.25rem;
          text-align: center;
          font-size: 0.6875rem;
          font-weight: 400;
        }

        .day {
          padding: 0.5rem 0;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .day:hover {
          background-color: #f1f3f5;
        }

        .day.current {
          color: #212529;
          font-weight: 600;
        }

        .day.other {
          color: #adb5bd;
          font-weight: 400;
        }

        .day.today {
          background-color: #349eb1;
          color: white;
        }

        .day.selected {
          background-color: #0b3b44;
          color: white;
        }

        .day.available {
          color: #212529;
          cursor: pointer;
        }

        .day.unavailable {
          color: #ced4da;
          cursor: not-allowed;
          background-color: #f8f9fa;
        }

        .day.unavailable:hover {
          background-color: #f8f9fa;
        }

        .day.selected.available {
          background-color: #0b3b44;
          color: white;
        }

        .footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #dee2e6;
          background-color: white;
          border-bottom-left-radius: 1.5rem;
          border-bottom-right-radius: 1.5rem;
          position: sticky;
          bottom: 0;
          z-index: 30;
          box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-cancel {
          color: #dc3545;
          font-weight: 600;
          font-size: 0.875rem;
          border: 1px solid #dc3545;
          border-radius: 0.375rem;
          padding: 0.5rem 1.25rem;
          cursor: pointer;
          user-select: none;
          background: none;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background-color: #f8f9fa;
        }

        .btn-proceed {
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 0.375rem;
          padding: 0.5rem 1.25rem;
          cursor: pointer;
          user-select: none;
          border: none;
          transition: all 0.2s;
        }

        .btn-proceed:hover {
          background: linear-gradient(135deg, #2b737e, #0b2b31);
        }

        .btn-proceed:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .subject-select {
          margin-top: 1.5rem;
          width: 100%;
        }

        .subject-header {
          font-weight: 600;
          color: #0b3b44;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          user-select: none;
        }

        .subject-dropdown {
          width: 100%;
          padding: 0.625rem 1rem;
          border: 1px solid #ced4da;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background-color: white;
          color: #495057;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b3b44' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          transition: all 0.2s;
        }

        .subject-dropdown:focus {
          outline: none;
          border-color: #0b3b44;
          box-shadow: 0 0 0 2px rgba(11, 59, 68, 0.1);
        }

        .subject-dropdown option {
          white-space: normal;
          word-wrap: break-word;
          padding: 8px 12px;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .booking {
            width: 100%;
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
          }
        }

        @media (max-width: 992px) {
          .content {
            padding: 1.5rem;
          }
          .time-slots {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .content {
            height: calc(100% - 160px);
          }
          .header {
            position: sticky;
            top: 0;
          }
          .footer {
            position: sticky;
            bottom: 0;
          }
        }

        @media (max-width: 576px) {
          .booking {
            margin-top: 0;
            top: 0;
            border-radius: 0;
            max-height: 100vh;
            width: 100%;
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
}