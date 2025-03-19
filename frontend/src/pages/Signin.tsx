import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if(response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
        //notify home page
        window.dispatchEvent(new Event("userUpdated"));
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <img
        src="/logo.png"
        alt="Coinvergence Logo"
        className="absolute top-6 left-6 h-auto w-28 sm:w-36 md:w-44 lg:w-52 xl:w-60 object-contain cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">SIGN IN</h1>
          <p className="text-sm text-gray-600 mt-2">Use your email address or username to sign into your account</p>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          <p>
            If you are signing in for the first time since the 6th November, you must reset your password before you
            will be able to continue.
            <a className="text-red-600 underline" href="#"> Click here to reset your password.</a>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email/Username</label>
            <input
              type="text"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Enter your email or username"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i className="fas fa-eye absolute right-3 top-3 text-gray-500 cursor-pointer"></i>
          </div>

          <div className="text-right mb-6">
            <a className="text-sm text-red-600 underline" href="#">Forgotten Password?</a>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700">
            SIGN IN
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            <i className="fab fa-google mr-2"></i> Google
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            <i className="fab fa-facebook-f mr-2"></i> Facebook
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            <i className="fab fa-apple mr-2"></i> Apple
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?
            <a className="text-red-600 underline" href="/signup"> Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
