'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import styles from './Schedule.module.css';

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface ScheduleProps {
  info: any;
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

    // Guard: ensure mentorId is present before calling backend
    if (!mentorId) {
      console.error("Missing mentorId - cannot create schedule", { mentorId, info });
      alert("Unable to schedule: mentor information is incomplete. Please try again.");
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

      // Debugging logs: outgoing data
      console.log("Scheduling data (outgoing):", { mentorId, scheduleData });

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
        console.error("Unexpected response creating schedule:", response.status, response.data);
        throw new Error('Failed to create schedule');
      }

      const result = response.data;
      onConfirm(result);
      onClose();
    } catch (error: any) {
      // Improved error logging for Axios errors
      if (error?.isAxiosError) {
        console.error("Axios error scheduling:", {
          message: error.message,
          status: error?.response?.status,
          responseData: error?.response?.data,
          headers: error?.response?.headers,
        });
        alert(`Failed to create schedule: ${error?.response?.data?.message || error.message}`);
      } else {
        console.error("Error scheduling:", error);
        alert("Failed to create schedule. Please try again.");
      }
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
    <div className={styles.booking}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Book a Session</h1>
        </div>
        <button onClick={onClose} aria-label="Close" type="button">×</button>
      </div>

      {/* Profile info */}
      <div className={styles.profile}>
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
      <div className={styles.content}>
        {/* Left side */}
        <div className={styles.left}>
          <div className={styles.timeHeader}>
            <h2>Select Time Slots</h2>
            <p>({mentorSessionDur || 'Duration not specified'})</p>
          </div>
          <div className={styles.timeSlots}>
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`${styles.timeBtn} ${selectedTime === time ? styles.timeSelected : ''}`}
              >
                {time}
              </button>
            ))}
          </div>

          <h3 className={styles.modeHeader}>Select Mode of Session</h3>
          <div className={styles.modeButtons}>
            <button
              type="button"
              onClick={() => setSessionType('in-person')}
              className={`${styles.modeBtn} ${sessionType === 'in-person' ? styles.modeActive : ''}`}
              disabled={!mentorModality?.toLowerCase().includes('in-person') && !mentorModality?.toLowerCase().includes('both')}
            >
              <span aria-label="In Person"><i className="fas fa-user"></i></span>
              <span>In Person</span>
            </button>
            <button
              type="button"
              onClick={() => setSessionType('online')}
              className={`${styles.modeBtn} ${sessionType === 'online' ? styles.modeActive : ''}`}
              disabled={!mentorModality?.toLowerCase().includes('online') && !mentorModality?.toLowerCase().includes('both')}
            >
              <span aria-label="Online"><i className="fas fa-laptop"></i></span>
              <span>Online</span>
            </button>
          </div>

          {sessionType === 'in-person' && (
            <div className={styles.locationInput}>
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="Enter meeting location"
                className={styles.locationField}
              />
            </div>
          )}
        </div>

        {/* Right side - Calendar */}
        <div className={styles.right}>
          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              <button className={styles.arrow} onClick={prevMonth}>&lt;</button>
              <div className={styles.monthContainer}>
                <button
                  className={styles.month}
                  onClick={() => setShowYearSelection(!showYearSelection)}
                >
                  {currentMonthYear}
                </button>
                <button className={styles.todayBtn} onClick={goToToday}>Today</button>
              </div>
              <button className={styles.arrow} onClick={nextMonth}>&gt;</button>
            </div>

            {/* Year selection dropdown */}
            {showYearSelection && (
              <div className={styles.yearSelect}>
                {years.map((year) => (
                  <div
                    key={year}
                    onClick={() => selectYear(year)}
                    className={`${styles.yearOption} ${currentDate.getFullYear() === year ? styles.yearActive : ''}`}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}

            {/* Available days legend */}
            <div className={styles.calendarLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotAvailable}`}></span>
                <span>Available</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotUnavailable}`}></span>
                <span>Unavailable</span>
              </div>
            </div>

            <div className={styles.weekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className={styles.days}>
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day.isAvailable && !day.isPast ? selectDate(day) : null}
                  className={`
                    ${styles.day}
                    ${day.isToday ? styles.today : ''}
                    ${day.isSelected ? styles.selected : ''}
                    ${day.isCurrentMonth ? styles.current : styles.other}
                    ${day.isAvailable && !day.isPast ? styles.available : styles.unavailable}
                    ${day.isPast ? styles.pastDate : ''}
                  `}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.subjectSelect}>
            <h3 className={styles.subjectHeader}>Select Subject</h3>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)} 
              className={styles.subjectDropdown} 
              required
            >
              <option value="" disabled>Choose a subject</option>
              {subjectOptions().map((subject: string, index: number) => (
                <option key={`${subject}-${index}`} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className={styles.footer}>
        <button onClick={onClose} type="button" className={styles.btnCancel}>
          CANCEL
        </button>
        <button 
          onClick={confirmSchedule} 
          type="button" 
          className={styles.btnProceed}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'PROCESSING...' : 'PROCEED'}
        </button>
      </div>
    </div>
  );
}