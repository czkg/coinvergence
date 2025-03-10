import React from "react"
import { useNavigate } from "react-router-dom"

const SignUpButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate("/signup")} className="bg-green-700 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600">
            Sign Up
        </button>
    );
};

export default SignUpButton;