import React from "react"
import { useNavigate } from "react-router-dom"

const Home: React.FC = () => {
  const navigate = useNavigate(); // Enables navigation without reloading

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", fontSize: "40px" }}>
          Coinvergence
        </h1>
      </header>

      {/* Sign Up & Log In */}
      <section className="relative mb-12 pt-6">
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
      </section>

      {/* Trending Coins Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Trending Coins</h2>
          <button className="border border-gray-800 px-4 py-1 text-sm">Shop all</button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} id={`trending_${i + 1}`}>
              name
              <a className="text-green-700 underline" href="#">
                Product Name
              </a>
            </div>
          ))}
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
