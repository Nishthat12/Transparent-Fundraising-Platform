// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract TransparentCrowdFunding {

    struct Campaign {
        string title;
        string description;
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 startTime;
        uint256 endTime;
        address payable creator;
        bool isPrivate;
        bool isEnded;
    }

    struct Expense {
        uint256 amount;
        string description;
        uint256 date;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Expense[]) public campaignExpenses;
    uint256 public campaignCount;

    event CampaignCreated(uint256 campaignId, string title, uint256 goalAmount, uint256 startTime, uint256 endTime);
    event DonationReceived(uint256 campaignId, address donor, uint256 amount);
    event ExpenseAdded(uint256 campaignId, uint256 amount, string description);
    event FundsSpent(uint256 campaignId, uint256 amount);

    // Modifier to ensure the campaign is active
    modifier isActiveCampaign(uint256 campaignId) {
        require(campaigns[campaignId].endTime > block.timestamp, "Campaign has ended");
        _;
    }

    // Modifier to ensure the campaign has ended
    modifier isEndedCampaign(uint256 campaignId) {
        require(campaigns[campaignId].endTime <= block.timestamp, "Campaign has not ended yet");
        _;
    }

    // Create a new campaign
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _duration,  // Duration in seconds
        bool _isPrivate
    ) public {
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;

        campaigns[campaignCount] = Campaign({
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            creator: payable(msg.sender),
            isPrivate: _isPrivate,
            isEnded: false
        });

        emit CampaignCreated(campaignCount, _title, _goalAmount, startTime, endTime);

        campaignCount++;
    }

    // Donate to a campaign
    function donate(uint256 campaignId) public payable isActiveCampaign(campaignId) {
        require(msg.value > 0, "Donation must be greater than 0");

        Campaign storage campaign = campaigns[campaignId];
        campaign.raisedAmount += msg.value;

        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    // Add an expense to a campaign
    function addExpense(uint256 campaignId, uint256 _amount, string memory _description) public isEndedCampaign(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Only the creator can add expenses");

        campaignExpenses[campaignId].push(Expense({
            amount: _amount,
            description: _description,
            date: block.timestamp
        }));

        emit ExpenseAdded(campaignId, _amount, _description);
    }

    // Fetch expenses for a specific campaign
    function getExpenses(uint256 campaignId) public view returns (Expense[] memory) {
        return campaignExpenses[campaignId];
    }

    // Fetch all campaigns
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    // Fetch campaign details
    function getCampaign(uint256 campaignId) public view returns (
        string memory title,
        string memory description,
        uint256 goalAmount,
        uint256 raisedAmount,
        uint256 startTime,
        uint256 endTime,
        address creator,
        bool isPrivate
    ) {
        Campaign storage campaign = campaigns[campaignId];
        return (
            campaign.title,
            campaign.description,
            campaign.goalAmount,
            campaign.raisedAmount,
            campaign.startTime,
            campaign.endTime,
            campaign.creator,
            campaign.isPrivate
        );
    }

    // Function for campaign owners to withdraw funds
    function spendFunds(uint256 campaignId, uint256 amount) public isEndedCampaign(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Only the creator can spend the funds");
        require(amount <= campaign.raisedAmount, "Insufficient funds");

        campaign.raisedAmount -= amount;
        payable(msg.sender).transfer(amount);

        emit FundsSpent(campaignId, amount);
    }
}
