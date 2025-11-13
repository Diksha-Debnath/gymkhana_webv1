import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);


  const router = useRouter();


  useEffect(() => {
    const text = "Welcome to NIT Agartala Gymkhana Portal";
    let index = 0;
    const typeSpeed = 80;


    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, typeSpeed);


    const cursorInterval = setInterval(() => {
      setShowCursor(s => !s);
    }, 500);


    return () => {
      clearInterval(typeInterval);
      clearInterval(cursorInterval);
    };
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);


    try {
      const response = await fetch("https://gymkhana-web.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });


      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        router.push("/add-event");
      } else if (response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Unexpected error. Please try again later.");
      }
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.pageWrapper}>
      <div className={styles.cardWrapper}>
        <h1 className={styles.typedTitle}>
          {typedText}
          <span className={`${styles.cursor} ${showCursor ? styles.cursorVisible : ''}`}>|</span>
        </h1>


        <p className={styles.subText}>Please login with your credentials</p>


        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            className={styles.input}
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />


          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />


          {error && <div className={styles.error}>{error}</div>}


          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>


        <footer className={styles.footer}>
          © 2025 NIT Agartala Gymkhana. All rights reserved.
        </footer>
      </div>
    </div>
  );
};


export default LoginPage;