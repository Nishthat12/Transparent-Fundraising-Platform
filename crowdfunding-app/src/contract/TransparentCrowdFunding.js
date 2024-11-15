import Web3 from "web3";
import { contractABI, contractAddress } from "../config";

const web3 = new Web3(window.ethereum); // Connect to MetaMask
export const contract = new web3.eth.Contract(contractABI, contractAddress);
