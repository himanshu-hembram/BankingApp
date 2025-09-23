import React from "react";

export const Welcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to the Application!
        </h1>

        <ul className="space-y-4">
          <li>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200">
              Register
            </button>
          </li>
          <li>
            <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-200">
              Login
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};