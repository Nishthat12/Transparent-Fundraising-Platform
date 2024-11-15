import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ connectWallet }) => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      // If the wallet is connected successfully, navigate to the homepage
      navigate("/home");
    } catch (err) {
      setError(
        "MetaMask connection failed. Please ensure MetaMask is installed."
      );
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Login with MetaMask</h1>
      <button onClick={handleConnectWallet}>Connect Wallet</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
