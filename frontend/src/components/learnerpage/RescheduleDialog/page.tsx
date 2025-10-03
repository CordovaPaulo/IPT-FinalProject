'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './reschedule.module.css';

interface RescheduleDialogProps {
  id: number;
  onClose: () => void;
  onReschedule: (date: Date) => void;
}

export default function RescheduleDialog({ id, onClose, onReschedule }: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rescheduleSession = async () => {
    try {
      if (!selectedDate) {
        return;
      }

      // Extract date and time (same format as Vue version)
      const formattedDate = selectedDate.toLocaleDateString("en-US"); // MM/DD/YYYY
      const formattedTime = selectedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); // HH:mm

      setIsSubmitting(true);

      // API call (same endpoint as Vue version)
      const response = await fetch(`/api/resched/${id}`, {
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
        // Show success message (you can replace with toast)
        console.log("Session rescheduled successfully!");
        
        onReschedule(selectedDate);
        onClose();
      } else {
        throw new Error('Failed to reschedule session');
      }
    } catch (error) {
      console.error("Failed to reschedule session");
      // Show error message (you can replace with toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="wrapper">
        <div className="upper-element">
          <h1>Reschedule Session</h1>
        </div>

        <div className="lower-element">
          <p>Are you sure you want to reschedule this session?</p>

          <div className="datepicker-wrapper">
            <label htmlFor="reschedule-datetime">Pick new date & time:</label>
            <DatePicker
              id="reschedule-datetime"
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              minDate={new Date()}
              className="dp__input"
              placeholderText="Select date and time"
            />
          </div>

          <div className="button-container">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button 
              onClick={rescheduleSession} 
              className="confirm-button"
              disabled={isSubmitting || !selectedDate}
            >
              {isSubmitting ? (
                <span className="loader"></span>
              ) : (
                <span>Reschedule</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}