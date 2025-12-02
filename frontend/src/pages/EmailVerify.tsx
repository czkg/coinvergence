import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EmailVerify: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] =
    useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_DOMAIN}/api/auth/verify-email?token=${token}`,
          {
            method: "GET",
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setUserEmail(data.user.email);
          setMessage("Your email has been verified successfully!");

          // Log in
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("userUpdated"));

          // Jump after 3 seconds
          setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email.");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Server error. Please try again later.");
      }
    }

    verify();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        {/* Logo */}
        <img
          src="/icons/logo.png"
          alt="Coinvergence Logo"
          className="h-16 mx-auto mb-4 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Loading State */}
        {status === "loading" && (
          <>
            <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we confirm your account.</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            </div>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <h2 className="text-xl font-bold text-green-600 mb-2">Email Verified</h2>
            <p className="text-gray-700 mb-2">{message}</p>
            <p className="text-gray-700 mb-6">
              Welcome, <strong>{userEmail}</strong> 🎉  
            </p>
            <p className="text-gray-500 text-sm">Redirecting you to the homepage...</p>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <h2 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-700 mb-4">{message}</p>

            <button
              onClick={() => navigate("/resend-verification")}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Resend Verification Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerify;
