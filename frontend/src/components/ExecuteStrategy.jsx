import React, { useState } from 'react';

const ExecuteStrategy = ({ onExecute, votingActive, votes, loading }) => {
  const [error, setError] = useState('');
  const [executing, setExecuting] = useState(false);

  const formatAE = (amount) => {
    return (amount / 1e18).toFixed(4);
  };

  const getTotalVotes = () => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

  const getWinningStrategy = () => {
    let maxVotes = 0;
    let winner = null;
    
    Object.entries(votes).forEach(([strategy, voteCount]) => {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        winner = strategy;
      }
    });
    
    return winner;
  };

  const getStrategyYield = (strategy) => {
    switch(strategy) {
      case 'Safe': return '5%';
      case 'Risky': return '15%';
      case 'Charity': return '3%';
      default: return '0%';
    }
  };

  const getStrategyEmoji = (strategy) => {
    switch(strategy) {
      case 'Safe': return '🛡️';
      case 'Risky': return '🚀';
      case 'Charity': return '❤️';
      default: return '❓';
    }
  };

  const handleExecute = async () => {
    try {
      setError('');
      setExecuting(true);
      await onExecute();
    } catch (err) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const winningStrategy = getWinningStrategy();
  const totalVotes = getTotalVotes();
  const canExecute = votingActive && totalVotes > 0;

  return (
    <div className="panel">
      <h3>⚡ Execute Strategy</h3>
      
      {error && (
        <div className="error-banner" style={{ margin: '0 0 1rem 0' }}>
          {error}
        </div>
      )}

      {!votingActive ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h4 style={{ color: '#ffd700', marginBottom: '1rem' }}>Strategy Executed!</h4>
          <p>The winning strategy has been executed and yield has been distributed to all depositors.</p>
          <div style={{ 
            background: 'rgba(255, 215, 0, 0.2)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginTop: '1rem',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            Check your balance to see your earned yield!
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h4>Current Vote Status:</h4>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Votes Cast:</span>
                <strong>{formatAE(totalVotes)} AE</strong>
              </div>
              
              {winningStrategy && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Leading Strategy:</span>
                    <strong>{getStrategyEmoji(winningStrategy)} {winningStrategy}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Expected Yield:</span>
                    <strong style={{ color: '#ffd700' }}>{getStrategyYield(winningStrategy)}</strong>
                  </div>
                </>
              )}
            </div>

            {winningStrategy && (
              <div className="winning-strategy">
                🏆 {getStrategyEmoji(winningStrategy)} {winningStrategy} Strategy is currently winning!
                <br />
                <small>All depositors will earn {getStrategyYield(winningStrategy)} yield if executed now</small>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            {totalVotes === 0 ? (
              <div style={{ 
                background: 'rgba(255, 193, 7, 0.2)', 
                padding: '1.5rem', 
                borderRadius: '8px',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>⏳ Waiting for Votes</h4>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  At least one vote is required before the strategy can be executed.
                </p>
              </div>
            ) : (
              <button
                className="button primary"
                onClick={handleExecute}
                disabled={!canExecute || loading || executing}
                style={{ 
                  fontSize: '1.2rem', 
                  padding: '1rem 2rem',
                  background: canExecute ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : undefined
                }}
              >
                {executing ? (
                  <>🔄 Executing Strategy...</>
                ) : (
                  <>🚀 Execute {winningStrategy} Strategy</>
                )}
              </button>
            )}
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px', 
            fontSize: '0.9rem',
            marginTop: '2rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>⚠️ Execution Effects:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <li>The winning strategy will be permanently executed</li>
              <li>Mock yield will be distributed to all depositors</li>
              <li>Voting will be closed until reset by contract owner</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ExecuteStrategy;
