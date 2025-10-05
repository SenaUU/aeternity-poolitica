// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  AeSdkAepp,
  Node,
  CompilerHttp,
  BrowserWindowMessageConnection,
  walletDetector,
  Contract
} from '@aeternity/aepp-sdk';

import WalletConnection from './components/WalletConnection';
import Dashboard from './components/Dashboard';
import DepositWithdraw from './components/DepositWithdraw';
import VotingPanel from './components/VotingPanel';
import ExecuteStrategy from './components/ExecuteStrategy';
import './App.css';

// Configuration
const NODE_URL = 'https://testnet.aeternity.io';
const COMPILER_URL = 'https://v8.compiler.aepps.com';
const CONTRACT_ADDRESS = 'ct_2hwpMwF6Xo1vEhxcz5BPFZxQ4DjLyVY3P7Md4nsKkyjgthf2zV';

// --- Use the original source code (SDK will compile and derive correct ABI) ---
const CONTRACT_SOURCE = `@compiler >= 6

contract YieldPool =

  record state = { total_deposits : int, balances : map(address, int), votes : map(string, int), user_votes : map(address, string), voting_active : bool, owner : address }

  entrypoint init() = { total_deposits = 0, balances = {}, votes = {["Safe"] = 0, ["Risky"] = 0, ["Charity"] = 0}, user_votes = {}, voting_active = true, owner = Call.caller }

  function get_balance(user : address) : int = Map.lookup_default(user, state.balances, 0)

  function get_user_vote(user : address) : option(string) = Map.lookup(user, state.user_votes)

  function get_strategy_votes(strategy : string) : int = Map.lookup_default(strategy, state.votes, 0)

  function is_valid_strategy(strategy : string) : bool =
    strategy == "Safe" || strategy == "Risky" || strategy == "Charity"

  payable stateful entrypoint deposit() =
    require(Call.value > 0, "Cannot deposit zero")
    let amount = Call.value
    let current_balance = get_balance(Call.caller)
    let new_balance = current_balance + amount
    put(state{ balances[Call.caller] = new_balance, total_deposits = state.total_deposits + amount })

  stateful entrypoint withdraw(amount : int) =
    require(amount > 0, "Cannot withdraw zero")
    let current_balance = get_balance(Call.caller)
    require(current_balance >= amount, "Insufficient balance")
    let new_balance = current_balance - amount
    put(state{ balances[Call.caller] = new_balance, total_deposits = state.total_deposits - amount })
    Chain.spend(Call.caller, amount)

  stateful entrypoint vote(strategy : string) =
    require(state.voting_active, "Voting is not active")
    require(is_valid_strategy(strategy), "Invalid strategy")
    let user_balance = get_balance(Call.caller)
    require(user_balance > 0, "Must have deposits to vote")
    switch(get_user_vote(Call.caller))
      None => ()
      Some(old_strategy) =>
        let old_votes = get_strategy_votes(old_strategy)
        put(state{ votes[old_strategy] = old_votes - user_balance })
    let current_votes = get_strategy_votes(strategy)
    put(state{ votes[strategy] = current_votes + user_balance, user_votes[Call.caller] = strategy })

  function get_winning_strategy() : string =
    let safe_votes = get_strategy_votes("Safe")
    let risky_votes = get_strategy_votes("Risky")
    let charity_votes = get_strategy_votes("Charity")
    switch((safe_votes >= risky_votes && safe_votes >= charity_votes, risky_votes >= charity_votes))
      (true, _) => "Safe"
      (false, true) => "Risky"
      (false, false) => "Charity"

  function calculate_mock_yield(strategy : string) : int =
    switch(strategy)
      "Safe" => 5
      "Risky" => 15
      _ => 3

  function apply_yield(balance : int, percentage : int) : int =
    balance + (balance * percentage) / 100

  stateful entrypoint execute_strategy() =
    require(Call.caller == state.owner, "Only owner can execute")
    require(state.voting_active, "Voting already executed")
    require(state.total_deposits > 0, "No deposits to execute on")
    let winning_strategy = get_winning_strategy()
    let yield_percentage = calculate_mock_yield(winning_strategy)
    let total_yield = (state.total_deposits * yield_percentage) / 100
    put(state{ total_deposits = state.total_deposits + total_yield, voting_active = false })

  stateful entrypoint reset_voting() =
    require(Call.caller == state.owner, "Only owner can reset")
    put(state{ votes = {["Safe"] = 0, ["Risky"] = 0, ["Charity"] = 0}, user_votes = {}, voting_active = true })

  entrypoint get_total_deposits() : int = state.total_deposits
  entrypoint get_user_balance(user : address) : int = get_balance(user)
  entrypoint get_votes() : map(string, int) = state.votes
  entrypoint get_user_vote_choice(user : address) : option(string) = get_user_vote(user)
  entrypoint get_available_strategies() : list(string) = ["Safe", "Risky", "Charity"]
  entrypoint is_voting_active() : bool = state.voting_active
  entrypoint get_contract_balance() : int = Contract.balance
`;

