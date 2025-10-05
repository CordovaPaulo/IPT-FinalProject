'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import styles from './resetpass.module.css';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (!urlToken || !urlEmail) {
      setError('Invalid reset link');
      return;
    }

    setToken(urlToken);
    setEmail(urlEmail);
  }, [searchParams]);

  const csrf = async (): Promise<boolean> => {
    try {
      await api.get('/sanctum/csrf-cookie', {});
      return true;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      return false;
    }
  };

  const resetUserPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const csrfSuccess = await csrf();
      if (!csrfSuccess) {
        setError('Failed to get security token');
        setLoading(false);
        return;
      }

      const newPass = {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      const response = await api.patch('/api/reset-password', newPass, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      console.error('Password reset failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`reset-password-global ${styles.resetPasswordContainer}`}>
      <header className={styles.brandHeader}>
        <img
          src="/logo_gccoed.png"
          alt="GCCoed Logo"
          className={styles.logoImg}
        />
        <span className={styles.brandName}>MindMates</span>
      </header>
      
      <div className={styles.formWrapper}>
        <h2 className={styles.heading}>Reset Password</h2>

        {!error && (
          <form onSubmit={resetUserPass}>
            <div className={styles.formGroup}>
              <div className={styles.inputWithIcon}>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  minLength={8}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputWithIcon}>
                <input
                  type="password"
                  id="password_confirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </div>
    </div>
  );
}