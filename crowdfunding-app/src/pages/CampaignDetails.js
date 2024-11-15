import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config"; // Make sure these are correctly imported

import { useParams } from "react-router-dom"; // Import useParams from react-router-dom

const CampaignDetails = () => {
  const { id: campaignId } = useParams(); // Get campaignId from URL params
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and Contract
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );

          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setContract(contractInstance);
        } catch (err) {
          setError("Failed to connect to Web3");
        }
      } else {
        setError("Please install MetaMask!");
      }
    };

    initWeb3();
  }, []);

  // Fetch campaign details when Web3 is initialized
  useEffect(() => {
    if (web3 && campaignId) {
      const loadCampaignDetails = async () => {
        try {
          const campaignDetails = await contract.methods
            .getCampaign(campaignId)
            .call();
          setCampaign(campaignDetails);
        } catch (err) {
          setError("Error fetching campaign details");
        } finally {
          setLoading(false);
        }
      };

      loadCampaignDetails();
    }
  }, [web3, campaignId, contract]);

  // Function to handle donation
  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    try {
      await contract.methods.donate(campaignId).send({
        from: account,
        value: web3.utils.toWei(donationAmount, "ether"),
      });
      alert("Donation successful!");
    } catch (err) {
      setError("Error processing donation");
    }
  };

  if (loading) {
    return <div>Loading campaign details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>{campaign.title}</h2>
      <p>{campaign.description}</p>
      <p>Goal: {web3.utils.fromWei(campaign.goalAmount, "ether")} ETH</p>
      <p>Raised: {web3.utils.fromWei(campaign.raisedAmount, "ether")} ETH</p>
      <p>{campaign.isEnded ? "Campaign has ended" : "Campaign is active"}</p>

      {campaign.isEnded ? (
        <button disabled>Donation is closed</button>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter donation amount (ETH)"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
          />
          <button onClick={handleDonate}>Donate</button>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
