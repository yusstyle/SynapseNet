import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./index.css";

// Contract ABI - Replace with your actual ABI
const SYNAPSE_NET_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "JobAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "resultHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payout",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "JobCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bounty",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "datasetHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "JobCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "nodeId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "nodeAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "gpuSpecs",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "NodeRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PaymentWithdrawn",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      }
    ],
    "name": "assignJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_resultHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_nonce",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_signature",
        "type": "bytes"
      }
    ],
    "name": "completeJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_datasetHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_modelConfig",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_maxComputeTime",
        "type": "uint256"
      }
    ],
    "name": "createComputeJob",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deregisterNode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      }
    ],
    "name": "emergencyRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveJobs",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "client",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "datasetHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "modelConfig",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "bounty",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxComputeTime",
            "type": "uint256"
          },
          {
            "internalType": "enum SynapseNet.JobStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assignedNode",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "resultHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct SynapseNet.ComputeJob[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      }
    ],
    "name": "getJob",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "client",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "datasetHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "modelConfig",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "bounty",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxComputeTime",
            "type": "uint256"
          },
          {
            "internalType": "enum SynapseNet.JobStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assignedNode",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "resultHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct SynapseNet.ComputeJob",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_nodeAddress",
        "type": "address"
      }
    ],
    "name": "getNode",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "nodeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "nodeAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "gpuSpecs",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "performanceScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalJobsCompleted",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalEarned",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "registrationTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct SynapseNet.ComputeNode",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jobCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "jobs",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "datasetHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "modelConfig",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "bounty",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxComputeTime",
        "type": "uint256"
      },
      {
        "internalType": "enum SynapseNet.JobStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "assignedNode",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "resultHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nodeCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nodes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "nodeId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "nodeAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "gpuSpecs",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "performanceScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalJobsCompleted",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalEarned",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "registrationTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeBps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_gpuSpecs",
        "type": "string"
      }
    ],
    "name": "registerNode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newFeeBps",
        "type": "uint256"
      }
    ],
    "name": "setPlatformFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "usedNonces",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// MULTI-CHAIN CONTRACT ADDRESSES
const CONTRACT_ADDRESSES = {
  // BlockDAG Networks
  "0x1": "0xB9Dc410368Ab19AdA1574b5d8DCB25a1367A0157", // Ethereum Mainnet (if using compatible address)
  "0xaa36a7": "0xB9Dc410368Ab19AdA1574b5d8DCB25a1367A0157", // Sepolia Testnet
  // Add more BlockDAG chain IDs as you discover them
};

// Network names for display
const NETWORK_NAMES = {
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia Testnet", 
  "0x5": "Goerli Testnet",
  "0x539": "Localhost",
  // Add BlockDAG network names when you get the chain IDs
};

