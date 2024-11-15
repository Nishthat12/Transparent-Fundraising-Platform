import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import bigInt from "big-integer"; // Importing BigInt
import { contractABI, contractAddress } from "../config";

const CampaignDetails = () => {
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

  // Initialize Web3 and contract
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

  // Fetch campaign details
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

  // Handle donation
  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    try {
      await contract.methods.donate(campaignId).send({
        from: account,
        value: web3.utils.toWei(donationAmount, "ether"),
      });
      alert("Donation successful!");
      setDonationAmount("");
    } catch (err) {
      console.error("Error processing donation:", err);
      setError("Error processing donation.");
    }
  };

  // Handle spend funds
  const handleSpendFunds = async () => {
    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      alert("Please enter a valid amount to spend.");
      return;
    }

    const spendAmountInWei = bigInt(web3.utils.toWei(spendAmount, "ether"));
    const raisedAmountInWei = bigInt(
      web3.utils.toWei(campaign.raisedAmount, "ether")
    );

    if (spendAmountInWei.gt(raisedAmountInWei)) {
      alert("You cannot spend more than the raised amount.");
      return;
    }

    try {
      await contract.methods
        .spendFunds(campaignId, spendAmountInWei.toString())
        .send({
          from: account,
        });
      alert(`Successfully spent ${spendAmount} ETH!`);
      setSpendAmount("");
    } catch (err) {
      console.error("Error processing spend funds transaction:", err);
      setError("Error processing spend funds transaction.");
    }
  };

  // Calculate time left
  const getTimeLeft = (endTime) => {
    const endTimeBigInt = bigInt(endTime);
    const currentTime = bigInt(Math.floor(Date.now() / 1000));
    const timeLeftInSeconds = endTimeBigInt.minus(currentTime).minus(259200);

    if (timeLeftInSeconds <= 0) {
      campaign.isEnded = 1;
      return "Campaign Ended";
    }

    // Calculate days, hours, minutes, seconds
    const secondsInDay = bigInt(24 * 60 * 60); // 1 day = 86400 seconds
    const secondsInHour = bigInt(3600); // 1 hour = 3600 seconds
    const secondsInMinute = bigInt(60); // 1 minute = 60 seconds

    const days = timeLeftInSeconds.divide(secondsInDay); // Calculate days
    const hours = timeLeftInSeconds.mod(secondsInDay).divide(secondsInHour); // Calculate hours
    const minutes = timeLeftInSeconds
      .mod(secondsInHour)
      .divide(secondsInMinute); // Calculate minutes
    const seconds = timeLeftInSeconds.mod(secondsInMinute); // Remaining seconds

    // Build the time left string
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
    <div>
      <h1>{campaign.title}</h1>
      <p>{campaign.description}</p>
      <p>Goal: {campaign.goalAmount} ETH</p>
      <p>Raised: {campaign.raisedAmount} ETH</p>
      <p>
        {campaign.isEnded
          ? "Campaign has ended"
          : `Time Left: ${getTimeLeft(campaign.endTime)}`}
      </p>

      {!campaign.isEnded && (
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

      {isOwner && (
        <div>
          <h2>Spend Funds</h2>
          <input
            type="text"
            placeholder="Enter amount to spend (ETH)"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
          />
          <button onClick={handleSpendFunds}>Spend Funds</button>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
