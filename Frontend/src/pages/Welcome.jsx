import React from "react";

export const Welcome = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/6">
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-16 rounded-xl relative flex items-center justify-center shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-animated-gradient opacity-95"></div>
              <div className="relative z-10 text-white font-bold text-lg">Banking App</div>
            </div>

            <h1 className="mt-6 text-4xl font-bold text-white">Welcome to the Application!</h1>

            <div className="mt-6 w-full">
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={() => (window.location.href = "/register")}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    Register
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => (window.location.href = "/login")}
                    className="w-full py-3 px-4 bg-white/6 text-sky-100 border border-white/10 rounded-xl hover:bg-white/8 transition"
                  >
                    Login
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;