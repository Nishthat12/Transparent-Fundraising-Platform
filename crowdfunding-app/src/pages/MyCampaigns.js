import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contract } from "../contract/TransparentCrowdFunding"; // Ensure this points to your contract instance
import Web3 from "web3";

const MyCampaigns = () => {
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchMyCampaigns = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      // Fetch total campaign count
      const campaignCount = await contract.methods.campaignCount().call();
      const campaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.methods.campaigns(i).call();

        if (campaign.creator.toLowerCase() === userAddress.toLowerCase()) {
          campaigns.push({
            id: i,
            title: campaign.title,
            description: campaign.description,
            goalAmount: Web3.utils.fromWei(
              campaign.goalAmount.toString(),
              "ether"
            ),
            raisedAmount: Web3.utils.fromWei(
              campaign.raisedAmount.toString(),
              "ether"
            ),
            startTime: new Date(
              Number(campaign.startTime) * 1000
            ).toLocaleString(),
            endTime: new Date(Number(campaign.endTime) * 1000).toLocaleString(),
            isPrivate: campaign.isPrivate,
          });
        }
      }

      setMyCampaigns(campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load your campaigns. Please try again.");
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!myCampaigns.length) {
    return <div>No campaigns found.</div>;
  }

  return (
    <div>
      <h1>My Campaigns</h1>
      <ul>
        {myCampaigns.map((campaign) => (
          <li key={campaign.id}>
            <h2>{campaign.title}</h2>
            <p>Goal: {campaign.goalAmount} ETH</p>
            <p>Raised: {campaign.raisedAmount} ETH</p>
            <button onClick={() => navigate(`/campaign/${campaign.id}`)}>
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyCampaigns;
