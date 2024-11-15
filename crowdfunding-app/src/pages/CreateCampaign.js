import React, { useState } from "react";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config";

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    duration: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!window.ethereum) throw new Error("MetaMask is not installed.");

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const { title, description, goal, duration, isPrivate } = formData;

      // Validate input fields
      if (!title || !description || !goal || !duration) {
        throw new Error("All fields are required.");
      }

      // Convert goal to Wei and duration to seconds
      const goalInWei = web3.utils.toWei(goal, "ether");
      const durationInSeconds = parseInt(duration, 10) * 60 * 60; // Assuming input is in hours

      // Interact with the contract
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      await contract.methods
        .createCampaign(
          title,
          description,
          goalInWei,
          durationInSeconds,
          isPrivate
        )
        .send({ from: accounts[0] });

      setSuccess("Campaign created successfully!");
      setFormData({
        title: "",
        description: "",
        goal: "",
        duration: "",
        isPrivate: false,
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Campaign</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter campaign title"
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter campaign description"
            required
          />
        </div>
        <div>
          <label>Goal (ETH):</label>
          <input
            type="number"
            name="goal"
            value={formData.goal}
            onChange={handleInputChange}
            placeholder="Enter funding goal in ETH"
            required
          />
        </div>
        <div>
          <label>Duration (Hours):</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="Enter campaign duration in hours"
            required
          />
        </div>
        <div>
          <label>Private Campaign:</label>
          <input
            type="checkbox"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) =>
              setFormData({ ...formData, isPrivate: e.target.checked })
            }
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
