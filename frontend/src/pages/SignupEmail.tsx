import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupEmail: React.FC = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    linkCompany: false,
  });

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password validation rules
  const passwordCriteria = [
    { label: "At least 10 characters", regex: /.{10,}/ },
    { label: "At least one uppercase letter (A-Z)", regex: /[A-Z]/ },
    { label: "At least one lowercase letter (a-z)", regex: /[a-z]/ },
    { label: "At least one number (0-9)", regex: /\d/ },
  ];

  // Check if password meets each requirement
  const checkPasswordCriteria = (password: string) => {
    return passwordCriteria.map((criterion) => ({
      label: criterion.label,
      met: criterion.regex.test(password),
    }));
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Form validation before submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const unmetCriteria = checkPasswordCriteria(formData.password).filter((c) => !c.met);
    if (!formData.firstName || !formData.email) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (unmetCriteria.length > 0) {
      alert("Password does not meet all requirements.");
      return;
    }

    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center min-h-screen relative">
      {/* Clickable Logo to Navigate Home */}
      <img
        src="/logo.png"
        alt="Coinvergence Logo"
        className="absolute top-6 left-6 h-auto w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 object-contain cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-center mb-2">ENTER DETAILS</h1>
        <p className="text-center text-gray-600 mb-6">
          Welcome to the Coinvergence family, please enter your personal details to create your account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
                emailRegex.test(formData.email) || !emailFocused
                  ? "border-gray-300 focus:ring-red-500"
                  : "border-red-500 focus:ring-red-600"
              }`}
              required
            />
            {/* Email validation feedback only appears when focused */}
            {emailFocused && !emailRegex.test(formData.email) && (
              <p className="text-red-500 text-xs mt-1">Invalid email format</p>
            )}
          </div>

          {/* Password with Toggle & Validation */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => !formData.password && setPasswordFocused(false)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <i className={`fas ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          {/* Password Strength Indicator - Only Visible When Focused */}
          {passwordFocused && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Password must include:</p>
              <ul className="text-sm list-none pl-2 mt-1">
                {checkPasswordCriteria(formData.password).map(({ label, met }, index) => (
                  <li key={index} className={`flex items-center ${met ? "text-green-600" : "text-red-500"}`}>
                    <i className={`fas ${met ? "fa-check-circle" : "fa-times-circle"} mr-2`}></i>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
          >
            AGREE & CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupEmail;
