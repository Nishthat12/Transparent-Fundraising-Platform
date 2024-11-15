import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox,
} from "mdb-react-ui-kit";

const LoginPage = ({ connectWallet }) => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      // If the wallet is connected successfully, navigate to the homepage
      navigate("/home");
    } catch (err) {
      setError(
        "MetaMask connection failed. Please ensure MetaMask is installed."
      );
      console.error(err);
    }
  };

  return (
    // <div>
    //   <h1>Login with MetaMask</h1>
    //   <button onClick={handleConnectWallet}>Connect Wallet</button>
    //   {error && <p style={{ color: "red" }}>{error}</p>}
    // </div>
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow className="d-flex align-items-center vh-100">
        <MDBCol col="10" md="6" className="d-flex justify-content-center">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            className="img-fluid"
            alt="Sample image"
          />
        </MDBCol>

        <MDBCol col="4" md="6">
          <h1
            style={{
              fontSize: "4rem", // Adjust size as desired
              fontWeight: "bold", // Make text bold
              textAlign: "center", // Center-align the text
              marginBottom: "10rem",
            }}
          >
            Transparent Fundraising
          </h1>
          <div className="d-flex flex-column align-items-center justify-content-center h-100">
            <p
              className="mb-3"
              style={{
                fontSize: "2rem", // Adjust size as desired
                fontWeight: "bold", // Make text bold
                textAlign: "center", // Center-align the text
              }}
            >
              Sign in with Metamask
            </p>
            <MDBBtn className="mb-4 w-100" onClick={handleConnectWallet}>
              Login
            </MDBBtn>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default LoginPage;
