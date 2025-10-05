// convert-key.js
// Convert raw hex private key to sk_ format

const { encode, MemoryAccount } = require('@aeternity/aepp-sdk');

// Get private key from command line argument or environment variable
const rawPrivateKey = process.argv[2] || process.env.RAW_PRIVATE_KEY;

if (!rawPrivateKey) {
  console.error('❌ Error: No private key provided!\n');
  console.log('Usage:');
  console.log('  node convert-key.js <your_raw_hex_private_key>');
  console.log('\nOr set environment variable:');
  console.log('  $nv:RAW_PRIVATE_KEY="your_raw_hex_key"');
  console.log('  node convert-key.js\n');
  console.log('⚠️  NEVER commit private keys to git!\n');
  process.exit(1);
}

console.log('🔑 Converting private key to secret key format...\n');

try {
  // Convert hex string to Buffer
  const privateKeyBuffer = Buffer.from(rawPrivateKey, 'hex');
  
  // Encode to sk_ format using the correct encoding
  const secretKey = encode(privateKeyBuffer, 'sk');
  
  console.log('✅ Conversion successful!\n');
  console.log('═'.repeat(70));
  console.log('Secret Key (sk_):     ', secretKey);
  console.log('═'.repeat(70));
  
  // Verify by creating an account
  console.log('\n🔍 Verifying...');
  const account = new MemoryAccount(secretKey);
  console.log('✓ Account address:', account.address);
  console.log('✓ Secret key is valid!\n');
  
  console.log('📝 NEXT STEPS:\n');
  console.log('1. Fund your address at: https://faucet.aepps.com/');
  console.log('   Address to fund:', account.address);
  console.log('\n2. Set environment variable:');
  console.log('   $nv:AE_SECRET_KEY="' + secretKey + '"');
  console.log('\n3. Deploy:');
  console.log('   node deploy-working.js\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
