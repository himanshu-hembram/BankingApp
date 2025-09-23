import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    adminname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError(""); // clear previous errors
    console.log("Register form submitted:", formData);
    // TODO: Make API call here
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
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-white/10 placeholder-white/70 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                required
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
              >
                Register
              </button>
            </form>

            <p className="mt-4 text-white/70">
              Already have an account?{" "}
              <span
                className="text-sky-300 cursor-pointer hover:underline"
                onClick={() => (window.location.href = "/login")}
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
