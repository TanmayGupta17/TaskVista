"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/components/auth.module.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Make API call to register endpoint
      const response = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:8000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
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
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2 className={styles.title}>Login to Collaborative Board</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

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
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.switchText}>
          {"Don't have an account?"}{" "}
          <a href="/auth/register" className={styles.link}>
            Register here
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
