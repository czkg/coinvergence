import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const initialEmail = params.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Verification email sent! Check your inbox.");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to resend verification email.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        
        <img
          src="/icons/logo.png"
          alt="Coinvergence Logo"
          className="h-16 mx-auto mb-4 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <h2 className="text-2xl font-bold mb-4">Resend Verification Email</h2>

        <form onSubmit={handleResend}>
          <input
            type="email"
            className="w-full border border-gray-300 p-2 rounded-md mb-4"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send Verification Email"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-600 mt-4">{message}</p>
        )}

        {status === "error" && (
          <p className="text-red-600 mt-4">{message}</p>
        )}

        <button
          onClick={() => navigate("/")}
          className="mt-6 border border-gray-400 px-4 py-2 rounded-md w-full"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ResendVerification;
