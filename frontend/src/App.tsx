// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import React, { useEffect } from "react"
import CryptoTracker from './components/CryptoPriceTracker'

const App: React.FC = () => {
  return (
    <div>
        <h1>Crypto Price Tracker</h1>
        <CryptoTracker symbol="BTC" />
        <CryptoTracker symbol="ETH" />
    </div>
  );
};

export default App
