# 🌟 Community-Governed Yield Pool

A decentralized application (DApp) built for the Aeternity hackathon that allows users to deposit AE tokens into a shared pool, vote on yield strategies, and earn returns based on community decisions.

## 🚀 Features

- **Deposit & Withdraw**: Users can deposit and withdraw AE tokens from the shared pool
- **Weighted Voting**: Vote on three strategies (Safe, Risky, Charity) with voting power proportional to deposits
- **Strategy Execution**: Execute the winning strategy to distribute mock yield to all participants
- **Real-time Updates**: Live vote tallies and pool statistics
- **Superhero Wallet Integration**: Seamless wallet connection and transaction signing

## 📋 Available Strategies

1. **🛡️ Safe Strategy** - 5% guaranteed yield, low risk
2. **🚀 Risky Strategy** - 15% potential yield, high risk  
3. **❤️ Charity Strategy** - 3% yield + community impact, low risk

## 🛠️ Technology Stack

- **Smart Contract**: Sophia (Aeternity's smart contract language)
- **Frontend**: React + Vite
- **Wallet**: Superhero Wallet integration
- **SDK**: @aeternity/aepp-sdk

## 📁 Project Structure

`
├── contracts/
│   └── YieldPool.aes          # Sophia smart contract
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── WalletConnection.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DepositWithdraw.jsx
│   │   │   ├── VotingPanel.jsx
│   │   │   └── ExecuteStrategy.jsx
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css           # Styling
│   │   └── main.jsx          # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
`

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Superhero Wallet browser extension
- AE testnet tokens

### 1. Install Dependencies

`ash
cd frontend
npm install
`

### 2. Deploy Smart Contract

1. Compile the Sophia contract (contracts/YieldPool.aes)
2. Deploy to Aeternity testnet
3. Update CONTRACT_ADDRESS in rontend/src/App.jsx

### 3. Run Frontend

`ash
npm run dev
`

The app will be available at http://localhost:3000

## 📖 Smart Contract Functions

### Core Functions

- deposit() - Deposit AE tokens to the pool (payable)
- withdraw(amount) - Withdraw tokens from your balance
- ote(strategy) - Vote for a yield strategy
- xecute_strategy() - Execute winning strategy and distribute yield
- eset_voting() - Reset voting for new round (owner only)

### View Functions

- get_total_deposits() - Get total pool deposits
- get_user_balance(address) - Get user's balance
- get_votes() - Get current vote counts
- get_user_vote_choice(address) - Get user's vote choice
- is_voting_active() - Check if voting is active

## 🎮 Demo Flow

1. **Connect Wallet**: Connect Superhero Wallet or use demo mode
2. **Deposit Tokens**: Add AE to the shared pool
3. **Vote on Strategy**: Choose between Safe, Risky, or Charity strategies
4. **View Live Results**: Watch real-time vote tallies and pool statistics
5. **Execute Strategy**: Trigger execution when ready (owner only)
6. **Earn Yield**: Receive distributed yield based on winning strategy

## 🔧 Configuration

### Contract Deployment

To deploy the smart contract:

1. Use Aeternity Studio or CLI tools
2. Compile contracts/YieldPool.aes
3. Deploy to testnet
4. Update contract address in frontend

### Frontend Configuration

Update these values in rontend/src/App.jsx:

`javascript
// Replace with your deployed contract address
const CONTRACT_ADDRESS = 'ct_your_contract_address_here';

// Testnet node (default)
const node = new Node('https://testnet.aeternity.io');
`

## 🎯 Hackathon MVP Goals

✅ **Simple deposit/withdraw functionality**  
✅ **Stake-weighted voting system**  
✅ **Mock yield strategies for demonstration**  
✅ **Frontend AEpp with Superhero Wallet integration**  
✅ **Live vote tally and pool statistics**  
✅ **Strategy execution and yield distribution**  

## 🚀 Future Enhancements

- **Quadratic Voting**: Implement quadratic voting for more democratic decisions
- **Real DeFi Integration**: Connect to actual yield farming protocols
- **Strategy Simulation**: Add risk/reward visualization charts
- **Community Leaderboard**: Track top contributors and voters
- **Animated Yield Growth**: Visual yield distribution animations
- **Multi-round Governance**: Support for multiple voting rounds

## 🤝 Contributing

This is a hackathon MVP project. Feel free to fork and extend!

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Aeternity Documentation](https://docs.aeternity.com/)
- [Superhero Wallet](https://superhero.com/wallet)
- [Sophia Language](https://docs.aeternity.com/sophia/)
- [AEpp SDK](https://docs.aeternity.com/aepp-sdk-js/)

---

Built with ❤️ for the Aeternity Hackathon
