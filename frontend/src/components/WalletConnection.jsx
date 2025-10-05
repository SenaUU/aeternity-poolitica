import React from 'react';

const WalletConnection = ({ onConnect, loading }) => {
  return (
    <div className="wallet-connection">
      <h2>Connect Your Superhero Wallet</h2>
      <p>
        Connect your Superhero Wallet to access your AE tokens and interact with the Community-Governed Yield Pool!
      </p>
      <button 
        className="connect-button" 
        onClick={onConnect}
        disabled={loading}
      >
        {loading ? 'Connecting to Your Wallet...' : 'Connect Your Superhero Wallet'}
      </button>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
        <p>Don't have Superhero Wallet? <a href="https://superhero.com/wallet" target="_blank" rel="noopener noreferrer" style={{color: '#ffd700'}}>Download here</a></p>
        <p>Make sure your Superhero Wallet is unlocked and ready to connect.</p>
      </div>
    </div>
  );
};

export default WalletConnection;
