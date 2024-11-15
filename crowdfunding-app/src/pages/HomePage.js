import React from "react";
import { Link } from "react-router-dom";

const HomePage = ({ userAccount }) => {
  return (
    <div>
      <h2>Welcome to the Fundraising Platform</h2>
      <p>Connected Account: {userAccount}</p>

      <div>
        {/* Link to Create Campaign page */}
        <Link to="/create">
          <button>Create a New Campaign</button>
        </Link>
      </div>

      <div>
        <Link to="/campaigns">
          <button>See All Campaigns</button>
        </Link>
      </div>

      <div>
        <Link to="/my-campaigns">
          <button>See My Campaigns</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
