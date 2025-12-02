import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import SignupEmail from "./pages/SignupEmail"
import Signin from "./pages/Signin";
import VerifyEmail from "./pages/VerifyEmail";
import CheckYourEmail from "./pages/CheckYourEmail";
import ResendVerification from "./pages/ResendVerification";

const RouterWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup-email" element={<SignupEmail />}/>
        <Route path="/signin" element={<Signin />} />
        <Route path="/verify-email" element={<VerifyEmail />}/>
        <Route path="/check-your-email" element={<CheckYourEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterWrapper;
