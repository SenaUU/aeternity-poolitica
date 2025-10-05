# 🏛️ Poolitica

**Democratizing DeFi: Earn yield, shape strategy, and vote your way to smarter finance.**

---

## 🌱 Inspiration

Traditional wealth management is opaque, centralized, and exclusive — only a few decide how funds are invested.
DeFi promised transparency and open access, but it often became a passive experience: users stake, earn, and leave.

We asked ourselves:

> *“What if yield farming felt more like participating in a democracy than betting in a casino?”*

That idea became **Poolitica** — a platform where contributors **earn yield and vote** on how the shared pool’s funds are allocated.
Every wallet becomes a voice in the community’s collective financial intelligence.

---

## 💡 What It Does

**Poolitica** is a governance layer on top of yield-bearing DeFi protocols.
Users deposit into a shared pool → the protocol routes funds into **KYC-compliant, secure DeFi yield sources** (e.g., tokenized T-bills, lending pools, or liquidity strategies).

Then, each round (e.g., weekly), contributors **vote on the next allocation strategy**:

* 🏦 *Conservative*: allocate 80% to stable yields, 20% to growth.
* 🚀 *Aggressive*: pursue riskier pools for higher APY.
* ♻️ *Custom*: integrate a new partner DeFi protocol.

The most-voted strategy becomes the next epoch’s investment route.
Users see their voting weight and rewards transparently on-chain.

Mathematically, the **reward share** for each user can be represented as:
[
r_i = \frac{d_i \cdot w_i}{\sum_j d_j \cdot w_j}
]
where ( d_i ) = deposit amount and ( w_i ) = user’s participation weight (a function of votes and engagement).

---

## 🏗️ How We Built It

1. **Smart Contract Layer (Sophia / Aeternity)**

   * Implemented a contract managing deposits, proposals, and votes.
   * Used `map(address => int)` for deposits and `map(int => Vote)` for governance rounds.
   * Integrated with **Superhero Wallet** for signing and voting.

2. **Frontend (React + Aepp SDK)**

   * Built a simple AEpp using boilerplates from the Aeternity SDK.
   * Users connect their wallet, view pool metrics, and vote on-chain.

3. **Off-chain Simulation Module**

   * Simulated yield strategies in JS using testnet data.
   * Weighted average yield was visualized to show the “what-if” outcome of community choices.

4. **Governance UI**

   * A clean interface showing strategy options, vote weight, and results.
   * Late-night hack bonus: added animated confetti for winning strategy 🎉

---

## 🧠 What We Learned

* **Sophia smart contracts** are surprisingly concise but demand careful gas optimization.
* **Governance mechanics** require both fairness and simplicity — users engage more when votes feel meaningful.
* Balancing UX with decentralization: many users want *“DeFi without the scary parts.”*
* **Transparency ≠ simplicity** — translating contract data into human terms (like expected yield) takes thoughtful design.

---

## ⚔️ Challenges We Faced

* 🧩 **State synchronization:** keeping off-chain vote previews in sync with on-chain execution.
* 🔐 **Wallet detection issues:** learning how to gracefully handle connection failures between Aepp and Superhero Wallet.
* 🧮 **Testing and deployment:** debugging gas limits and ensuring safe voting logic (no double votes).
* 🕒 **Time pressure:** designing, coding, and debugging governance mechanics all within 24 hours!

---

## 🚀 What’s Next

* Enable **multi-pool portfolios**, so users can diversify across strategies.
* Add **reputation-based voting weight** (e.g., history-adjusted governance).
* Connect with **real-world DeFi protocols** via oracles for live yields.
* Eventually, evolve Poolitica into a **fully on-chain cooperative fund**, governed by its depositors.

---

## 🧩 Tech Stack

| Layer              | Tools              |
| ------------------ | ------------------ |
| Smart Contracts    | Sophia (Aeternity) |
| Frontend           | React + Vite       |
| Wallet Integration | Superhero Wallet   |
| Backend Logic      | Node.js + Aepp SDK |
| Visualization      | Chart.js           |
| Deployment         | Aeternity Testnet  |
