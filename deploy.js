// deploy.js
// Working deployment script for SDK v14.1.0

// Load environment variables from .env file
require('dotenv').config();

const { AeSdk, Node, MemoryAccount, CompilerHttp } = require('@aeternity/aepp-sdk');
const fs = require('fs');

async function deployContract() {
  try {
    console.log('🚀 Starting deployment (SDK v14)...\n');
    
    // Read secret key from environment variable
    const SECRET_KEY = process.env.AE_SECRET_KEY;
    
    if (!SECRET_KEY) {
      console.error('❌ Error: AE_SECRET_KEY environment variable not set!');
      console.log('\n📝 Set it with:');
      console.log('   $env:AE_SECRET_KEY="your_secret_key_here"');
      console.log('\nOr create a .env file (see .env.example)\n');
      process.exit(1);
    }
    
    const account = new MemoryAccount(SECRET_KEY);
    console.log('📍 Deployer Address:', account.address);
    console.log('   Fund this at: https://faucet.aepps.com/\n');
    
    const node = new Node('https://testnet.aeternity.io');
    const compiler = new CompilerHttp('https://v8.compiler.aepps.com');
    
    const aeSdk = new AeSdk({
      onCompiler: compiler,
      nodes: [{ name: 'testnet', instance: node }]
    });
    
    aeSdk.addAccount(account, { select: true });

    // Check balance
    try {
      const balance = await aeSdk.getBalance(account.address);
      const balanceAE = (BigInt(balance) / BigInt(1e18)).toString();
      console.log('💰 Balance:', balanceAE, 'AE\n');
      
      if (balance === '0') {
        console.log('⚠️  Zero balance! Get testnet AE from: https://faucet.aepps.com/\n');
      }
    } catch (e) {
      console.log('⚠️  Could not check balance\n');
    }

    const contractSource = fs.readFileSync('./contracts/YieldPool.aes', 'utf8');
    console.log('📄 Compiling contract...');
    
    const Contract = require('@aeternity/aepp-sdk').Contract;
    const contract = await Contract.initialize({ ...aeSdk.getContext(), sourceCode: contractSource });
    
    console.log('✅ Compiled');
    console.log('📤 Deploying...\n');
    
    const deployInfo = await contract.init([]);
    
    console.log('🎉 SUCCESS!\n');
    console.log('═'.repeat(70));
    console.log('Contract Address:', deployInfo.address);
    console.log('═'.repeat(70));
    
    console.log('\n🧪 Testing...\n');
    
    const totalDeposits = await contract.get_total_deposits();
    console.log('✓ Total deposits:', totalDeposits.decodedResult);
    
    const strategies = await contract.get_available_strategies();
    console.log('✓ Strategies:', strategies.decodedResult);
    
    console.log('\n✅ All tests passed!');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Copy contract address:', deployInfo.address);
    console.log('2. Update frontend/src/App.jsx CONTRACT_ADDRESS constant');
    console.log('3. cd frontend && npm install && npm run dev\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message && error.message.includes('Insufficient balance')) {
      console.log('\n💡 Get testnet AE: https://faucet.aepps.com/');
    }
  }
}

deployContract();
