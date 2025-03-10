import React from "react"
import { BrowserRouter } from "react-router-dom"
import SignUpButton  from "./SignUpButton"

const RouterWrapper: React.FC = () => {
    return (
        <BrowserRouter>
          <SignUpButton />
        </BrowserRouter>
    );
};

export default RouterWrapper;