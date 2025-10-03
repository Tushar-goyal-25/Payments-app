export const paymentGatewayABI = [
    {
        "inputs": [
            {
                "internalType": "address", name: "_usdcToken", type: "address"
            },
            {"internalType": "address", name: "_treasury", type: "address"
            },            

        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {indexed: true, internalType: "address", name: "payer", type: "address"},
            {indexed: false, internalType: "uint256", name: "amount", type: "uint256"},
            {indexed: false, internalType: "string", name: "reference", type: "string"},
            {indexed: false, internalType: "uint256", name: "timestamp", type: "uint256"}
        ],
        "name": "PaymentReceived",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {internalType: "address", name: "", type: "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
      {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "reference", type: "string" }
    ],
    name: "pay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
        type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "newTreasury", type: "address" }],
    name: "updateTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "usdcToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "usdcToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;