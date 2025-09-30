import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth.js";

const API_BASE = "http://localhost:8000";

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/admin/login`, { identifier, password });
      const token = res.data?.access_token;

      if (token) {
        const userInfo = {
          userId: res.data.userId,
          userName: res.data.userName,
          userEmailid: res.data.userEmailid,
        };
        // Update AuthContext (this will call setAuthToken and persist user info)
        login(token, userInfo);

        if (onSuccess) onSuccess(); // call the callback to navigate
      } else {
        setError("No token returned from server");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || "Authentication failed");
      } else if (err.request) {
        setError("No response from server — is backend running?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col justify-center items-center w-full h-full"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold leading-relaxed text-gray-800">Sign In</h2>
      <span className="mt-6 mb-3 text-sm">or use your email account</span>

      <input
        type="text"
        placeholder="Username or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-2/3 h-10 my-1 pl-5 text-xs border-none outline-none bg-gray-100 rounded-lg shadow-[inset_2px_2px_3px_#d1d9e6,inset_-2px_-2px_3px_#f9f9f9] focus:shadow-[inset_3px_3px_3px_#d1d9e6,inset_-3px_-3px_3px_#f9f9f9]"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-2/3 h-10 my-1 pl-5 text-xs border-none outline-none bg-gray-100 rounded-lg shadow-[inset_2px_2px_3px_#d1d9e6,inset_-2px_-2px_3px_#f9f9f9] focus:shadow-[inset_3px_3px_3px_#d1d9e6,inset_-3px_-3px_3px_#f9f9f9]"
        required
      />

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-36 h-10 rounded-2xl mt-6 font-bold text-xs text-white shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#f9f9f9] ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:scale-105"
        } transition-transform`}
      >
        {loading ? "Signing in..." : "SIGN IN"}
      </button>
    </form>
  );
}

