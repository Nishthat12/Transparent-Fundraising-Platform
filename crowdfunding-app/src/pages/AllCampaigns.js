import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { contractABI, contractAddress } from "../config";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
} from "@mui/material";

const AllCampaigns = () => {
  const navigate = useNavigate();
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

        // Format and filter the campaigns to exclude private ones
        const formattedCampaigns = allCampaigns
          .map((campaign, index) => ({
            id: index, // Using the index as the campaign ID
            title: campaign.title,
            goalAmount: Web3.utils.fromWei(campaign.goalAmount, "ether"),
            raisedAmount: Web3.utils.fromWei(campaign.raisedAmount, "ether"),
            isPrivate: campaign.isPrivate,
          }))
          .filter((campaign) => !campaign.isPrivate); // Filter out private campaigns

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
  if (campaigns.length === 0) return <p>No public campaigns found.</p>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
      <div className="mb-4">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/home")} // Navigates back to homepage
        >
          ← Back to HomePage
        </button>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        All Public Campaigns
      </h1>

      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} sm={6} md={4} key={campaign.id}>
            <Card
              elevation={3}
              style={{
                borderRadius: "10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  style={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  {campaign.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginBottom: "10px" }}
                >
                  Goal: {campaign.goalAmount} ETH
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginBottom: "10px" }}
                >
                  Raised: {campaign.raisedAmount} ETH
                </Typography>
                <Typography
                  variant="body2"
                  color={campaign.isPrivate ? "error" : "primary"}
                  style={{ marginBottom: "20px" }}
                >
                  {campaign.isPrivate ? "Private Campaign" : "Public Campaign"}
                </Typography>
                <Link
                  to={`/campaign/${campaign.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button fullWidth variant="contained" color="primary">
                    View Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AllCampaigns;
