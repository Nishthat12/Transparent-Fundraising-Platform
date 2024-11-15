import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import bigInt from "big-integer";
import { contractABI, contractAddress } from "../config";
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const CampaignDetails = () => {
  const navigate = useNavigate();
  const { id: campaignId } = useParams();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // For pop-up
  const [dialogMessage, setDialogMessage] = useState(""); // Dialog message

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.requestAccounts();
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

  useEffect(() => {
    if (web3 && campaignId && contract) {
      const loadCampaignDetails = async () => {
        try {
          const campaignDetails = await contract.methods
            .campaigns(campaignId)
            .call();

          setCampaign({
            ...campaignDetails,
            goalAmount: web3.utils.fromWei(campaignDetails.goalAmount, "ether"),
            raisedAmount: web3.utils.fromWei(
              campaignDetails.raisedAmount,
              "ether"
            ),
          });

          setIsOwner(
            campaignDetails.creator.toLowerCase() === account.toLowerCase()
          );
        } catch (err) {
          setError("Error fetching campaign details");
        } finally {
          setLoading(false);
        }
      };

      loadCampaignDetails();
    }
  }, [web3, campaignId, contract, account]);

  const openDialog = (message) => {
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) {
      openDialog("Please enter a valid donation amount.");
      return;
    }

    try {
      await contract.methods.donate(campaignId).send({
        from: account,
        value: web3.utils.toWei(donationAmount, "ether"),
      });
      openDialog("Donation successful!");
      setDonationAmount("");
    } catch (err) {
      console.error("Error processing donation:", err);
      openDialog("Error processing donation.");
    }
  };

  const handleSpendFunds = async () => {
    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      openDialog("Please enter a valid amount to spend.");
      return;
    }

    const spendAmountInWei = bigInt(web3.utils.toWei(spendAmount, "ether"));
    const raisedAmountInWei = bigInt(
      web3.utils.toWei(campaign.raisedAmount, "ether")
    );

    if (spendAmountInWei.gt(raisedAmountInWei)) {
      openDialog("You cannot spend more than the raised amount.");
      return;
    }

    try {
      await contract.methods
        .spendFunds(campaignId, spendAmountInWei.toString())
        .send({
          from: account,
        });
      openDialog(`Successfully spent ${spendAmount} ETH!`);
      setSpendAmount("");
    } catch (err) {
      console.error("Error processing spend funds transaction:", err);
      openDialog("Error processing spend funds transaction.");
    }
  };

  const getTimeLeft = (endTime) => {
    const endTimeBigInt = bigInt(endTime);
    const currentTime = bigInt(Math.floor(Date.now() / 1000));
    const timeLeftInSeconds = endTimeBigInt.minus(currentTime);

    if (timeLeftInSeconds <= 0) {
      campaign.isEnded = 1;
      return "Campaign Ended";
    }

    const secondsInDay = bigInt(24 * 60 * 60);
    const secondsInHour = bigInt(3600);
    const secondsInMinute = bigInt(60);

    const days = timeLeftInSeconds.divide(secondsInDay);
    const hours = timeLeftInSeconds.mod(secondsInDay).divide(secondsInHour);
    const minutes = timeLeftInSeconds
      .mod(secondsInHour)
      .divide(secondsInMinute);
    const seconds = timeLeftInSeconds.mod(secondsInMinute);

    let timeLeftStr = "";
    if (!days.isZero()) timeLeftStr += `${days.toString()}d `;
    if (!hours.isZero() || !days.isZero())
      timeLeftStr += `${hours.toString()}h `;
    if (!minutes.isZero() || !hours.isZero() || !days.isZero())
      timeLeftStr += `${minutes.toString()}m `;
    timeLeftStr += `${seconds.toString()}s`;

    return timeLeftStr;
  };

  if (loading) {
    return <div>Loading campaign details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <div className="mb-4">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/campaigns")} // Navigates back to homepage
        >
          ← Back
        </button>
      </div>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {campaign.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {campaign.description}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Goal: {campaign.goalAmount} ETH
          </Typography>
          <Typography variant="h6" gutterBottom>
            Raised: {campaign.raisedAmount} ETH
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {campaign.isEnded
              ? "Campaign has ended"
              : `Time Left: ${getTimeLeft(campaign.endTime)}`}
          </Typography>

          {!campaign.isEnded && (
            <div style={{ marginBottom: "20px" }}>
              <TextField
                label="Donation Amount (ETH)"
                variant="outlined"
                fullWidth
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleDonate}
                fullWidth
              >
                Donate
              </Button>
            </div>
          )}

          {isOwner && campaign.isEnded && (
            <div>
              <Typography variant="h6" gutterBottom>
                Spend Funds
              </Typography>
              <TextField
                label="Amount to Spend (ETH)"
                variant="outlined"
                fullWidth
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSpendFunds}
                fullWidth
              >
                Spend Funds
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for pop-up */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Notice</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CampaignDetails;
