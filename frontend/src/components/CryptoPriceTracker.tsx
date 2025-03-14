import React, {useState, useEffect} from "react";

interface CryptoPriceTrackerProps {
    display_id: number;
}

const CryptoPriceTracker: React.FC<CryptoPriceTrackerProps> = ({ display_id }) => {
    const [cryptoSymbol, setCryptoSymbol] = useState<string | null>(null);
    const [cryptoPrice, setCryptoPrice] = useState<number | null>(null);
    useEffect(() => {
        const fetchTopCrypto = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/crypto/trending_cap");
                const data = await response.json();
                
                if (data.length >= display_id) {
                    setCryptoSymbol(data[display_id - 1].symbol);
                    setCryptoPrice(data[display_id - 1].price);
                } else {
                    console.warn(`Invalid display_id: ${display_id}`);
                }
            } catch (error) {
                console.error("Error fetching top crypto:", error);
            }
        };

        fetchTopCrypto();
    }, [display_id]);

    return (
        <div>
          <h2># {display_id}</h2>
          {cryptoSymbol && cryptoPrice ? (
            <p>
              {cryptoSymbol}: ${cryptoPrice}
            </p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
    );
};

export default CryptoPriceTracker;