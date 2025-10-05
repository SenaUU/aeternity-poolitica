# Deployment Guide for Community-Governed Yield Pool

## Option 1: Using AEproject CLI (Recommended for Hackathon)

AEproject is already installed globally on your system. Here's how to use it:

### Step 1: Initialize AEproject
`ash
# Create a new aeproject in a subdirectory
mkdir aeproject-deploy
cd aeproject-deploy
aeproject init
`

### Step 2: Copy Contract
`ash
# Copy your contract to the contracts folder
cp ../contracts/YieldPool.aes ./contracts/
`

### Step 3: Deploy
`ash
# Deploy to testnet
aeproject deploy -n testnet

# Or deploy locally for testing
aeproject node
aeproject deploy
`

The contract address will be displayed after successful deployment.

---

## Option 2: Using the Deploy Script

If you prefer using the Node.js script:

### Step 1: Get a Secret Key

**Option A - Generate New Account:**
`javascript
// Run this in Node.js console
const crypto = require('crypto');
const { encode } = require('@aeternity/aepp-sdk');
const privateKey = crypto.randomBytes(32);
const secretKey = encode(privateKey, 'sk');
console.log('Secret Key:', secretKey);
`

**Option B - Use Superhero Wallet:**
1. Open Superhero Wallet
2. Go to Settings → Security → Show Secret Key
3. Copy your secret key (starts with 'sk_')

### Step 2: Fund Your Account
1. Go to https://faucet.aepps.com/
2. Enter your account address
3. Request testnet AE tokens

### Step 3: Update deploy.js
Replace this line in deploy.js:
`javascript
const secretKey = 'YOUR_SECRET_KEY_HERE';
`
With your actual secret key:
`javascript
const secretKey = 'sk_your_actual_secret_key_here';
`

### Step 4: Run Deployment
`ash
node deploy.js
`

---

## Option 3: Quick Test Deployment (No Real Wallet Needed)

For quick hackathon testing, you can use a temporary account:

### Create quick-deploy.js:
`javascript
const { AeSdk, Node, MemoryAccount } = require('@aeternity/aepp-sdk');
const fs = require('fs');

async function quickDeploy() {
  // Use a test account (this won't have funds, just for local testing)
  const testSecretKey = 'sk_2CuofqWZHrABCrM7GY95YSQn8PyFvKQadnvFnpwhjUnDCFAWmf';
  
  const node = new Node('https://testnet.aeternity.io');
  const account = new MemoryAccount(testSecretKey);
  
  const aeSdk = new AeSdk({
    nodes: [{ name: 'testnet', instance: node }],
    accounts: [account],
    compilerUrl: 'https://compiler.aepps.com'
  });

  console.log('Deployer:', account.address);
  
  const contractSource = fs.readFileSync('./contracts/YieldPool.aes', 'utf8');
  const contract = await aeSdk.initializeContract({ sourceCode: contractSource });
  const deployResult = await contract.([]);
  
  console.log('Contract Address:', deployResult.address);
}

quickDeploy().catch(console.error);
`

---

## Troubleshooting

### Error: "Insufficient balance"
- Fund your account at https://faucet.aepps.com/

### Error: "Cannot find module"
- Run: 
pm install @aeternity/aepp-sdk

### Error: "Compilation failed"
- Check Sophia syntax in contracts/YieldPool.aes
- Ensure @compiler >= 6 is at the top of the contract

---

## After Successful Deployment

1. **Copy the contract address** (starts with 'ct_')
2. **Update frontend/src/App.jsx**:
   `javascript
   const CONTRACT_ADDRESS = 'ct_your_deployed_contract_address';
   `
3. **Run the frontend**:
   `ash
   cd frontend
   npm install
   npm run dev
   `

---

## Testing the Contract

After deployment, test these functions:
- ✅ Connect wallet
- ✅ Deposit AE
- ✅ Vote on strategy
- ✅ Check vote tallies
- ✅ Execute strategy (owner only)
- ✅ Withdraw funds

Good luck with your hackathon! 🚀
