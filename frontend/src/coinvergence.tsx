import React from "react";
import ReactDOM from "react-dom";
import { CryptoTracker } from "./components/CryptoPriceTracker";

const prod1Link = document.getElementById("prod1") as HTMLAnchorElement;
if(prod1Link) {
    CryptoTracker("BTC").then((price) => {
        if(price) {
            prod1Link.textContent = price;
        } else {
            prod1Link.textContent = "Unavailable";
        }
    });
}