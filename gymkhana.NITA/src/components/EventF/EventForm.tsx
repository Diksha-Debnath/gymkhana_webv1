'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventForm.module.css';

// Text for typewriter
const titleText = "Champion Your Distinguished Event";
const subtext = "*Please provide accurate details for Event";

// Simple hook for typing (no cursor blinking)
function useSimpleTypewriter(text: string, speed: number = 80) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index++;
      if (index === text.length) clearInterval(typingInterval);
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return { displayText };
}

const EventForm: React.FC = () => {
  const router = useRouter();
  const { displayText } = useSimpleTypewriter(titleText);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, [router]);

  const [formData, setFormData] = useState({
    hostingAuthority: '',
    venue: '',
    startTime: '',
    endTime: '',
    description: '',
    registrationForm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create events.');
        setLoading(false);
        return;
      }
      const response = await fetch('https://gymkhana-web.onrender.com/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccess(true);
        setFormData({
          hostingAuthority: '',
          venue: '',
          startTime: '',
          endTime: '',
          description: '',
          registrationForm: '',
        });
      } else if (response.status === 401) {
        setError('Unauthorized. Please login again.');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create event.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="flex items-center justify-center mx-auto">
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Animated Title (no cursor) */}
          <h2 className={styles.formTitle}>{displayText}</h2>

          <div className={styles.formSubtext}>{subtext}</div>

          {/* Form Fields */}
          <label className={styles.label}>
            Hosting Authority:
            <input
              type="text"
              name="hostingAuthority"
              value={formData.hostingAuthority}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="BTC NITA"
            />
          </label>

          <label className={styles.label}>
            Venue:
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Main Auditorium"
            />
          </label>

          <div className={styles.rowGroup}>
            <label className={styles.label} style={{ flex: 1 }}>
              Start Time:
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </label>

            <label className={styles.label} style={{ flex: 1 }}>
              End Time:
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </label>
          </div>

          <label className={styles.label}>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Briefly describe the event..."
              maxLength={250}
            />
          </label>

          <label className={styles.label}>
            Registration Form (Optional):
            <input
              type="url"
              name="registrationForm"
              value={formData.registrationForm}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://example.com/registration"
            />
          </label>

          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
          {success && <div className={`${styles.message} ${styles.success}`}>Event Hosted Successfully!</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.disabled : ''}`}
          >
            {loading ? 'Submitting...' : 'Host Event'}
          </button>

          {/* Logout Button inside the form card, at bottom */}
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
