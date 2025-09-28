"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import "./login.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);

  const setButtonActive = (active: boolean) => {
    if (!isLoading) {
      setIsButtonActive(active);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    try {
      const loginData = {
        login: email,
        password: password,
      };

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userRole = "learner";

      switch (userRole) {
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
          router.push("/signup");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <label>DOMAIN EMAIL</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
                <i className="fas fa-user input-icon"></i>
              </div>
            </div>

            <div className="input-field">
              <label>PASSWORD</label>
              <div className="input-with-icon">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <i
                  className={`fas ${
                    passwordVisible ? "fa-eye" : "fa-eye-slash"
                  } input-icon password-toggle`}
                  onClick={togglePasswordVisibility}
                ></i>
              </div>
              <p className="switch-link">
                <a href="/auth/forgot-password">Forgot Password?</a>
              </p>
            </div>

            <button
              type="submit"
              className={`${isLoading ? "loading" : ""} ${
                isButtonActive ? "active" : ""
              }`}
              onMouseDown={() => setButtonActive(true)}
              onMouseUp={() => setButtonActive(false)}
              onMouseLeave={() => setButtonActive(false)}
            >
              {isLoading && <span className="loading-spinner"></span>}
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
