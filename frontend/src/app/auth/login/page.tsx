"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import api, { setAuthToken } from "@/lib/axios";
import "./login.css";

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
        if (index === focusableElements.length - 2) { // Login button
          if (!isLoading) {
            const formEvent = new Event('submit', { cancelable: true, bubbles: true });
            e.currentTarget.dispatchEvent(formEvent);
          }
        } else if (index === focusableElements.length - 1) { // Forgot password link
          forgotPasswordRef.current?.click();
        }
        break;
      
      case ' ':
        e.preventDefault();
        if (index === focusableElements.length - 2) { // Login button
          if (!isLoading) {
            const formEvent = new Event('submit', { cancelable: true, bubbles: true });
            e.currentTarget.dispatchEvent(formEvent);
          }
        } else if (index === focusableElements.length - 1) { // Forgot password link
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
        // Reset focus to first element
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

      // ensure leading slash so baseURL + path is correct
      const response = await api.post("/api/auth/login", loginData);
      const { token, userRole, user } = response.data;

      // store token for future requests (axios interceptor reads localStorage token)
      if (token) {
        setAuthToken(token);
      }

      // Check if user has a role, if not redirect to signup
      const role = userRole || user?.role;

      if (!role || role === "user" || role === "") {
        // User exists but has no specific role - redirect to signup
        console.log("User has no role, redirecting to signup");
        router.push("/auth/signup");
        return;
      }

      // Navigate based on user role
      switch (role) {
        case "learner":
          router.push("/learner");
          break;
        case "mentor":
          router.push("/mentor");
          break;
        case "admin":
          router.push("/admin");
          break;
        default:
          // Unknown role - redirect to signup
          router.push("/signup");
      }

      console.log("Login successful:", { role, user: user?.username });
    } catch (error) {
      // Log the error (no navigation)
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-focus first input on component mount
  useEffect(() => {
    iniCredRef.current?.focus();
  }, []);

  return (
    <div className="login-container">
      <Navbar />

      <main>
        <div className="main-image">
          <Image
            src="/logo_gccoed.png"
            alt="MindMates Logo"
            width={400}
            height={300}
            priority
          />
        </div>

        <div className="main-content">
          <h1>Login</h1>
          <form onSubmit={login}>
            <div className="input-field">
              <label htmlFor="iniCred">DOMAIN LOGIN</label>
              <div className="input-with-icon">
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
                <i className="fas fa-user input-icon"></i>
              </div>
              <span id="iniCred-description" className="sr-only">
                Enter your email, username, or Student ID
              </span>
            </div>

            <div className="input-field">
              <label htmlFor="password">PASSWORD</label>
              <div className="input-with-icon">
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
                  className={`fas ${
                    passwordVisible ? "fa-eye" : "fa-eye-slash"
                  } input-icon password-toggle`}
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
              <span id="password-description" className="sr-only">
                Enter your password. Use Tab to navigate to next field.
              </span>
              <p className="switch-link">
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
              className={`${isLoading ? "loading" : ""} ${
                isButtonActive ? "active" : ""
              }`}
              onMouseDown={() => setButtonActive(true)}
              onMouseUp={() => setButtonActive(false)}
              onMouseLeave={() => setButtonActive(false)}
              onKeyDown={(e) => handleKeyDown(e, 2)}
              onFocus={() => handleElementFocus(2)}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading && <span className="loading-spinner"></span>}
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}