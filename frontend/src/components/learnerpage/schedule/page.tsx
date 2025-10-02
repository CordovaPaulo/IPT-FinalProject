'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface ScheduleProps {
  info: any; // Change this to accept an object instead of array
  onClose: () => void;
  onConfirm: (data: any) => void;
}

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isAvailable: boolean;
  isPast: boolean;
}

export default function Schedule({ info, onClose, onConfirm }: ScheduleProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes] = useState([
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ]);
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('in-person');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calendar variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<Day[]>([]);
  const [showYearSelection, setShowYearSelection] = useState(false);

  // Destructure from object instead of array
  const {
    mentorId,
    mentorName,
    mentorYear,
    mentorCourse,
    mentorSessionDur,
    mentorModality,
    mentorTeachStyle,
    mentorAvailability,
    mentorProfilePic,
    mentorSubjects,
  } = info || {};

  // Add useEffect to log the received data for debugging
  useEffect(() => {
    console.log("Schedule component received info:", info);
    console.log("Mentor details:", {
      mentorId,
      mentorName,
      mentorYear,
      mentorCourse,
      mentorSessionDur,
      mentorModality,
      mentorTeachStyle,
      mentorAvailability,
      mentorProfilePic,
      mentorSubjects,
    });
  }, [info]);

  // Parse subjects with better error handling
  const subjectOptions = () => {
    try {
      if (Array.isArray(mentorSubjects)) {
        return mentorSubjects;
      }
      if (typeof mentorSubjects === 'string') {
        return JSON.parse(mentorSubjects);
      }
      return [];
    } catch (e) {
      console.error("Error parsing subjects:", e);
      return [];
    }
  };

  // Get available days with better error handling
  const availableDays = () => {
    try {
      if (Array.isArray(mentorAvailability)) {
        return mentorAvailability.map((day: string) => day.toLowerCase());
      }
      if (typeof mentorAvailability === 'string') {
        return JSON.parse(mentorAvailability).map((day: string) => day.toLowerCase());
      }
      return [];
    } catch (e) {
      console.error("Error parsing availability:", e);
      return [];
    }
  };

  // Generate years for selection (±5 years from current)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  // Format date as YYYY-MM-DD for the input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is available
  const isDateAvailable = (date: Date) => {
    if (isPastDate(date)) {
      return false;
    }

    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    return availableDays().includes(dayName);
  };

  // Generate calendar days
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthDays = firstDay.getDay();
    const nextMonthDays = 6 - lastDay.getDay();

    const newDays: Day[] = [];

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
        isPast: isPastDate(date),
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
        isPast: isPastDate(date),
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
        isPast: isPastDate(date),
      });
    }

    setDays(newDays);
  };

  // Handle date selection
  const selectDate = (day: Day) => {
    if (!day.isAvailable) return;

    if (!day.isCurrentMonth) {
      const newDate = new Date(day.date);
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      setTimeout(generateDays, 0);
      return;
    }

    setSelectedDate(formatDateForInput(day.date));
    setTimeout(generateDays, 0);
  };

  // Calendar navigation
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    setTimeout(generateDays, 0);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    setTimeout(generateDays, 0);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDateForInput(today));
    setTimeout(generateDays, 0);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearSelection(false);
    setTimeout(generateDays, 0);
  };

  const currentMonthYear = new Date(currentDate).toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  // Confirm schedule
  const confirmSchedule = async () => {
    if (!selectedDate || !selectedTime || !selectedSubject) {
      alert("Please select date, time and subject");
      return;
    }

    if (sessionType === "in-person" && !meetingLocation) {
      alert("Please enter a meeting location");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format time to 24-hour format for backend
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error("Invalid time format");
      }

      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = timeMatch[3].toUpperCase();

      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;

      // Convert date to ISO string for MongoDB
      const scheduleDate = new Date(selectedDate);

      const scheduleData = {
        date: scheduleDate.toISOString(),
        time: formattedTime,
        location: sessionType === "in-person" ? meetingLocation : "online",
        subject: selectedSubject,
      };

      console.log("Scheduling data:", scheduleData);
      
      // Make API call to create schedule
      const token = getCookie('MindMateToken');
      const response = await api.post(`/api/learner/schedule/${mentorId}`, scheduleData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status !== 201) {
        throw new Error('Failed to create schedule');
      }

      const result = response.data;
      onConfirm(result);
      onClose();
    } catch (error) {
      console.error("Error scheduling:", error);
      alert("Failed to create schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize calendar
  useEffect(() => {
    setSelectedDate(formatDateForInput(new Date()));
    generateDays();
  }, []);

  // Regenerate days when currentDate changes
  useEffect(() => {
    generateDays();
  }, [currentDate, selectedDate]);

  return (
    <div className="booking">
      {/* Header */}
      <div className="header">
        <div className="flex items-center space-x-3">
          <h1>Book a Session</h1>
        </div>
        <button onClick={onClose} aria-label="Close" type="button">×</button>
      </div>

      {/* Profile info */}
      <div className="profile">
        <img
          alt="Profile image"
          src={mentorProfilePic || 'https://placehold.co/400x400'}
          width="64"
          height="64"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x400';
          }}
        />
        <div>
          <p><strong>{mentorName || 'Mentor Name'}</strong></p>
          <p>{mentorYear || 'Year'} - {mentorCourse || 'Course'}</p>
          <p>College of Computer Studies</p>
        </div>
      </div>

      {/* Main content */}
      <div className="content">
        {/* Left side */}
        <div className="left">
          <div className="time-header">
            <h2>Select Time Slots</h2>
            <p>({mentorSessionDur || 'Duration not specified'})</p>
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
              disabled={!mentorModality?.toLowerCase().includes('in-person') && !mentorModality?.toLowerCase().includes('both')}
            >
              <span aria-label="In Person"><i className="fas fa-user"></i></span>
              <span>In Person</span>
            </button>
            <button
              type="button"
              onClick={() => setSessionType('online')}
              className={`mode-btn ${sessionType === 'online' ? 'mode-active' : ''}`}
              disabled={!mentorModality?.toLowerCase().includes('online') && !mentorModality?.toLowerCase().includes('both')}
            >
              <span aria-label="Online"><i className="fas fa-laptop"></i></span>
              <span>Online</span>
            </button>
          </div>

          {sessionType === 'in-person' && (
            <div className="location-input">
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="Enter meeting location"
                className="location-field"
              />
            </div>
          )}
        </div>

        {/* Right side - Calendar */}
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
                  onClick={() => day.isAvailable && !day.isPast ? selectDate(day) : null}
                  className={`
                    day
                    ${day.isToday ? 'today' : ''}
                    ${day.isSelected ? 'selected' : ''}
                    ${day.isCurrentMonth ? 'current' : 'other'}
                    ${day.isAvailable && !day.isPast ? 'available' : 'unavailable'}
                    ${day.isPast ? 'past-date' : ''}
                  `}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          </div>

          <div className="subject-select">
            <h3 className="subject-header">Select Subject</h3>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)} 
              className="subject-dropdown" 
              required
            >
              <option value="" disabled>Choose a subject</option>
              {subjectOptions().map((subject: string, index: number) => (
                <option key={`${subject}-${index}`} value={subject} className="subject option">
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
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
          {isSubmitting ? 'PROCESSING...' : 'PROCEED'}
        </button>
      </div>

      <style jsx>{`
        .booking {
          border-bottom-width: 4px;
          width: 1000px;
          max-width: 1000px;
          margin: 3rem auto 0;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: white;
          border-radius: 1.5rem;
          position: relative;
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
          z-index: 10;
        }

        .header h1 {
          font-weight: 800;
          font-size: 1.125rem;
          user-select: none;
          margin: 0;
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
        }

        .profile {
          background-color: #d9d9d9;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          color: #0b3b44;
        }

        .profile img {
          width: 4rem;
          height: 4rem;
          border-radius: 9999px;
          border: 2px solid #0b3b44;
          object-fit: cover;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2.5rem;
          background-color: white;
          overflow-y: auto;
          flex-grow: 1;
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
          color: #9ca3af;
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
          background-color: #e5e7eb;
          color: #4b5563;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          user-select: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-selected {
          background-color: #0b3b44;
          color: white;
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
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
          user-select: none;
          border: 1px solid #d1d5db;
          background-color: white;
          transition: all 0.2s;
        }

        .mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f3f4f6;
        }

        .mode-btn:disabled:hover {
          background-color: #f3f4f6;
        }

        .mode-btn:hover {
          background-color: #f3f4f6;
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
          width: 70%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .right {
          max-width: 22rem;
        }

        .calendar {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
          padding: 0.75rem;
          font-family: Arial, sans-serif;
          font-size: 0.75rem;
          color: #4b5563;
          width: 100%;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.8125rem;
          color: #9ca3af;
        }

        .month-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .calendar-header .month {
          font-weight: 700;
          color: #000000;
          font-size: 0.8125rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .calendar-header .month:hover {
          background-color: #f0f0f0;
        }

        .calendar-header .today-btn {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          background: none;
          border: 1px solid #d1d5db;
          cursor: pointer;
        }

        .calendar-header .today-btn:hover {
          background-color: #f0f0f0;
        }

        .calendar-header .arrow {
          display: flex;
          gap: 0.25rem;
          color: #4b5563;
          cursor: pointer;
          user-select: none;
          background: none;
          border: none;
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .calendar-header .arrow:hover {
          background-color: #f0f0f0;
        }

        .year-select {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background-color: #f9f9f9;
          border-radius: 0.25rem;
          border: 1px solid #e5e7eb;
        }

        .year-option {
          padding: 0.25rem;
          text-align: center;
          cursor: pointer;
          border-radius: 0.25rem;
        }

        .year-option:hover {
          background-color: #e5e7eb;
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
          background-color: #e5e7eb;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 0.25rem;
          text-align: center;
          font-size: 0.625rem;
          font-weight: 400;
          color: #9ca3af;
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
          background-color: #f0f0f0;
        }

        .day.current {
          color: #000000;
          font-weight: 600;
        }

        .day.other {
          color: #9ca3af;
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
          color: #000000;
          cursor: pointer;
        }

        .day.unavailable {
          color: #d1d5db;
          cursor: not-allowed;
          background-color: #f3f4f6;
        }

        .day.unavailable:hover {
          background-color: #f3f4f6;
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
          border-top: 1px solid #d1d5db;
          background-color: white;
          border-bottom-left-radius: 1.5rem;
          border-bottom-right-radius: 1.5rem;
          position: sticky;
          bottom: 0;
          z-index: 10;
        }

        .btn-cancel {
          color: #e11d1d;
          font-weight: 600;
          font-size: 0.875rem;
          border: 1px solid #e11d1d;
          border-radius: 0.375rem;
          padding: 0.25rem 1.25rem;
          cursor: pointer;
          user-select: none;
          background: none;
        }

        .btn-proceed {
          background: linear-gradient(135deg, #0b2b31, #2b737e);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 0.375rem;
          padding: 0.25rem 1.25rem;
          cursor: pointer;
          user-select: none;
          border: none;
        }

        .btn-proceed:hover:not(:disabled) {
          background: linear-gradient(135deg, #2b737e, #0b2b31);
        }

        .btn-proceed:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .subject-select {
          margin-top: 1.5rem;
          width: 100%;
          position: relative;
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
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background-color: white;
          color: #4b5563;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b3b44' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          transition: all 0.2s ease;
        }

        .subject-dropdown:hover {
          border-color: #9ca3af;
        }

        .subject-dropdown:focus {
          outline: none;
          border-color: #0b3b44;
          box-shadow: 0 0 0 2px rgba(11, 59, 68, 0.1);
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .booking {
            width: 90%;
            max-width: 1100px;
            margin: 3rem auto 0;
            transform: none;
          }
        }

        @media (max-width: 1100px) {
          .booking {
            width: 90%;
            max-width: 1000px;
            transform: none;
          }
        }

        @media (max-width: 992px) {
          .booking {
            width: 90%;
            max-width: 900px;
            transform: none;
          }
        }

        @media (max-width: 768px) {
          .booking {
            width: 95%;
            max-width: 700px;
            transform: none;
            margin-top: 2rem;
          }
        }

        @media (max-width: 767px) {
          .booking {
            width: 100%;
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            transform: none;
          }

          .content {
            flex-direction: column;
            padding: 1rem;
            gap: 1.5rem;
          }

          .time-slots {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .time-slots {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}