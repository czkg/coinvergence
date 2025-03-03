import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
//import './index.css'
// import App from './App.tsx'
import CryptoPriceTracker from "./components/CryptoPriceTracker"

const mountComponent = (Component: React.FC<any>, elementId: string, props: any) => {
  const element = document.getElementById(elementId);
  if(element) {
    ReactDOM.createRoot(element).render(
      <React.StrictMode>
        <Component {...props}/>
      </React.StrictMode>
    );
  } else {
    console.warn(`Element with id "${elementId}" not found.`);
  }
};

mountComponent(CryptoPriceTracker, "trending_1", {display_id: 1});
mountComponent(CryptoPriceTracker, "trending_2", {display_id: 2});
mountComponent(CryptoPriceTracker, "trending_3", {display_id: 3});
mountComponent(CryptoPriceTracker, "trending_4", {display_id: 4});
mountComponent(CryptoPriceTracker, "trending_5", {display_id: 5});
mountComponent(CryptoPriceTracker, "trending_6", {display_id: 6});
mountComponent(CryptoPriceTracker, "trending_7", {display_id: 7});
mountComponent(CryptoPriceTracker, "trending_8", {display_id: 8});
mountComponent(CryptoPriceTracker, "trending_9", {display_id: 9});
