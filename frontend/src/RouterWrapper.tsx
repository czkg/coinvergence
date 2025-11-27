import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import SignupEmail from "./pages/SignupEmail"
import Signin from "./pages/Signin";
import EmailVerify from "./pages/EmailVerify";

const RouterWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup-email" element={<SignupEmail />}/>
        <Route path="/signin" element={<Signin />} />
        <Route path="/verify-email" element={<EmailVerify />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default RouterWrapper;
