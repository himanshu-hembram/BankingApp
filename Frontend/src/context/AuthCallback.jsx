import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    // const userString = searchParams.get("user");
    // const user = userString ? JSON.parse(decodeURIComponent(userString)) : null;
    const user = searchParams.get("user");

    if (token) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_info", user);
      navigate("/dashboard", { replace: true });
    } else {
      console.error("No token found in URL");
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center h-full">
      <p>Processing authentication...</p>
    </div>
  );
}
