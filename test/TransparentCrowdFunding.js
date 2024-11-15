const TransparentCrowdFunding = artifacts.require("TransparentCrowdFunding");

contract("TransparentCrowdFunding", (accounts) => {
  let contract;
  const [owner, donor] = accounts;

  beforeEach(async () => {
    contract = await TransparentCrowdFunding.new();
  });

  it("should deploy the contract", async () => {
    assert(contract.address !== "");
  });

  it("should allow the campaign owner to create a campaign", async () => {
    const title = "Test Campaign";
    const description = "A campaign to test creation";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24; // 1 day
    const isPrivate = false;

    const result = await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );

    const event = result.logs[0];
    assert.equal(event.event, "CampaignCreated");
    assert.equal(event.args.title, title);
    assert.equal(event.args.goalAmount.toString(), goalAmount);
    assert.equal(
      event.args.startTime.toString(),
      (await web3.eth.getBlock(result.receipt.blockNumber)).timestamp.toString()
    );
  });

  it("should allow users to donate to a campaign", async () => {
    const title = "Donation Campaign";
    const description = "A campaign for donations";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24;
    const isPrivate = false;

    const result = await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );
    const campaignId = 0; // Assuming this is the first campaign created

    const donationAmount = web3.utils.toWei("0.5", "ether");
    const donationResult = await contract.donate(campaignId, {
      from: donor,
      value: donationAmount,
    });

    const donationEvent = donationResult.logs.find(
      (e) => e.event === "DonationReceived"
    );
    assert(donationEvent, "DonationReceived event should be emitted");
    assert.equal(donationEvent.args.donor, donor, "Donor address should match");
    assert.equal(
      donationEvent.args.amount.toString(),
      donationAmount,
      "Donation amount should match"
    );
  });

  it("should allow campaign creators to add expenses after campaign ends", async () => {
    const title = "Expense Campaign";
    const description = "Campaign for adding expenses";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24;
    const isPrivate = false;

    await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );

    const campaignId = 0;
    const donationAmount = web3.utils.toWei("0.5", "ether");
    await contract.donate(campaignId, { from: donor, value: donationAmount });

    // Move time forward so the campaign is ended
    await web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [60 * 60 * 24 + 1],
        id: 0,
      },
      () => {}
    );
    await web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 },
      () => {}
    );

    const expenseAmount = web3.utils.toWei("0.2", "ether");
    const expenseDescription = "Campaign expense for materials"; // Renamed variable

    const expenseResult = await contract.addExpense(
      campaignId,
      expenseAmount,
      expenseDescription,
      { from: owner }
    );

    const expenseEvent = expenseResult.logs.find(
      (e) => e.event === "ExpenseAdded"
    );
    assert(expenseEvent, "ExpenseAdded event should be emitted");
    assert.equal(
      expenseEvent.args.amount.toString(),
      expenseAmount,
      "Expense amount should match"
    );
    assert.equal(
      expenseEvent.args.description,
      expenseDescription,
      "Description should match"
    );
  });

  it("should allow users to see all campaigns", async () => {
    const title = "Test Campaign 1";
    const description = "First test campaign";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24;
    const isPrivate = false;

    await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );

    const allCampaigns = await contract.getAllCampaigns();
    assert.equal(allCampaigns.length, 1, "There should be 1 campaign");
    assert.equal(allCampaigns[0].title, title, "Title should match");
    assert.equal(
      allCampaigns[0].description,
      description,
      "Description should match"
    );
  });

  it("should allow users to fetch campaign details", async () => {
    const title = "Test Campaign";
    const description = "Test campaign for details";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24;
    const isPrivate = false;

    await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );

    const campaignId = 0;
    const campaign = await contract.getCampaign(campaignId);

    assert.equal(campaign.title, title, "Title should match");
    assert.equal(campaign.description, description, "Description should match");
    assert.equal(
      campaign.goalAmount.toString(),
      goalAmount,
      "Goal amount should match"
    );
  });

  it("should allow campaign owners to withdraw funds", async () => {
    const title = "Spending Campaign";
    const description = "A campaign for spending funds";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24;
    const isPrivate = false;

    await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );

    const campaignId = 0;
    const donationAmount = web3.utils.toWei("0.5", "ether");
    await contract.donate(campaignId, { from: donor, value: donationAmount });

    // Move time forward so the campaign is ended
    await web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [60 * 60 * 24 + 1],
        id: 0,
      },
      () => {}
    );
    await web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 },
      () => {}
    );

    const spendAmount = web3.utils.toWei("0.5", "ether");
    const result = await contract.spendFunds(campaignId, spendAmount, {
      from: owner,
    });

    const spendEvent = result.logs.find((e) => e.event === "FundsSpent");
    assert(spendEvent, "FundsSpent event should be emitted");
    assert.equal(
      spendEvent.args.amount.toString(),
      spendAmount,
      "Amount spent should match"
    );
  });

  it("should not allow non-owners to spend funds", async () => {
    const title = "Non-Owner Spending Campaign";
    const description = "Test non-owner spending funds";
    const goalAmount = web3.utils.toWei("3.6", "ether");
    const duration = 60 * 60 * 24;
    const isPrivate = false;

    await contract.createCampaign(
      title,
      description,
      goalAmount,
      duration,
      isPrivate,
      { from: owner }
    );

    const campaignId = 0;
    const donationAmount = web3.utils.toWei("0.5", "ether");
    await contract.donate(campaignId, { from: donor, value: donationAmount });

    // Move time forward to ensure the campaign has ended
    await web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [60 * 60 * 24 + 1],
        id: 0,
      },
      () => {}
    );
    await web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 },
      () => {}
    );

    try {
      await contract.spendFunds(campaignId, donationAmount, { from: donor });
      assert.fail("Non-owners should not be able to spend funds");
    } catch (error) {
      assert(
        error.message.includes("Only the creator can spend the funds"),
        `Expected revert with "Only the creator can spend the funds", got: ${error.message}`
      );
    }
  });
});
