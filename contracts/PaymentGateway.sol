// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface to interact with USDC (ERC20 token)
interface IERC20 {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

contract PaymentGateway {
    address public owner;           // Contract owner (you)
    address public treasury;        // Where funds go
    IERC20 public usdcToken;        // USDC contract reference
        // Event emitted when payment is received
    event PaymentReceived(
        address indexed payer,      // Who paid
        uint256 amount,             // How much (in USDC, 6 decimals)
        string ref,           // Invoice/Order ID
        uint256 timestamp           // When
    );

    constructor(address _usdcToken, address _treasury) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
    }
        // Main payment function
    function pay(uint256 amount, string calldata ref) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer USDC from user to treasury
        require(
            usdcToken.transferFrom(msg.sender, treasury, amount),
            "USDC transfer failed"
        );
        
        // Emit event for backend to listen
        emit PaymentReceived(msg.sender, amount, ref, block.timestamp);
    }
    // Update treasury address (only owner)
    function updateTreasury(address newTreasury) external {
        require(msg.sender == owner, "Only owner can update treasury");
        treasury = newTreasury;
    }
}