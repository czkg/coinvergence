import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
//import './index.css'
import CryptoPriceTracker from "./components/CryptoPriceTracker"
import RouterWrapper from "./RouterWrapper"


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterWrapper />
  </React.StrictMode>
);

const mountComponent = (Component: React.FC<any>, elementId: string, props?: any) => {
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

Array.from({ length: 9 }).forEach((_, index) => {
  mountComponent(CryptoPriceTracker, `trending_${index + 1}`, { display_id: index + 1 });
});
