'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

      <style jsx>{`
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
          z-index: 1000;
        }

        .wrapper {
          position: relative;
          background: white;
          border-radius: 12px;
          width: 450px;
          padding: 0;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid #eaeaea;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 1000;
        }

        .upper-element {
          padding: 24px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f5f5f5;
          position: relative;
        }

        .upper-element h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin: 0 auto;
        }

        .lower-element {
          padding: 24px;
        }

        .lower-element p {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .datepicker-wrapper {
          margin: 24px 0;
          position: relative;
        }

        .datepicker-wrapper label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #555;
          font-weight: 500;
        }

        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }

        .button-container button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .cancel-button {
          background: transparent;
          color: #666;
        }

        .cancel-button:hover {
          background: #f7f7f7;
        }

        .confirm-button {
          background: #2c3e50;
          color: white;
          position: relative;
        }

        .confirm-button:disabled {
          background: #e0e0e0;
          cursor: not-allowed;
        }

        .confirm-button:not(:disabled):hover {
          background: #1a2634;
        }

        .loader {
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          border-top: 2px solid #fff;
          width: 16px;
          height: 16px;
          animation: spin 0.6s linear infinite;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Button states */
        .button-container button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          min-height: 40px;
        }

        .button-container button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .button-container button:active,
        .button-container button.active {
          transform: translateY(0);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .button-container button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-container button.loading {
          pointer-events: none;
        }

        /* Disabled form elements */
        input:disabled,
        textarea:disabled,
        select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #f5f5f5;
        }

        @media (max-width: 600px) {
          .wrapper {
            width: calc(100vw - 40px);
          }
        }

        @media (max-width: 400px) {
          .wrapper {
            width: calc(100vw - 30px);
          }
        }
      `}</style>

      {/* Global styles for react-datepicker to match Vue design */}
      <style jsx global>{`
        .dp__input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .dp__input:hover {
          border-color: #ccc;
        }

        .dp__input:focus {
          border-color: #2c3e50;
          outline: none;
          box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
        }

        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker__input-container {
          width: 100%;
        }

        .react-datepicker-popper {
          z-index: 1001 !important;
        }

        /* React DatePicker custom styling */
        .react-datepicker {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          border: 1px solid #eaeaea;
          border-radius: 6px;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
        }

        .react-datepicker__header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #eaeaea;
        }

        .react-datepicker__current-month {
          color: #333;
          font-weight: 600;
        }

        .react-datepicker__day--selected {
          background-color: #2c3e50;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: rgba(44, 62, 80, 0.1);
        }

        .react-datepicker__time-container {
          border-left: 1px solid #eaeaea;
        }

        .react-datepicker__time-box {
          width: 100%;
        }

        @media (max-width: 600px) {
          .react-datepicker {
            width: calc(100vw - 60px) !important;
            left: 20px !important;
            right: 20px !important;
          }
        }

        @media (max-width: 400px) {
          .react-datepicker {
            width: calc(100vw - 50px) !important;
            left: 15px !important;
            right: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}