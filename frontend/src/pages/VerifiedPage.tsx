import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifiedPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");

    if (email) {
      setMessage(`Your email (${email}) has been verified successfully!`);
      
      // Simulate the successful email verification and redirect
      setTimeout(() => {
        // Set the user as authenticated and redirect to Home
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify({ email })); // Save user info
        navigate("/");  // Redirect to home after 3 seconds
      }, 3000);
    } else {
      setMessage("There was an error verifying your email.");
    }
  }, [location, navigate]);

  return (
    <div className="text-center">
      <h2>{message}</h2>
      <p>You will be redirected to the homepage shortly...</p>
    </div>
  );
};

export default VerifiedPage;
