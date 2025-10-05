import React, { useState } from 'react';

const VotingPanel = ({ votes, userVote, onVote, votingActive, loading }) => {
  const [error, setError] = useState('');

  const strategies = [
    {
      name: 'Safe',
      emoji: '🛡️',
      description: 'Conservative strategy with 5% guaranteed yield',
      yield: '5%',
      risk: 'Low',
      color: '#00d2d3'
    },
    {
      name: 'Risky', 
      emoji: '🚀',
      description: 'High-risk, high-reward strategy with 15% potential yield',
      yield: '15%',
      risk: 'High',
      color: '#ff6b6b'
    },
    {
      name: 'Charity',
      emoji: '❤️', 
      description: 'Socially responsible investing with 3% yield + community impact',
      yield: '3%',
      risk: 'Low',
      color: '#ff9ff3'
    }
  ];

  const handleVote = async (strategy) => {
    try {
      setError('');
      await onVote(strategy);
    } catch (err) {
      setError(`Vote failed: ${err.message}`);
    }
  };

  const formatAE = (amount) => {
    return (amount / 1e18).toFixed(4);
  };

  const getTotalVotes = () => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (strategy) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return ((votes[strategy] || 0) / total * 100).toFixed(1);
  };

  return (
    <div className="panel">
      <h3>🗳️ Vote on Strategy</h3>
      
      {!votingActive && (
        <div className="winning-strategy" style={{ marginBottom: '1rem' }}>
          ⚠️ Voting has ended. Strategy has been executed!
        </div>
      )}

      {error && (
        <div className="error-banner" style={{ margin: '0 0 1rem 0' }}>
          {error}
        </div>
      )}

      {userVote && votingActive && (
        <div style={{ 
          background: 'rgba(255, 215, 0, 0.2)', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <strong>Your current vote:</strong> {userVote}
          <br />
          <small>You can change your vote anytime before execution</small>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {strategies.map((strategy) => {
          const isSelected = userVote === strategy.name;
          const voteCount = votes[strategy.name] || 0;
          const percentage = getVotePercentage(strategy.name);
          
          return (
            <div 
              key={strategy.name}
              style={{
                background: isSelected ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: isSelected ? '2px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
                    {strategy.emoji} {strategy.name} Strategy
                  </h4>
                  <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    {strategy.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                    <span><strong>Expected Yield:</strong> {strategy.yield}</span>
                    <span><strong>Risk Level:</strong> {strategy.risk}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: strategy.color }}>
                    {formatAE(voteCount)} AE
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {percentage}%
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="vote-progress" style={{ flex: 1, marginRight: '1rem' }}>
                  <div 
                    className="vote-progress-fill" 
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${strategy.color}, ${strategy.color}aa)`
                    }}
                  />
                </div>
                
                <button
                  className="button"
                  onClick={() => handleVote(strategy.name)}
                  disabled={loading || !votingActive}
                  style={{ 
                    minWidth: '80px',
                    background: isSelected ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : undefined,
                    color: isSelected ? '#000' : undefined
                  }}
                >
                  {loading ? '...' : isSelected ? '✓ Voted' : 'Vote'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        padding: '1rem', 
        borderRadius: '8px', 
        fontSize: '0.9rem' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>📋 Voting Rules:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>Your voting power equals your deposit amount</li>
          <li>You can change your vote anytime before execution</li>
          <li>The strategy with the most AE votes wins</li>
          <li>All depositors earn yield based on the winning strategy</li>
        </ul>
      </div>
    </div>
  );
};

export default VotingPanel;
