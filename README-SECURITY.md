# Security Guidelines

## 🔒 Private Information Protection

This project contains configuration for testnet deployment. **NEVER** commit private keys, secret keys, or real account credentials to git.

## Environment Variables

Copy .env.example to .env and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- AE_SECRET_KEY - Your Aeternity secret key (starts with sk_)
- CONTRACT_ADDRESS - Your deployed contract address (starts with ct_)

## Setup Instructions

### 1. Convert Your Private Key (if needed)

```bash
node convert-key.js <your_hex_private_key>
```

This will output your sk_ formatted secret key. **Keep this secret!**

### 2. Set Environment Variable

**PowerShell:**
```powershell
$nv:AE_SECRET_KEY="sk_..."
```

**Linux/Mac:**
```bash
export AE_SECRET_KEY="sk_..."
```

### 3. Deploy Contract

```bash
node deploy-working.js
```

### 4. Update Frontend

After deployment, update the CONTRACT_ADDRESS constant in:
- rontend/src/App.jsx (line ~12)

## What's Protected

The following are excluded from git (see .gitignore):
- .env files
- 	est-account.json
- Private key files (*.key, *.pem)
- 
ode_modules/

## Testnet Faucet

Get free testnet AE tokens: https://faucet.aepps.com/

## Notes

- This project uses **Aeternity Testnet** for development
- Contract address in App.jsx can be public (it's just a testnet contract)
- **NEVER** use testnet keys on mainnet
- **NEVER** commit any private keys or secret keys to version control
