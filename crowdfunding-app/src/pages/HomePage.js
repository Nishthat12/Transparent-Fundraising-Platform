import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css"; // Create a CSS file for additional custom styles

const HomePage = ({ userAccount }) => {
  // Function to truncate the account address
  const truncateAddress = (address) => {
    return address ? `${address.slice(0, 8)}...` : "Not Connected";
  };

  return (
    <div className="homepage-container d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="homepage-title">Welcome to the Fundraising Platform</h1>
      <p className="homepage-account">
        Connected Account: {truncateAddress(userAccount)}
      </p>

      <div className="homepage-buttons">
        <Link to="/create">
          <button className="btn btn-primary btn-lg m-2">
            Create a New Campaign
          </button>
        </Link>
        <Link to="/campaigns">
          <button className="btn btn-secondary btn-lg m-2">
            See All Campaigns
          </button>
        </Link>
        <Link to="/my-campaigns">
          <button className="btn btn-info btn-lg m-2">See My Campaigns</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
