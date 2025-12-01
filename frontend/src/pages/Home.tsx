import React, { useMemo, useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import CryptoPriceTracker from "../components/CryptoPriceTracker"

const Home: React.FC = () => {
  const navigate = useNavigate(); // Enables navigation without reloading
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(""); // Store user's name
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cryptoTrackers = useMemo(() => (
    Array.from({ length: 9 }).map((_, i) => (
      <CryptoPriceTracker key={i} display_id={i + 1} />
    ))
  ), []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  //detect authentication state
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      setIsAuthenticated(!!token);

      if(storedUser) {
        setUsername(JSON.parse(storedUser).firstName);
      }
    };
    checkAuth();

    //listen for login updates from Signin.tsx
    window.addEventListener("userUpdated", checkAuth);
    return () => window.removeEventListener("userUpdated", checkAuth);
  }, []);

  //close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //handle sign out
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUsername(""); //clear username on logout
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="relative flex items-center justify-between mb-12">
        {/* Empty div for left alignment */}
        <div></div>
        <img
          src="/icons/logo.png"
          alt="Coinvergence Logo"
          className="h-12 sm:h-16 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* User Logo (Upper Right) with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src="/icons/user-icon.png" // User icon for dropdown
            alt="User"
            className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
            onClick={toggleDropdown}
          />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-md">
              {isAuthenticated ? (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => navigate("/profile")} // Navigate to Profile page
                  >
                    {username ? `${username}'s Profile` : "Profile"}
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => navigate("/settings")} // Navigate to Settings page
                  >
                    Settings
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => navigate("/my-wallet")} // Navigate to My Wallet page
                  >
                    My Wallet
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => navigate("/signin")}
                  >
                    Sign In
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Trending Coins Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Trending Coins</h2>
          <button className="border border-gray-800 px-4 py-1 text-sm">Shop all</button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {cryptoTrackers}
        </div>
      </section>

      {/* Go Digital Section */}
      <section className="text-center mb-16">
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Copperplate, fantasy", fontSize: "32px" }}>
          GO DIGITAL
        </h2>
        <div className="mb-8">
          <input className="border border-gray-300 px-4 py-2 w-1/2" placeholder="Search" type="text" />
        </div>
        <div className="flex justify-center space-x-16">
          <div className="text-center">
            <img alt="Buy" className="mx-auto mb-2" src="/icons/buy.png" style={{ height: "60%" }} />
            <p style={{ color: "#837D3D", fontSize: "32px" }}>Buy</p>
          </div>
          <div className="text-center">
            <img alt="Wallet" className="mx-auto mb-2" src="/icons/wallet.png" style={{ height: "60%" }} />
            <p style={{ color: "#837D3D", fontSize: "32px" }}>My Wallet</p>
          </div>
          <div className="text-center">
            <img alt="Sell" className="mx-auto mb-2" src="/icons/sell.png" style={{ height: "60%" }} />
            <p style={{ color: "#837D3D", fontSize: "32px" }}>Sell</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center">
        <h2 className="text-xl font-bold mb-4">Coinvergence</h2>
        <p className="mb-4">Sign up with your email address to receive news and updates.</p>
        <div className="flex justify-center items-center space-x-2 mb-4">
          <input className="border border-gray-300 px-4 py-2" placeholder="Email Address" type="email" />
          <button className="bg-gray-800 text-white px-4 py-2">Sign Up</button>
        </div>
      </footer>
    </div>
  );
};

export default Home;