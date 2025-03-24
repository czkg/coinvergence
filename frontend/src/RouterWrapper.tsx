import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import SignupEmail from "./pages/SignupEmail"
import Signin from "./pages/Signin";
import VerifiedPage from "./pages/VerifiedPage";

const RouterWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signupEmail" element={<SignupEmail />}/>
        <Route path="/signin" element={<Signin />} />
        <Route path="/verified" element={<VerifiedPage />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default RouterWrapper;
