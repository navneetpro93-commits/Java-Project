# FinGuard | Intelligent Banking Safety Console & Concurrency Lab

An intelligent, multi-threaded banking safety system built for Semester 3 Core Java, paired with a modern React + Tailwind CSS dashboard.

---

## 🚀 Quick Start Guide

### 1. Start the Java Backend Server (Port 8080)
From the project root:
```bash
# Compile all Java sources
javac -d . finguard/api/*.java finguard/*.java finguard/*/*.java

# Run the API server
java finguard.api.ApiMain
```
The Java server starts an embedded HTTP server on `http://localhost:8080`, initializes the daemon `BankClock`, `CooldownVault` watcher, and `SettlementWorker` threads, and seeds demo data:
* **C101 (Navneet)**: PIN `1234` | Accounts: `FG1001` (Savings, ₹100,000) & `FG1002` (Current, ₹25,000)
* **C102 (Aarav)**: PIN `2345` | Account: `FG1003` (Savings, ₹40,000)
* **C103 (Meera)**: PIN `3456` | Account: `FG1004` (Savings, ₹15,000)

---

### 2. Start the React + Tailwind Frontend (Port 5173)
In another terminal tab:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🎓 Semester 3 Java Concepts Demonstrated

This project showcases core computer science and Java principles:

| Java Concept | Package / Class | What it Demonstrates |
| :--- | :--- | :--- |
| **Encapsulation & OOP** | `finguard.model.Account`, `Customer` | Private fields, getters, setters, synchronized state mutation. |
| **Abstract Classes** | `Account` | Base contract defining `withdraw()`, `credit()`, and abstract `availableLimit()`. |
| **Inheritance & Polymorphism** | `SavingsAccount`, `CurrentAccount` | `SavingsAccount` has interest & vault balances; `CurrentAccount` overrides limits to provide overdraft protection. |
| **Interfaces** | `Freezeable` | Decouples safety freeze capability from account models. |
| **Custom Exceptions** | `finguard.exception.*` | `AccountFrozenException`, `InsufficientBalanceException`, `AccountNotFoundException`, `InvalidPinException`. |
| **Java Collections** | `HashMap`, `ArrayList`, `HashSet` | Fast account/customer lookups, transaction ledgers, category budgeting. |
| **Comparators & PriorityQueue** | `TransactionPriorityComparator`, `ClearingHouse` | Priority queue where `SALARY` > `BILL` > `TRANSFER` leapfrogs standard clearing. |
| **Multithreading** | `BankClock`, `SettlementWorker` | Background daemon threads (`setDaemon(true)`), `Thread.join()`, `Runnable`. |
| **Synchronization & Locks** | `RaceLab.java`, `Account.java` | Synchronized methods and critical sections preventing race conditions and lost updates. |
| **Inter-Thread Communication** | `ClearingHouse.java`, `BankClock.java` | Producer-consumer coordination via `wait()` and `notifyAll()`. |
| **Deadlock Prevention** | `Bank.java` (`lockAndMove`) | Ordered locking by account number to break the circular wait condition. |
| **Built-in HTTP Server** | `finguard.api.ApiServer` | Native Java `com.sun.net.httpserver.HttpServer` with RESTful JSON endpoints. |

---

## 🖥️ Frontend Features (React + Tailwind CSS)

1. **Live Dashboard & Metrics**:
   - Real-time bank clock tick indicator with pulse status.
   - Account portfolio cards with polymorphic attributes (Vault balance vs Overdraft limits).
   - Masked / Unmasked account numbers with one-click toggle.
   - Emergency freeze status badges.

2. **Money Operations & Live RuleEngine**:
   - Supports Transfers, Cash Deposits, ATM Withdrawals, Priority Salary Credits, and Bill Payments.
   - Real-time fraud detection and risk score assessment (0-100).
   - High-value transfers (≥ ₹25,000) automatically diverted into the Cooldown Vault.
   - Live streaming Java console output (`System.out` captured via `ConsoleCapture.java`).

3. **Cooldown Vault (Safety Hold Queue)**:
   - Visual inspection of pending / held transactions.
   - Countdown to `readyTick`.
   - "Cancel & Recall" button enabling users to cancel fraudulent transactions before settlement.

4. **Audit Ledger & Filterable Statements**:
   - Complete transaction history.
   - Instant sorting by Date/Tick, Amount, or Risk Score.
   - Search by purpose, recipient, or category.

5. **Spending Intelligence & AI Heuristics**:
   - Identifies user's Financial Personality (e.g. Disciplined Saver, Impulsive Spender, Balanced Budgeter).
   - Visual progress bars for category budgets (Food, Bills, Travel, Shopping, etc.) with automatic over-budget warnings.

6. **Savings Challenge Board**:
   - 8-week automated micro-savings tracker.
   - Streaks, targets, and leaderboard ranked using custom Java Comparators.

7. **Interactive Concurrency Lab**:
   - Run the **Race Condition Lab** (`RaceLab.java`): Demonstrates unsynchronized data corruption (`UnsafeBox`) vs synchronized safety (`SafeBox`).
   - Run the **Priority Clearing Demo** (`ClearingHouse.java`): Shows producer-consumer prioritization in real-time.
   - Run the **Thread Freeze Demo** (`CustomerWorker.java`): Shows worker threads halted by dynamic account freeze.