const CONTRACT_ADDRESS = "0xB9Dc410368Ab19AdA1574b5d8DCB25a1367A0157";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [activeJobs, setActiveJobs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [nodeInfo, setNodeInfo] = useState(null);
  const [currentChainId, setCurrentChainId] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");

  useEffect(() => {
    checkWalletConnection();
    setupNetworkListeners();
  }, []);

  const setupNetworkListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        setCurrentChainId(chainId);
        setCurrentNetwork(NETWORK_NAMES[chainId] || `Network (${chainId})`);
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount("");
        } else {
          setAccount(accounts[0]);
        }
      });
    }
  };

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16);
        
        setCurrentChainId(chainId);
        setCurrentNetwork(NETWORK_NAMES[chainId] || `Network (${chainId})`);

        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.log("No wallet connected or network error:", error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        alert("Please install MetaMask to use SynapseNet!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      const network = await provider.getNetwork();
      const chainId = "0x" + network.chainId.toString(16);
      
      setAccount(address);
      setIsConnected(true);
      setCurrentChainId(chainId);
      setCurrentNetwork(NETWORK_NAMES[chainId] || `Network (${chainId})`);

      // Auto-detect and use contract for current network
      const contractAddress = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESS;
      if (contractAddress && contractAddress !== "YOUR_CONTRACT_ADDRESS") {
        const synapseContract = new ethers.Contract(contractAddress, SYNAPSE_NET_ABI, signer);
        setContract(synapseContract);
        await loadActiveJobs(synapseContract);
      }

    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveJobs = async (contractInstance = contract) => {
    if (!contractInstance) {
      setActiveJobs([
        {
          jobId: ethers.BigNumber.from(1),
          bounty: ethers.utils.parseEther("0.1"),
          datasetHash: "QmXyZ123...",
          modelConfig: '{"model": "resnet50", "epochs": 10}',
          status: 0,
          client: "0x1234...5678"
        },
        {
          jobId: ethers.BigNumber.from(2),
          bounty: ethers.utils.parseEther("0.25"),
          datasetHash: "QmAbC456...",
          modelConfig: '{"model": "gpt2", "steps": 1000}',
          status: 0,
          client: "0x8765...4321"
        }
      ]);
      return;
    }
    
    try {
      const jobs = await contractInstance.getActiveJobs();
      setActiveJobs(jobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setActiveJobs([
        {
          jobId: ethers.BigNumber.from(1),
          bounty: ethers.utils.parseEther("0.1"),
          datasetHash: "QmXyZ123...",
          modelConfig: '{"model": "resnet50", "epochs": 10}',
          status: 0,
          client: "0x1234...5678"
        }
      ]);
    }
  };

  const registerNode = async () => {
    if (!contract) {
      alert(`No contract deployed on ${currentNetwork}. Please switch to a supported network.`);
      return;
    }
    
    try {
      setIsLoading(true);
      const gpuSpecs = "RTX 4090, 24GB VRAM";
      const tx = await contract.registerNode(gpuSpecs);
      await tx.wait();
      alert(`🎉 Node registered successfully on ${currentNetwork}!`);
      setNodeInfo({ isRegistered: true, gpuSpecs });
    } catch (error) {
      console.error("Error registering node:", error);
      alert(`Error registering node on ${currentNetwork}. Check console for details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const createJob = async () => {
    if (!contract) {
      alert(`No contract deployed on ${currentNetwork}. Please switch to a supported network.`);
      return;
    }

    try {
      setIsLoading(true);
      const datasetHash = "QmXyZ123abc" + Date.now();
      const modelConfig = '{"model": "resnet50", "epochs": 10, "batch_size": 32}';
      const maxComputeTime = 3600;
      const bounty = ethers.utils.parseEther("0.1");

      const tx = await contract.createComputeJob(datasetHash, modelConfig, maxComputeTime, { value: bounty });
      await tx.wait();
      alert(`🚀 AI Job created successfully on ${currentNetwork}!`);
      await loadActiveJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      alert(`Error creating job on ${currentNetwork}. Make sure you have enough tokens for bounty and gas.`);
    } finally {
      setIsLoading(false);
    }
  };

  const assignJob = async (jobId) => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const tx = await contract.assignJob(jobId);
      await tx.wait();
      alert(`✅ Job #${jobId} assigned to you on ${currentNetwork}!`);
      await loadActiveJobs();
    } catch (error) {
      console.error("Error assigning job:", error);
      alert("Error assigning job. It might already be taken or you're not registered as a node.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Assigned";
      case 2: return "Completed";
      case 3: return "Failed";
      case 4: return "Cancelled";
      default: return "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return "status-pending";
      case 1: return "status-assigned";
      case 2: return "status-completed";
      case 3: return "status-failed";
      case 4: return "status-failed";
      default: return "status-pending";
    }
  };

  return (
    <div className="container">
      <header className="header">
        <nav className="nav">
          <div className="logo">
            <span className="logo-icon">🧠</span>
            SynapseNet
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {isConnected ? (
              <>
                <div className="connection-status connected">
                  <div style={{ width: "8px", height: "8px", background: "var(--success)", borderRadius: "50%" }}></div>
                  {currentNetwork} | {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                
                {!contract && (
                  <div className="connection-status disconnected" style={{ background: "rgba(245, 158, 11, 0.2)", color: "var(--warning)" }}>
                    ⚠️ Demo Mode
                  </div>
                )}
              </>
            ) : (
              <div className="connection-status disconnected">
                <div style={{ width: "8px", height: "8px", background: "var(--error)", borderRadius: "50%" }}></div>
                Not Connected
              </div>
            )}
            
            {!isConnected && (
              <button className="btn" onClick={connectWallet} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : "Connect Wallet"}
              </button>
            )}
          </div>
        </nav>
      </header>

      <main>
        {!isConnected ? (
          <div className="welcome-section fade-in">
            <h1 className="welcome-title">Decentralized AI Compute Marketplace</h1>
            <p className="welcome-subtitle">
              Rent out your GPU power or access distributed computing for AI model training
            </p>
            
            <div className="hero-buttons">
              <button className="btn" onClick={connectWallet} style={{ padding: "16px 32px", fontSize: "16px" }}>
                🚀 Connect Wallet to Start
              </button>
              <button className="btn btn-secondary" style={{ padding: "16px 32px", fontSize: "16px" }}>
                📚 Learn More
              </button>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">High Performance</h3>
                <p className="feature-description">
                  Leverage distributed GPU networks for faster AI model training and inference
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔗</div>
                <h3 className="feature-title">Blockchain Powered</h3>
                <p className="feature-description">
                  Built on BlockDAG technology for maximum scalability and minimal fees
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3 className="feature-title">Earn Crypto</h3>
                <p className="feature-description">
                  Monetize your idle GPU power by participating in the AI compute network
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            <nav style={{ display: "flex", gap: "1rem", margin: "2rem 0", flexWrap: "wrap" }}>
              <button 
                className={`btn ${currentView === "dashboard" ? "" : "btn-secondary"}`}
                onClick={() => setCurrentView("dashboard")}
              >
                📊 Dashboard
              </button>
              <button 
                className={`btn ${currentView === "createJob" ? "" : "btn-secondary"}`}
                onClick={() => setCurrentView("createJob")}
              >
                🚀 Create Job
              </button>
              <button 
                className={`btn ${currentView === "nodes" ? "" : "btn-secondary"}`}
                onClick={() => setCurrentView("nodes")}
              >
                💻 My Node
              </button>
              <button className="btn btn-secondary" onClick={registerNode} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : "🔧 Register Node"}
              </button>
            </nav>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{activeJobs.length}</div>
                <div className="stat-label">Active Jobs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{nodeInfo ? "1" : "0"}</div>
                <div className="stat-label">Your Nodes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0.00 ETH</div>
                <div className="stat-label">Total Earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">100%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>

            {currentView === "dashboard" && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">🔄 Active AI Compute Jobs</h2>
                  <button className="btn btn-small" onClick={() => loadActiveJobs()}>
                    🔄 Refresh
                  </button>
                </div>
                
                {activeJobs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
                    <h3>No active jobs found</h3>
                    <p>Be the first to create an AI compute job or check back later!</p>
                    <button className="btn" onClick={() => setCurrentView("createJob")} style={{ marginTop: "1rem" }}>
                      Create First Job
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-2">
                    {activeJobs.map((job) => (
                      <div key={job.jobId.toString()} className="card job-card">
                        <div className="job-header">
                          <span className="job-id">Job #{job.jobId.toString()}</span>
                          <span className="job-bounty">{ethers.utils.formatEther(job.bounty)} ETH</span>
                        </div>
                        
                        <div className="job-meta">
                          <span className={getStatusClass(job.status)}>
                            {getStatusText(job.status)}
                          </span>
                          <span>⏱️ 1 hour</span>
                        </div>
                        
                        <p><strong>Dataset:</strong> {job.datasetHash}</p>
                        <p><strong>Model:</strong> {JSON.parse(job.modelConfig).model}</p>
                        
                        <div className="job-actions">
                          <button 
                            className="btn btn-small" 
                            onClick={() => assignJob(job.jobId)}
                            disabled={isLoading || job.status !== 0}
                          >
                            {isLoading ? <div className="spinner"></div> : "✅ Accept Job"}
                          </button>
                          <button className="btn btn-small btn-secondary">
                            📋 Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === "createJob" && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">🚀 Create New AI Compute Job</h2>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Dataset Hash (IPFS)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="QmXyZ123..." 
                    defaultValue="QmXyZ123abc"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Model Configuration</label>
                  <textarea 
                    className="form-input" 
                    rows="4"
                    placeholder='{"model": "resnet50", "epochs": 10}'
                    defaultValue='{"model": "resnet50", "epochs": 10, "batch_size": 32}'
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bounty Amount (ETH)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="0.1" 
                    defaultValue="0.1"
                  />
                </div>
                
                <button 
                  className="btn" 
                  onClick={createJob}
                  disabled={isLoading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {isLoading ? <div className="spinner"></div> : "🚀 Create AI Job (0.1 ETH)"}
                </button>
                
                <p style={{ marginTop: "1rem", textAlign: "center", color: "var(--gray)", fontSize: "0.875rem" }}>
                  💡 This will create a sample ResNet-50 training job with a 0.1 ETH bounty
                </p>
              </div>
            )}

            {currentView === "nodes" && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">💻 Node Management</h2>
                </div>
                
                {nodeInfo ? (
                  <div>
                    <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
                      <h3 style={{ color: "var(--success)", marginBottom: "0.5rem" }}>✅ Node Registered</h3>
                      <p><strong>GPU Specs:</strong> {nodeInfo.gpuSpecs}</p>
                      <p><strong>Status:</strong> <span className="status-completed">Active</span></p>
                      <p><strong>Registration Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div className="grid grid-3">
                      <div className="stat-card">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Jobs Completed</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">100%</div>
                        <div className="stat-label">Success Rate</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">0 ETH</div>
                        <div className="stat-label">Total Earned</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "2rem" }}>
                      <button className="btn btn-error">
                        🚫 Deregister Node
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--gray)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💻</div>
                    <h3>No Node Registered</h3>
                    <p>Register your GPU node to start earning from AI compute jobs</p>
                    <button className="btn" onClick={registerNode} disabled={isLoading} style={{ marginTop: "1rem" }}>
                      {isLoading ? <div className="spinner"></div> : "🔧 Register Your Node"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "3rem 0", color: "var(--gray)", marginTop: "3rem" }}>
        <p>🧠 SynapseNet - Powered by BlockDAG Technology</p>
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Contract: 0xB9Dc...A0157 | Network: {currentNetwork}
        </p>
      </footer>
    </div>
  );
}

export default App;