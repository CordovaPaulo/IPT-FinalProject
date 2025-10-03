// src/components/mentorpage/viewUser/offer.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './offer.module.css';

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
    <div className={styles.offerBooking}>
      {/* Header */}
      <div className={styles.offerHeader}>
        <div className="flex items-center space-x-3">
          <h1>Send Offer</h1>
        </div>
        <button onClick={onClose} aria-label="Close" type="button">×</button>
      </div>

      {/* Profile info */}
      <div className={styles.offerProfile}>
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
      <div className={styles.offerContent}>
        {/* Left side */}
        <div className={styles.offerLeft}>
          <div className={styles.offerTimeHeader}>
            <h2>Select Time Slots</h2>
            <p>({learnerDur} duration)</p>
          </div>
          <div className={styles.offerTimeSlots}>
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`${styles.offerTimeBtn} ${selectedTime === time ? styles.offerTimeSelected : ''}`}
              >
                {time}
              </button>
            ))}
          </div>

          <h3 className={styles.offerModeHeader}>Select Mode of Session</h3>
          <div className={styles.offerModeButtons}>
            <button
              type="button"
              onClick={() => setSessionType('in-person')}
              className={`${styles.offerModeBtn} ${sessionType === 'in-person' ? styles.offerModeActive : ''}`}
              disabled={!isInPersonModality}
            >
              <span aria-label="In Person"><i className="fas fa-user"></i></span>
              <span>In Person</span>
            </button>
            <button
              type="button"
              onClick={() => setSessionType('online')}
              className={`${styles.offerModeBtn} ${sessionType === 'online' ? styles.offerModeActive : ''}`}
              disabled={!isOnlineModality}
            >
              <span aria-label="Online"><i className="fas fa-laptop"></i></span>
              <span>Online</span>
            </button>
          </div>

          {/* Location input */}
          {sessionType === 'in-person' && (
            <div className={styles.offerLocationInput}>
              <input
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                type="text"
                placeholder="Enter meeting location"
                className={styles.offerLocationField}
                required
              />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className={styles.offerRight}>
          <div className={styles.offerCalendar}>
            <div className={styles.offerCalendarHeader}>
              <button className={styles.offerArrow} onClick={prevMonth}>&lt;</button>
              <div className={styles.offerMonthContainer}>
                <button
                  className={styles.offerMonth}
                  onClick={() => setShowYearSelection(!showYearSelection)}
                >
                  {currentMonthYear}
                </button>
                <button className={styles.offerTodayBtn} onClick={goToToday}>Today</button>
              </div>
              <button className={styles.offerArrow} onClick={nextMonth}>&gt;</button>
            </div>

            {/* Year selection dropdown */}
            {showYearSelection && (
              <div className={styles.offerYearSelect}>
                {years.map((year) => (
                  <div
                    key={year}
                    onClick={() => selectYear(year)}
                    className={`${styles.offerYearOption} ${currentDate.getFullYear() === year ? styles.offerYearActive : ''}`}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}

            {/* Available days legend */}
            <div className={styles.offerCalendarLegend}>
              <div className={styles.offerLegendItem}>
                <span className={`${styles.offerLegendDot} ${styles.offerLegendDotAvailable}`}></span>
                <span>Available</span>
              </div>
              <div className={styles.offerLegendItem}>
                <span className={`${styles.offerLegendDot} ${styles.offerLegendDotUnavailable}`}></span>
                <span>Unavailable</span>
              </div>
            </div>

            <div className={styles.offerWeekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className={styles.offerDays}>
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day.isAvailable ? selectDate(day) : null}
                  className={[
                    styles.offerDay,
                    day.isToday ? styles.offerDayToday : '',
                    day.isSelected ? styles.offerDaySelected : '',
                    day.isCurrentMonth ? styles.offerDayCurrent : styles.offerDayOther,
                    day.isAvailable ? styles.offerDayAvailable : styles.offerDayUnavailable,
                  ].join(' ')}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          </div>

          {/* Subject selection */}
          <div className={styles.offerSubjectSelect}>
            <h3 className={styles.offerSubjectHeader}>Select Subject</h3>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={styles.offerSubjectDropdown} 
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
      <div className={styles.offerFooter}>
        <button onClick={onClose} type="button" className={styles.offerBtnCancel}>
          CANCEL
        </button>
        <button 
          onClick={confirmSchedule} 
          type="button" 
          className={styles.offerBtnProceed}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'SENDING...' : 'PROCEED'}
        </button>
      </div>
    </div>
  );
}