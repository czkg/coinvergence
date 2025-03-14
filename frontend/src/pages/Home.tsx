import React, { useMemo, useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import CryptoPriceTracker from "../components/CryptoPriceTracker"

const Home: React.FC = () => {
  const navigate = useNavigate(); // Enables navigation without reloading
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cryptoTrackers = useMemo(() => (
    Array.from({ length: 9 }).map((_, i) => (
      <CryptoPriceTracker key={i} display_id={i + 1} />
    ))
  ), []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="relative flex items-center justify-between mb-12">
        {/* Empty div for left alignment */}
        <div></div>
        <h1 className="text-2xl font-bold text-center" style={{ fontFamily: "Georgia, serif", fontSize: "40px" }}>
          Coinvergence
        </h1>

        {/* User Logo (Upper Right) with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src="/user-icon.png" // User icon for dropdown
            alt="User"
            className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
            onClick={toggleDropdown}
          />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md">
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
            </div>
          )}
        </div>
      </header>

      {/* Sign Up & Log In */}
      {/* <section className="relative mb-12 pt-6">
        <div className="absolute top-0 right-0">
          <button
            onClick={() => navigate("/signup")}
            className="bg-green-700 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="border border-gray-800 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Log In
          </button>
        </div>
      </section> */}

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
            <img alt="Buy" className="mx-auto mb-2" src="./icons/buy.png" style={{ height: "60%" }} />
            <p style={{ color: "#837D3D", fontSize: "32px" }}>Buy</p>
          </div>
          <div className="text-center">
            <img alt="Wallet" className="mx-auto mb-2" src="./icons/wallet.png" style={{ height: "60%" }} />
            <p style={{ color: "#837D3D", fontSize: "32px" }}>My Wallet</p>
          </div>
          <div className="text-center">
            <img alt="Sell" className="mx-auto mb-2" src="./icons/sell.png" style={{ height: "60%" }} />
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
