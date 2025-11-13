import React, { useState } from "react";
import axios from "axios";
import "./index.css"; // Optional: for styling

function AuthPage({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // Login request → URL-encoded for OAuth2PasswordRequestForm
      try {
        const data = new URLSearchParams();
        data.append("username", formData.username);
        data.append("password", formData.password);

        const res = await axios.post("http://localhost:8000/login", data, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        console.log("Logged in:", res.data);
        localStorage.setItem("token", res.data.access_token);
        setToken(res.data.access_token);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Login failed");
      }
    } else {
      // Register request → JSON for Pydantic model
      try {
        const res = await axios.post("http://localhost:8000/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        console.log("Registered:", res.data);
        alert("Account created! Please login.");
        setIsLogin(true);
        setFormData({ username: "", email: "", password: "" });
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Registration failed");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="toggle-text">
          {isLogin ? (
            <>
              <p>Don’t have an account?</p>
              <button className="link-btn" onClick={() => setIsLogin(false)}>
                Create one
              </button>
            </>
          ) : (
            <>
              <p>Already have an account?</p>
              <button className="link-btn" onClick={() => setIsLogin(true)}>
                Login here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
