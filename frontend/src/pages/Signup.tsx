import React from "react"
import { useNavigate } from "react-router-dom"

const Signup: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <img
        src="/logo.png"
        alt="Coinvergence Logo"
        className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 text-center">
        <div className="mb-6">
          <img alt="Coinvergence logo" className="mx-auto" src="https://placehold.co/64x64" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">SIGN UP FOR</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">COINVERGENCE</h2>
        <p className="text-gray-600 mb-6">
          Use your email address or social accounts to sign in or create an account
        </p>

        <button 
          onClick={() => navigate("/signup2")}
          className="w-full bg-red-700 text-white py-2 rounded-lg font-semibold mb-4"
        >
          EMAIL ADDRESS
        </button>

        <div className="flex justify-between items-center mb-6">
          <button className="flex items-center justify-center w-1/3 bg-gray-100 py-2 rounded-lg text-gray-800 mx-1">
            <i className="fab fa-google mr-2"></i> Google
          </button>
          <button className="flex items-center justify-center w-1/3 bg-gray-100 py-2 rounded-lg text-gray-800 mx-1">
            <i className="fab fa-facebook-f mr-2"></i> Facebook
          </button>
          <button className="flex items-center justify-center w-1/3 bg-gray-100 py-2 rounded-lg text-gray-800 mx-1">
            <i className="fab fa-apple mr-2"></i> Apple
          </button>
        </div>

        <p className="text-gray-600">
          Already have an account?{" "}
          <a className="text-red-700 font-semibold" href="/signin">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