// --- rest of your app (kept mostly intact) ---
function App() {
  // Core SDK + wallet state
  const [aeSdk, setAeSdk] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletDetectionActive, setWalletDetectionActive] = useState(false);

  // Contract state
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [votes, setVotes] = useState({ Safe: 0, Risky: 0, Charity: 0 });
  const [userVote, setUserVote] = useState(null);
  const [votingActive, setVotingActive] = useState(true);

  const initializedRef = useRef(false);
  const detectionRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    console.log('App component mounted');
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeAeSdk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contract && account) loadContractData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Initialize AeSdkAepp and start detection
  const initializeAeSdk = async () => {
    try {
      setLoading(true);
      console.log('Initializing AeSdkAepp...');
      const node = new Node(NODE_URL);
      const compiler = new CompilerHttp(COMPILER_URL);

      const sdk = new AeSdkAepp({
        name: 'Community-Governed Yield Pool',
        nodes: [{ name: 'testnet', instance: node }],
        onCompiler: compiler,
        // network/address change handlers (optional)
        onNetworkChange: (params) => console.log('Network changed:', params),
        onAddressChange: (addresses) => {
          console.log('Address change event:', addresses);
          // when SDK triggers onAddressChange, try to set active account if available
          try {
            if (addresses && addresses.current) {
              const a = Object.keys(addresses.current)[0];
              if (a) setAccount(a);
            }
          } catch (e) { /* ignore */ }
        }
      });

      setAeSdk(sdk);
      console.log('✅ AeSdkAepp initialized');

      // Start scanning for wallets
      startWalletDetection(sdk);
    } catch (err) {
      console.error('Failed to initialize AeSdkAepp:', err);
      setError('Failed to initialize Aeternity SDK: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Wallet detection + connect flow (uses walletDetector + BrowserWindowMessageConnection)
  const startWalletDetection = (sdk) => {
    if (!sdk || detectionRef.current || walletDetectionActive) return;
    console.log('Starting wallet detection...');
    detectionRef.current = true;
    setWalletDetectionActive(true);
  
    const scannerConnection = new BrowserWindowMessageConnection();
  
    // will hold the stop function returned by walletDetector
    let stopScan = null;
  
    const stopScanCleanup = () => {
      try { if (stopScan) stopScan(); } catch (e) { /* ignore */ }
      setWalletDetectionActive(false);
      detectionRef.current = false;
    };
  
    const handleWallets = async ({ wallets, newWallet }) => {
      newWallet = newWallet || Object.values(wallets || {})[0];
      if (!newWallet) return;
  
      console.log('Wallet found:', newWallet.info || newWallet);
      try {
        stopScanCleanup(); // stop scanning immediately
        const conn = newWallet.getConnection();
        await sdk.connectToWallet(conn);
        console.log('✅ connected to wallet via sdk.connectToWallet');
  
        const { address } = await sdk.subscribeAddress('subscribe', 'connected');
        const firstAddress = address && address.current && Object.keys(address.current)[0];
        if (firstAddress) {
          setAccount(firstAddress);
          setIsConnected(true);
          setError('');
          // Clear any pending timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          await initializeContract(sdk);
        } else {
          throw new Error('No accounts found. Unlock wallet and allow access.');
        }
      } catch (err) {
        console.error('Wallet connection failed:', err);
        setError(`Wallet connection failed: ${err?.message || err}`);
        stopScanCleanup();
      }
    };
  
    // start detector and keep stop function in stopScan (no redeclaration)
    stopScan = walletDetector(scannerConnection, handleWallets);
  
    timeoutRef.current = setTimeout(() => {
      if (!isConnected && timeoutRef.current) {
        console.warn('No wallet detected in time.');
        setError('Superhero Wallet not detected. Make sure the extension is open and refresh the page.');
        stopScanCleanup();
        timeoutRef.current = null;
      }
    }, 5000);
  };
  

  // Initialize the Contract instance (use sourceCode so SDK compiles and returns correct signatures)
  const initializeContract = async (sdk) => {
    try {
      if (!sdk) throw new Error('SDK is not available');
      console.log('Initializing contract instance...');
      const contractInstance = await Contract.initialize({
        ...sdk.getContext(),
        sourceCode: CONTRACT_SOURCE, // <<--- changed from aci to sourceCode
        address: CONTRACT_ADDRESS
      });
      setContract(contractInstance);
      console.log('✅ Contract initialized');
    } catch (err) {
      console.error('Contract initialization failed:', err);
      setError('Contract initialization failed: ' + (err?.message || err));
    }
  };

  // Manual "Connect" button fallback: triggers detection if not connected
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      if (!aeSdk) throw new Error('SDK not initialized. Refresh the page.');

      if (isConnected) {
        console.log('Already connected');
        return;
      }

      // Try to read any already-subscribed address
      try {
        // subscribeAddress returns address map if a wallet is already connected
        const res = await aeSdk.subscribeAddress('get', 'connected');
        const current = (res && res.address && res.address.current) || {};
        const first = Object.keys(current)[0];
        if (first) {
          setAccount(first);
          setIsConnected(true);
          await initializeContract(aeSdk);
          return;
        }
      } catch (e) {
        // ignore - proceed to start detection
      }

      // start scan (if not active)
      if (!walletDetectionActive && !detectionRef.current) startWalletDetection(aeSdk);
    } catch (err) {
      console.error('Manual wallet connection failed:', err);
      setError(`Connection failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Contract data loader
  const loadContractData = async () => {
    try {
      if (!contract || !account) {
        console.log('Contract or account unavailable', { contract: !!contract, account: !!account });
        return;
      }
      console.log('Loading contract data...');
      const [
        totalDep,
        userBal,
        contractVotes,
        userVoteChoice,
        isVotingActive
      ] = await Promise.all([
        contract.get_total_deposits(),
        contract.get_user_balance(account),
        contract.get_votes(),
        contract.get_user_vote_choice(account),
        contract.is_voting_active()
      ]);

      // convert BigInt-like results safely to Number (UI expects numbers)
      setTotalDeposits(Number(totalDep?.decodedResult ?? 0n));
      setUserBalance(Number(userBal?.decodedResult ?? 0n));

      // Handle Map decoding for votes
      let votesObj = {};
      if (contractVotes?.decodedResult) {
        if (contractVotes.decodedResult instanceof Map) {
          votesObj = Object.fromEntries(
            Array.from(contractVotes.decodedResult.entries()).map(([key, value]) => [key, Number(value)])
          );
        } else {
          votesObj = contractVotes.decodedResult;
          // Ensure values are numbers
          Object.keys(votesObj).forEach(key => {
            votesObj[key] = Number(votesObj[key] ?? 0n);
          });
        }
      }
      setVotes({
        Safe: votesObj.Safe ?? 0,
        Risky: votesObj.Risky ?? 0,
        Charity: votesObj.Charity ?? 0
      });

      let vote = null;
      if (userVoteChoice?.decodedResult) {
        const entries = Object.entries(userVoteChoice.decodedResult);
        if (entries.length > 0) {
          const [constructorName, args] = entries[0];
          if (constructorName === 'Some' && Array.isArray(args) && args.length > 0) {
            vote = args[0];
          }
        }
      }
      setUserVote(vote);

      setVotingActive(Boolean(isVotingActive?.decodedResult ?? true));

      console.log('✅ Contract data loaded', { votesObj, userVote: vote });
    } catch (err) {
      console.error('Failed to load contract data:', err);
      setError('Failed to load contract data: ' + (err?.message || err));
    }
  };

  // Action handlers (deposit/withdraw/vote/execute) mirror your previous implementation
  const handleDeposit = async (amount) => {
    if (!contract || !aeSdk) throw new Error('Contract or SDK not initialized');
    setLoading(true);
    let tx = null;
    try {
      console.log('deposit', amount);
      tx = await contract.deposit({ amount: BigInt(amount) });
      console.log('Deposit tx sent:', tx);
      console.log('Deposit confirmed');
    } catch (err) {
      console.error('Deposit confirmation failed:', err);
      setError('Deposit may have succeeded but confirmation timed out: ' + (err?.message || err));
      // Don't throw, continue to load
    } finally {
      setLoading(false);
    }
    await loadContractData();
    return tx;
  };

  const handleWithdraw = async (amount) => {
    if (!contract || !aeSdk) throw new Error('Contract or SDK not initialized');
    setLoading(true);
    let tx = null;
    try {
      console.log('withdraw', amount);
      tx = await contract.withdraw(BigInt(amount));
      console.log('Withdraw tx sent:', tx);
      console.log('Withdraw confirmed');
    } catch (err) {
      console.error('Withdraw confirmation failed:', err);
      setError('Withdraw may have succeeded but confirmation timed out: ' + (err?.message || err));
      // Don't throw, continue to load
    } finally {
      setLoading(false);
    }
    await loadContractData();
    return tx;
  };

  const handleVote = async (strategy) => {
    if (!contract || !aeSdk) throw new Error('Contract or SDK not initialized');
    setLoading(true);
    let tx = null;
    try {
      console.log('vote', strategy);
      tx = await contract.vote(strategy);
      console.log('Vote tx sent:', tx);
      console.log('Vote confirmed');
    } catch (err) {
      console.error('Vote confirmation failed:', err);
      setError('Vote may have succeeded but confirmation timed out: ' + (err?.message || err));
      // Don't throw, continue to load
    } finally {
      setLoading(false);
    }
    await loadContractData();
    return tx;
  };
  

  const handleExecuteStrategy = async () => {
    if (!contract || !aeSdk) throw new Error('Contract or SDK not initialized');
    setLoading(true);
    let tx = null;
    try {
      console.log('execute strategy');
      tx = await contract.execute_strategy();
      console.log('Execute tx sent:', tx);
      console.log('Execute confirmed');
    } catch (err) {
      console.error('Execute confirmation failed:', err);
      setError('Execute may have succeeded but confirmation timed out: ' + (err?.message || err));
      // Don't throw, continue to load
    } finally {
      setLoading(false);
    }
    await loadContractData();
    return tx;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌟 Community-Governed Yield Pool</h1>
        <p>Deposit AE, vote on strategies, earn yield together!</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {!isConnected ? (
        <WalletConnection
          onConnect={connectWallet}
          loading={loading || walletDetectionActive}
        />
      ) : (
        <div className="main-content">
          <Dashboard
            totalDeposits={totalDeposits}
            userBalance={userBalance}
            votes={votes}
            account={account}
          />

          <div className="action-panels">
            <DepositWithdraw
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              userBalance={userBalance}
              loading={loading}
            />

            <VotingPanel
              votes={votes}
              userVote={userVote}
              onVote={handleVote}
              votingActive={votingActive}
              loading={loading}
            />

            <ExecuteStrategy
              onExecute={handleExecuteStrategy}
              votingActive={votingActive}
              votes={votes}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;