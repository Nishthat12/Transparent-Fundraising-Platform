import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CreateCampaign from "./pages/CreateCampaign";
import AllCampaigns from "./pages/AllCampaigns";
import CampaignDetails from "./pages/CampaignDetails";
import MyCampaigns from "./pages/MyCampaigns";

function App() {
  const [userAccount, setUserAccount] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setUserAccount(accounts[0]); // Update the state with the first account
        window.ethereum.on("accountsChanged", (accounts) => {
          setUserAccount(accounts[0]); // Update state if account changes
        });
        window.ethereum.on("chainChanged", () => {
          window.location.reload(); // Reload to ensure the correct chain
        });
      } catch (err) {
        console.error("MetaMask connection error", err);
        throw new Error("MetaMask connection failed");
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage connectWallet={connectWallet} />} />
        <Route path="/home" element={<HomePage userAccount={userAccount} />} />
        <Route
          path="/create"
          element={<CreateCampaign userAccount={userAccount} />}
        />
        <Route path="/campaigns" element={<AllCampaigns />} />
        <Route path="/campaign/:id" element={<CampaignDetails />} />
        <Route path="/my-campaigns" element={<MyCampaigns />} />
      </Routes>
    </Router>
  );
}

export default App;
