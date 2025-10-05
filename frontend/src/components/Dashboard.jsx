import React from 'react';

const Dashboard = ({ totalDeposits, userBalance, votes, account }) => {
  const formatAE = (amount) => {
    return (amount / 1e18).toFixed(4);
  };

  const getTotalVotes = () => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

  const getWinningStrategy = () => {
    let maxVotes = 0;
    let winner = 'None';
    
    Object.entries(votes).forEach(([strategy, voteCount]) => {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        winner = strategy;
      }
    });
    
    return winner;
  };

  return (
    <div className="panel">
      <h3>📊 Pool Dashboard</h3>
      
      <div className="user-info">
        <strong>Connected Account:</strong> {account ? `${account.slice(0, 10)}...${account.slice(-8)}` : 'Not connected'}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatAE(totalDeposits)} AE</div>
          <div className="stat-label">Total Pool Deposits</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatAE(userBalance)} AE</div>
          <div className="stat-label">Your Balance</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{getTotalVotes()}</div>
          <div className="stat-label">Total Votes Cast</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{getWinningStrategy()}</div>
          <div className="stat-label">Leading Strategy</div>
        </div>
      </div>

      <div className="vote-bars">
        <h4>Live Vote Tally</h4>
        {Object.entries(votes).map(([strategy, voteCount]) => {
          const percentage = getTotalVotes() > 0 ? (voteCount / getTotalVotes()) * 100 : 0;
          
          return (
            <div key={strategy} className="vote-bar">
              <div className="vote-bar-header">
                <span className="strategy-name">
                  {strategy === 'Safe' && '🛡️'} 
                  {strategy === 'Risky' && '🚀'} 
                  {strategy === 'Charity' && '❤️'} 
                  {strategy}
                </span>
                <span className="vote-count">{formatAE(voteCount)} AE ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="vote-progress">
                <div 
                  className="vote-progress-fill" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {getWinningStrategy() !== 'None' && (
        <div className="winning-strategy">
          🏆 Current Winner: {getWinningStrategy()} Strategy
        </div>
      )}
    </div>
  );
};

export default Dashboard;
