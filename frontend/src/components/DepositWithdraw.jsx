import React, { useState } from 'react';

const DepositWithdraw = ({ onDeposit, onWithdraw, userBalance, loading }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState('');

  const formatAE = (amount) => {
    return (amount / 1e18).toFixed(4);
  };

  const parseAE = (amount) => {
    return Math.floor(parseFloat(amount) * 1e18);
  };

  const handleDeposit = async () => {
    try {
      setError('');
      
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        setError('Please enter a valid deposit amount');
        return;
      }

      const amountInAettos = parseAE(depositAmount);
      await onDeposit(amountInAettos);
      setDepositAmount('');
    } catch (err) {
      setError(`Deposit failed: ${err.message}`);
    }
  };

  const handleWithdraw = async () => {
    try {
      setError('');
      
      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        setError('Please enter a valid withdrawal amount');
        return;
      }

      const amountInAettos = parseAE(withdrawAmount);
      
      if (amountInAettos > userBalance) {
        setError('Insufficient balance for withdrawal');
        return;
      }

      await onWithdraw(amountInAettos);
      setWithdrawAmount('');
    } catch (err) {
      setError(`Withdrawal failed: ${err.message}`);
    }
  };

  const setMaxWithdraw = () => {
    setWithdrawAmount(formatAE(userBalance));
  };

  return (
    <div className="panel">
      <h3>💰 Deposit & Withdraw</h3>
      
      {error && (
        <div className="error-banner" style={{ margin: '0 0 1rem 0' }}>
          {error}
        </div>
      )}

      <div className="input-group">
        <label>Deposit Amount (AE)</label>
        <input
          type="number"
          step="0.0001"
          min="0"
          placeholder="Enter amount to deposit"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div className="button-group">
        <button 
          className="button success" 
          onClick={handleDeposit}
          disabled={loading || !depositAmount}
        >
          {loading ? 'Processing...' : '💳 Deposit'}
        </button>
        
        <button 
          className="button" 
          onClick={() => setDepositAmount('1')}
          disabled={loading}
        >
          1 AE
        </button>
        
        <button 
          className="button" 
          onClick={() => setDepositAmount('5')}
          disabled={loading}
        >
          5 AE
        </button>
        
        <button 
          className="button" 
          onClick={() => setDepositAmount('10')}
          disabled={loading}
        >
          10 AE
        </button>
      </div>

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)' }} />

      <div className="input-group">
        <label>Withdraw Amount (AE)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="number"
            step="0.0001"
            min="0"
            max={formatAE(userBalance)}
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button 
            className="button" 
            onClick={setMaxWithdraw}
            disabled={loading || userBalance === 0}
            style={{ margin: 0 }}
          >
            Max
          </button>
        </div>
        <small style={{ opacity: 0.7, marginTop: '0.5rem', display: 'block' }}>
          Available: {formatAE(userBalance)} AE
        </small>
      </div>
      
      <button 
        className="button danger" 
        onClick={handleWithdraw}
        disabled={loading || !withdrawAmount || userBalance === 0}
      >
        {loading ? 'Processing...' : '💸 Withdraw'}
      </button>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>💡 How it works:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>Deposit AE to join the yield pool</li>
          <li>Your voting power equals your deposit amount</li>
          <li>Withdraw anytime before strategy execution</li>
          <li>Earn yield based on the winning strategy</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositWithdraw;
