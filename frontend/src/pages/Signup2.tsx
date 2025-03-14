import React, { useState } from "react";

const Signup2: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    linkCompany: false,
  });

  // Toggle password visibility
  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
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
    if (!formData.firstName || !formData.email) {
      alert("Please fill in all required fields.");
      return;
    }
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">ENTER DETAILS</h1>
        <p className="text-center text-gray-600 mb-6">
          Welcome to The Arsenal family, please enter your personal details to create your account.
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
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Password with Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                onClick={togglePassword}
              >
                <i className={passwordVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <p className="text-sm text-gray-600 mb-4">
            Your password must contain at least 10 characters and include the following:
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-5 mb-4">
            <li>An uppercase letter</li>
            <li>A lowercase letter</li>
            <li>A number</li>
          </ul>

          {/* Checkbox: Link a Company */}
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="linkCompany"
                checked={formData.linkCompany}
                onChange={handleChange}
                className="form-checkbox text-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                I would like to link a company to this account.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700"
          >
            AGREE & CONTINUE
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <a className="text-sm text-gray-500 hover:underline" href="#">
            Terms & Conditions
          </a>
          <span className="mx-2 text-gray-500"> | </span>
          <a className="text-sm text-gray-500 hover:underline" href="#">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup2;
