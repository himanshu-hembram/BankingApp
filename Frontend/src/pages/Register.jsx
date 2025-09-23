import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

const Register = () => {
  const navigate = useNavigate();

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

    // Client-side password confirmation check
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
        setSuccess("Registration successful — redirecting to login...");
        // small delay so user can see success message
        setTimeout(() => navigate("/login"), 900);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      // axios error handling
      if (err.response) {
        // Server returned a response (4xx, 5xx)
        const status = err.response.status;
        const detail = err.response.data?.detail || err.response.data || err.message;
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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Admin Registration</h1>

            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="adminname"
                placeholder="Username"
                value={formData.adminname}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-white/10 placeholder-white/70 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                required
                minLength={3}
              />

              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-white/10 placeholder-white/70 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-white/10 placeholder-white/70 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                required
                minLength={8}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-white/10 placeholder-white/70 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                required
                minLength={8}
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-300 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 text-white rounded-xl shadow-lg transition-transform ${
                  loading ? "bg-slate-500/60" : "bg-gradient-to-r from-sky-400 to-indigo-500 hover:scale-[1.02]"
                }`}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="mt-4 text-white/70">
              Already have an account?{" "}
              <span
                className="text-sky-300 cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
