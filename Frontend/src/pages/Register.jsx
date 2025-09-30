import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    adminname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        userName: formData.adminname,
        password: formData.password,
        userEmail: formData.email,
      };

      const res = await axios.post(`${API_BASE}/admin/register`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201 || res.status === 200) {
        setSuccess("Registration successful!");
        setTimeout(() => {
          if (onSuccess) onSuccess(); // 🔥 parent switches to login
        }, 800);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const detail =
          err.response.data?.detail || err.response.data || err.message;
        if (status === 409) setError(detail || "Username or email already exists");
        else if (status === 422) setError("Validation error — check your input");
        else setError(detail || "Server error. Try again later.");
      } else if (err.request) {
        setError("No response from server — is the backend running?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col justify-center items-center w-full"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold leading-relaxed text-gray-800">
        Create Account
      </h2>
      <span className="mt-2 mb-4 text-sm text-gray-500">
        or use your email for registration
      </span>

      <input
        type="text"
        name="adminname"
        placeholder="Name"
        value={formData.adminname}
        onChange={handleChange}
        className="w-2/3 h-10 my-1 pl-5 text-sm border-none outline-none bg-gray-100 rounded-lg shadow-inner"
        required
        minLength={3}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-2/3 h-10 my-1 pl-5 text-sm border-none outline-none bg-gray-100 rounded-lg shadow-inner"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-2/3 h-10 my-1 pl-5 text-sm border-none outline-none bg-gray-100 rounded-lg shadow-inner"
        required
        minLength={8}
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="w-2/3 h-10 my-1 pl-5 text-sm border-none outline-none bg-gray-100 rounded-lg shadow-inner"
        required
        minLength={8}
      />

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      {success && <p className="text-green-500 text-xs mt-2">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-36 h-10 rounded-2xl mt-6 font-bold text-sm text-white ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:scale-105"
        } transition-transform`}
      >
        {loading ? "Registering..." : "SIGN UP"}
      </button>
    </form>
  );
}
