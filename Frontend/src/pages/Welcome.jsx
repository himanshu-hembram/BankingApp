import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./Login";
import RegisterForm from "./Register";

export default function Welcome() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Callback for successful login
  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  // Callback for successful registration
  const handleRegisterSuccess = () => {
    setIsLogin(true); // switch back to login form
  };

  return (
    <div className="relative w-[800px] min-w-[800px] min-h-[480px] h-[480px] p-5 bg-gray-100 shadow-[8px_8px_8px_#d1d9e6,-8px_-8px_8px_#f9f9f9] rounded-xl overflow-hidden translate-y-8 mx-auto">
      
      {/* Login */}
      <div
        className={`absolute bottom-0 left-0 w-1/2 h-full flex justify-center items-center p-5 bg-gray-100 transition-all duration-500 ${
          isLogin ? "z-20" : "invisible opacity-0 absolute"
        }`}
      >
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>

      {/* Register */}
      <div
        className={`absolute top-0 left-[calc(100%-480px)] w-1/2 h-full flex justify-center items-center p-5 bg-gray-100 transition-all duration-500 ${
          !isLogin ? "z-20" : "invisible opacity-0 absolute"
        }`}
      >
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>

      {/* Switch Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-[320px] p-4 z-30 bg-gray-100 transition-all duration-500 overflow-hidden shadow-[3px_3px_8px_#d1d9e6,-3px_-3px_8px_#f9f9f9] ${
          isLogin ? "left-[calc(100%-320px)]" : "left-0"
        }`}
      >
        {/* Decorative Circles */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gray-100 shadow-[inset_6px_6px_10px_#d1d9e6,inset_-6px_-6px_10px_#f9f9f9] bottom-[-60%] left-[-60%] transition-all duration-500"></div>
        <div className="absolute w-[240px] h-[240px] rounded-full bg-gray-100 shadow-[inset_6px_6px_10px_#d1d9e6,inset_-6px_-6px_10px_#f9f9f9] top-[-30%] left-[60%] transition-all duration-500"></div>

        {/* Content */}
        <div className="absolute w-[320px] p-4 flex flex-col justify-center items-center transition-all duration-500">
          <h2 className="text-2xl font-bold leading-relaxed text-gray-800">
            {isLogin ? "Banking App" : "Welcome Back!"}
          </h2>
          <p className="text-sm text-center leading-tight mt-2">
            {isLogin
              ? "Enter your personal details and start your journey with us"
              : "To keep connected with us please login with your info"}
          </p>
          <button
            className="w-36 h-10 rounded-2xl mt-8 font-bold text-xs bg-blue-600 text-white shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#f9f9f9] border-none outline-none cursor-pointer hover:shadow-[5px_5px_8px_#d1d9e6,-5px_-5px_8px_#f9f9f9] hover:scale-98 active:shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#f9f9f9] active:scale-97 transition-all"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
