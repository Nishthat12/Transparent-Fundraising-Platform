import React, { useState } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { contractABI, contractAddress } from "../config";
import "./CreateCampaign.css"; // For additional custom styles

const CreateCampaign = () => {
  const navigate = useNavigate();
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
    <div className="create-campaign-container container">
      <div className="mb-4">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/home")} // Navigates back to homepage
        >
          ← Back to Homepage
        </button>
      </div>
      <h1 className="text-center my-4">Create a New Campaign</h1>
      {error && <div className="alert alert-danger text-center">{error}</div>}
      {success && (
        <div className="alert alert-success text-center">{success}</div>
      )}
      <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-light">
        <div className="mb-3">
          <label className="form-label">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="E.g., Save the Forests"
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide details about your campaign..."
            className="form-control"
            rows="4"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Goal (ETH):</label>
          <input
            type="number"
            name="goal"
            value={formData.goal}
            onChange={handleInputChange}
            placeholder="E.g., 10 ETH"
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Duration (Hours):</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="E.g., 72 (3 days)"
            className="form-control"
            required
          />
        </div>
        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) =>
              setFormData({ ...formData, isPrivate: e.target.checked })
            }
            className="form-check-input"
          />
          <label className="form-check-label">Private Campaign</label>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            "Create Campaign"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
