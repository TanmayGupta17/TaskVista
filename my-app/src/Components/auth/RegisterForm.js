"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/components/auth.module.css";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      // Make API call to register endpoint
      const response = await fetch(
        `${
          process.env.BACKEND_URL || "http://localhost:8000"
        }/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        const { token, user } = data;

        // Store token in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }

        // Optional: Store user info in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Registration failed
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.title}>Create Your Account</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            minLength={3}
            maxLength={30}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            minLength={6}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <a href="/auth/login" className={styles.link}>
            Login here
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
