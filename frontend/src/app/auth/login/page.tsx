"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import api, { setAuthToken } from "@/lib/axios";
import styles from "./login.module.css";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
  const [iniCred, setIniCred] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const iniCredRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const forgotPasswordRef = useRef<HTMLAnchorElement>(null);

  const focusableElements = [
    { ref: iniCredRef, type: 'input' },
    { ref: passwordRef, type: 'input' },
    { ref: loginButtonRef, type: 'button' },
    { ref: forgotPasswordRef, type: 'link' }
  ];

  const setButtonActive = (active: boolean) => {
    if (!isLoading) {
      setIsButtonActive(active);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const focusNextElement = () => {
    const nextIndex = (focusedIndex + 1) % focusableElements.length;
    setFocusedIndex(nextIndex);
    focusableElements[nextIndex].ref.current?.focus();
  };

  const focusPreviousElement = () => {
    const prevIndex = focusedIndex === 0 ? focusableElements.length - 1 : focusedIndex - 1;
    setFocusedIndex(prevIndex);
    focusableElements[prevIndex].ref.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          focusPreviousElement();
        } else {
          focusNextElement();
        }
        break;

      case 'Enter':
        if (index === focusableElements.length - 2) {
          if (!isLoading) {
            const formEvent = new Event('submit', { cancelable: true, bubbles: true });
            e.currentTarget.dispatchEvent(formEvent);
          }
        } else if (index === focusableElements.length - 1) {
          forgotPasswordRef.current?.click();
        }
        break;

      case ' ':
        e.preventDefault();
        if (index === focusableElements.length - 2) {
          if (!isLoading) {
            const formEvent = new Event('submit', { cancelable: true, bubbles: true });
            e.currentTarget.dispatchEvent(formEvent);
          }
        } else if (index === focusableElements.length - 1) {
          forgotPasswordRef.current?.click();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        focusNextElement();
        break;

      case 'ArrowUp':
        e.preventDefault();
        focusPreviousElement();
        break;

      case 'Escape':
        setFocusedIndex(0);
        iniCredRef.current?.focus();
        break;
    }
  };

  const handleElementFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    try {
      const loginData = {
        iniCred: iniCred,
        password: password,
      };

      const response = await api.post("/api/auth/login", loginData);
      const { token, userRole, user } = response.data;

      if (token) {
        setAuthToken(token);
      }

      if (response.status !== 200) {
        toast.error("Login failed. Please check your credentials.");
        return;
      }

      const role = userRole || user?.role;

      if (!role || role === "user" || role === "") {
        router.replace("/auth/signup");
        return;
      }

      switch (role) {
        case "learner":
          router.replace("/learner");
          break;
        case "mentor":
          router.replace("/mentor");
          break;
        case "admin":
          router.replace("/admin");
          break;
        default:
          router.replace("/signup");
      }
    } catch (error) {
      toast.error("An error occurred during login. Please try again.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    iniCredRef.current?.focus();
  }, []);

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.mainImage}>
          <Image
            src="/logo_gccoed.png"
            alt="MindMates Logo"
            width={400}
            height={300}
            priority
          />
        </div>

        <div className={styles.mainContent}>
          <h1>Login</h1>
          <form onSubmit={login} className={styles.form}>
            <div className={styles.inputField}>
              <label htmlFor="iniCred">DOMAIN LOGIN</label>
              <div className={styles.inputWithIcon}>
                <input
                  ref={iniCredRef}
                  id="iniCred"
                  type="text"
                  value={iniCred}
                  onChange={(e) => setIniCred(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  onFocus={() => handleElementFocus(0)}
                  placeholder="Enter your email, username, or Student ID"
                  disabled={isLoading}
                  required
                  aria-describedby="iniCred-description"
                />
                <i className={`fas fa-user ${styles.inputIcon}`}></i>
              </div>
              <span id="iniCred-description" className={styles.srOnly}>
                Enter your email, username, or Student ID
              </span>
            </div>

            <div className={styles.inputField}>
              <label htmlFor="password">PASSWORD</label>
              <div className={styles.inputWithIcon}>
                <input
                  ref={passwordRef}
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                  onFocus={() => handleElementFocus(1)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                  aria-describedby="password-description"
                />
                <i
                  className={`${styles.inputIcon} ${styles.passwordToggle} fas ${
                    passwordVisible ? "fa-eye" : "fa-eye-slash"
                  }`}
                  onClick={togglePasswordVisibility}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      togglePasswordVisibility();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  aria-controls="password"
                ></i>
              </div>
              <span id="password-description" className={styles.srOnly}>
                Enter your password. Use Tab to navigate to next field.
              </span>
              <p className={styles.switchLink}>
                <a
                  href="/auth/forgot-password"
                  ref={forgotPasswordRef}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                  onFocus={() => handleElementFocus(3)}
                >
                  Forgot Password?
                </a>
              </p>
            </div>

            <button
              ref={loginButtonRef}
              type="submit"
              className={`${styles.button} ${isLoading ? styles.loading : ""} ${
                isButtonActive ? styles.active : ""
              }`}
              onMouseDown={() => setButtonActive(true)}
              onMouseUp={() => setButtonActive(false)}
              onMouseLeave={() => setButtonActive(false)}
              onKeyDown={(e) => handleKeyDown(e, 2)}
              onFocus={() => handleElementFocus(2)}
              disabled={isLoading}
              aria-busy={isLoading ? "true" : "false"}
            >
              {isLoading && <span className={styles.loadingSpinner}></span>}
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}