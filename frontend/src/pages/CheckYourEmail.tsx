import React from "react";
import { useNavigate } from "react-router-dom";

const CheckYourEmail: React.FC = () => {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        
        <img
          src="/icons/logo.png"
          alt="Coinvergence Logo"
          className="h-16 mx-auto mb-4 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
        <p className="text-gray-700 mb-4">
          We've sent a verification link to:
        </p>

        <p className="text-red-600 font-semibold mb-6">
          {email}
        </p>

        <p className="text-gray-600 mb-8">
          Please click the link in your inbox to verify your account.
        </p>

        <button
          onClick={() => navigate("/resend-verification?email=" + email)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
        >
          Resend Verification Email
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-4 border border-gray-400 px-4 py-2 rounded-md w-full"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CheckYourEmail;
