import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config";

const AllCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError("");

      try {
        if (!window.ethereum) throw new Error("MetaMask is not installed.");

        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Fetch all campaigns
        const allCampaigns = await contract.methods.getAllCampaigns().call();

        // Format the campaigns to be displayed
        const formattedCampaigns = allCampaigns.map((campaign, index) => ({
          id: index, // Using the index as the campaign ID
          title: campaign.title,
          goalAmount: Web3.utils.fromWei(campaign.goalAmount, "ether"),
          raisedAmount: Web3.utils.fromWei(campaign.raisedAmount, "ether"),
          isPrivate: campaign.isPrivate,
        }));

        setCampaigns(formattedCampaigns);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError(err.message || "An error occurred while fetching campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) return <p>Loading campaigns...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (campaigns.length === 0) return <p>No campaigns found.</p>;

  return (
    <div>
      <h1>All Campaigns</h1>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <Link to={`/campaign/${campaign.id}`}>
              <h3>{campaign.title}</h3>
              <p>Goal Amount: {campaign.goalAmount} ETH</p>
              <p>Raised Amount: {campaign.raisedAmount} ETH</p>
              <p>{campaign.isPrivate ? "Private" : "Public"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllCampaigns;
