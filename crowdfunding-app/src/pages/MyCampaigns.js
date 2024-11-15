import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contract } from "../contract/TransparentCrowdFunding"; // Ensure this points to your contract instance
import Web3 from "web3";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Container,
} from "@mui/material";

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
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Typography variant="h6">No campaigns found.</Typography>
      </div>
    );
  }

  return (
    <Container style={{ marginTop: "20px" }}>
      <div className="mb-4">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/home")} // Navigates back to homepage
        >
          ← Back to Homepage
        </button>
      </div>
      <Typography variant="h4" gutterBottom>
        My Campaigns
      </Typography>
      <Grid container spacing={3}>
        {myCampaigns.map((campaign) => (
          <Grid item xs={12} sm={6} md={4} key={campaign.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {campaign.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {campaign.description}
                </Typography>
                <Typography variant="body1" color="textPrimary">
                  <strong>Goal:</strong> {campaign.goalAmount} ETH
                </Typography>
                <Typography variant="body1" color="textPrimary" gutterBottom>
                  <strong>Raised:</strong> {campaign.raisedAmount} ETH
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Start Time:</strong> {campaign.startTime}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>End Time:</strong> {campaign.endTime}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                  fullWidth
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyCampaigns;
