package finguard.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;

import finguard.exception.AccountFrozenException;
import finguard.exception.AccountNotFoundException;
import finguard.exception.InsufficientBalanceException;
import finguard.exception.InvalidPinException;
import finguard.model.Account;
import finguard.model.CurrentAccount;
import finguard.model.Customer;
import finguard.model.SavingsAccount;
import finguard.model.SavingsChallenge;
import finguard.model.Transaction;
import finguard.model.TransactionRequest;
import finguard.safety.BankClock;
import finguard.safety.CooldownVault;
import finguard.safety.RuleEngine;
import finguard.safety.SpendingIntelligence;
import finguard.savings.ChallengeBoard;

public class Bank {
    private HashMap<String, Customer> customers;
    private HashMap<String, Account> accounts;
    private HashSet<String> frozenIds;
    private BankClock clock;
    private RuleEngine rules;
    private SpendingIntelligence spendIntel;
    private CooldownVault cooldown;
    private ChallengeBoard challenges;
    private int customerSeq;
    private int accountSeq;
    private int requestSeq;
    private int txnSeq;

    public Bank(BankClock clock, CooldownVault cooldown) {
        this.customers = new HashMap<String, Customer>();
        this.accounts = new HashMap<String, Account>();
        this.frozenIds = new HashSet<String>();
        this.clock = clock;
        this.cooldown = cooldown;
        this.rules = new RuleEngine();
        this.spendIntel = new SpendingIntelligence();
        this.challenges = new ChallengeBoard();
        this.customerSeq = 100;
        this.accountSeq = 1000;
        this.requestSeq = 1;
        this.txnSeq = 1;
    }

    public BankClock getClock() {
        return clock;
    }

    public CooldownVault getCooldown() {
        return cooldown;
    }

    public ChallengeBoard getChallenges() {
        return challenges;
    }

    public synchronized Customer createCustomer(String name, String pin) {
        customerSeq++;
        String id = "C" + customerSeq;
        Customer c = new Customer(id, name, pin);
        customers.put(id, c);
        return c;
    }

    public synchronized Account createAccount(String customerId, String type, double opening)
            throws AccountNotFoundException {
        Customer c = customers.get(customerId);
        if (c == null) {
            throw new AccountNotFoundException("No customer " + customerId);
        }
        accountSeq++;
        String accNo = "FG" + accountSeq;
        Account acc;
        if ("CURRENT".equalsIgnoreCase(type)) {
            acc = new CurrentAccount(accNo, customerId, c.getName(), opening, 5000);
        } else {
            acc = new SavingsAccount(accNo, customerId, c.getName(), opening);
            challenges.add(new SavingsChallenge(accNo, "8-week safety vault", 8, 200));
        }
        accounts.put(accNo, acc);
        c.addAccountNumber(accNo);
        return acc;
    }

    public Customer login(String customerId, String pin) throws AccountNotFoundException, InvalidPinException {
        Customer c = customers.get(customerId);
        if (c == null) {
            throw new AccountNotFoundException("Unknown customer id");
        }
        if (!c.checkPin(pin)) {
            throw new InvalidPinException("PIN did not match");
        }
        return c;
    }

    public Account requireAccount(String accNo) throws AccountNotFoundException {
        Account acc = accounts.get(accNo);
        if (acc == null) {
            throw new AccountNotFoundException("No account " + accNo);
        }
        return acc;
    }

    public Customer requireCustomer(String id) throws AccountNotFoundException {
        Customer c = customers.get(id);
        if (c == null) {
            throw new AccountNotFoundException("No customer " + id);
        }
        return c;
    }

    public TransactionRequest buildRequest(String type, String from, String to, double amount, String purpose) {
        int priority = TransactionRequest.PRIORITY_NORMAL;
        if (TransactionRequest.TYPE_SALARY.equals(type)) {
            priority = TransactionRequest.PRIORITY_SALARY;
        } else if (TransactionRequest.TYPE_BILL.equals(type)) {
            priority = TransactionRequest.PRIORITY_BILL;
        } else if (TransactionRequest.TYPE_ROUNDUP.equals(type)) {
            priority = TransactionRequest.PRIORITY_ROUNDUP;
        }
        String payee = to;
        if (payee == null || payee.length() == 0) {
            payee = "CASH";
        }
        int id;
        synchronized (this) {
            id = requestSeq++;
        }
        return new TransactionRequest(id, priority, clock.now(), type, from, to, amount, purpose, payee);
    }

    public String settle(TransactionRequest request, boolean alreadyCooled) {
        try {
            return settleInner(request, alreadyCooled);
        } catch (AccountNotFoundException e) {
            return "FAIL: " + e.getMessage();
        } catch (AccountFrozenException e) {
            return "FAIL: " + e.getMessage();
        } catch (InsufficientBalanceException e) {
            return "FAIL: " + e.getMessage();
        }
    }

    private String settleInner(TransactionRequest request, boolean alreadyCooled)
            throws AccountNotFoundException, AccountFrozenException, InsufficientBalanceException {
        String type = request.getType();
        if (TransactionRequest.TYPE_DEPOSIT.equals(type) || TransactionRequest.TYPE_SALARY.equals(type)) {
            Account acc = requireAccount(request.getToAccount());
            acc.assertNotFrozen();
            acc.credit(request.getAmount());
            String cat = spendIntel.categorize(request.getPurpose());
            Transaction t = nextTxn(request, cat, "SUCCESS", 0);
            acc.record(t);
            maybeChallenge(acc, request);
            return "SUCCESS credit Rs." + request.getAmount() + " to " + acc.maskNumber()
                    + " bal=" + acc.getBalance();
        }

        Account from = requireAccount(request.getFromAccount());
        from.assertNotFrozen();

        RuleEngine.Result result = rules.score(from, request);
        System.out.println("  [RULES] score=" + result.score + " decision=" + rules.decisionName(result.decision));
        for (int i = 0; i < result.fired.size(); i++) {
            System.out.println("           " + result.fired.get(i));
        }

        if (!alreadyCooled && result.decision == RuleEngine.BLOCK) {
            String cat = spendIntel.categorize(request.getPurpose());
            from.record(nextTxn(request, cat, "BLOCKED", result.score));
            return "BLOCKED (score " + result.score + "). Consider emergency freeze.";
        }
        if (!alreadyCooled && result.decision == RuleEngine.COOLDOWN) {
            String cat = spendIntel.categorize(request.getPurpose());
            from.record(nextTxn(request, cat, "HELD", result.score));
            cooldown.hold(request, 4);
            return "HELD for cooldown (score " + result.score + "). Watcher will release later.";
        }

        lockAndMove(request, result.score);
        maybeRoundUp(from, request);
        maybeChallenge(from, request);
        return "SUCCESS " + type + " Rs." + request.getAmount()
                + " from " + from.maskNumber() + " bal=" + from.getBalance();
    }

    private void lockAndMove(TransactionRequest request, int score)
            throws AccountNotFoundException, AccountFrozenException, InsufficientBalanceException {
        Account from = requireAccount(request.getFromAccount());
        Account to = null;
        if (request.getToAccount() != null && request.getToAccount().length() > 0
                && accounts.containsKey(request.getToAccount())) {
            to = requireAccount(request.getToAccount());
        }

        if (to == null) {
            synchronized (from) {
                from.assertNotFrozen();
                from.debit(request.getAmount());
                String cat = spendIntel.categorize(request.getPurpose());
                from.record(nextTxn(request, cat, "SUCCESS", score));
            }
            return;
        }

        Account first = from;
        Account second = to;
        if (from.getAccountNumber().compareTo(to.getAccountNumber()) > 0) {
            first = to;
            second = from;
        }
        synchronized (first) {
            synchronized (second) {
                from.assertNotFrozen();
                to.assertNotFrozen();
                from.debit(request.getAmount());
                to.credit(request.getAmount());
                String cat = spendIntel.categorize(request.getPurpose());
                Transaction t = nextTxn(request, cat, "SUCCESS", score);
                from.record(t);
                to.record(t);
            }
        }
    }

    private void maybeRoundUp(Account from, TransactionRequest request) {
        if (!(from instanceof SavingsAccount)) {
            return;
        }
        SavingsAccount sav = (SavingsAccount) from;
        if (!sav.isRoundUpEnabled()) {
            return;
        }
        String type = request.getType();
        if (!TransactionRequest.TYPE_WITHDRAW.equals(type) && !TransactionRequest.TYPE_TRANSFER.equals(type)
                && !TransactionRequest.TYPE_BILL.equals(type)) {
            return;
        }
        double amount = request.getAmount();
        double rounded = Math.ceil(amount / 10.0) * 10.0;
        double spare = rounded - amount;
        if (spare <= 0) {
            return;
        }
        try {
            synchronized (sav) {
                if (sav.getBalance() >= spare && !sav.isFrozen()) {
                    sav.debit(spare);
                    sav.addToVault(spare);
                    System.out.println("  [ROUND-UP] extra Rs." + spare + " moved to safety vault. Vault=Rs."
                            + sav.getVaultBalance());
                }
            }
        } catch (Exception e) {
            System.out.println("  [ROUND-UP] skipped: " + e.getMessage());
        }
    }

    private void maybeChallenge(Account from, TransactionRequest request) {
        if (TransactionRequest.TYPE_DEPOSIT.equals(request.getType())
                || TransactionRequest.TYPE_SALARY.equals(request.getType())) {
            SavingsChallenge ch = challenges.find(from.getAccountNumber());
            if (ch != null) {
                int week = clock.now() % 8;
                boolean filled = ch.fillWeek(week, Math.min(request.getAmount() * 0.05, 200));
                if (filled) {
                    System.out.println("  [CHALLENGE] week slot " + week + " completed. " + ch.report());
                }
            }
        }
    }

    private Transaction nextTxn(TransactionRequest request, String category, String status, int score) {
        int id;
        synchronized (this) {
            id = txnSeq++;
        }
        return new Transaction(id, clock.now(), request.getType(), request.getAmount(),
                request.getFromAccount(), request.getToAccount(), request.getPurpose(),
                category, status, score);
    }

    public synchronized void freeze(String accNo, String pin)
            throws AccountNotFoundException, InvalidPinException {
        Account acc = requireAccount(accNo);
        Customer c = requireCustomer(acc.getCustomerId());
        if (!c.checkPin(pin)) {
            throw new InvalidPinException("PIN required to freeze");
        }
        acc.freeze();
        frozenIds.add(accNo);
        System.out.println("  [FREEZE] " + acc.maskNumber() + " is now frozen. Set=" + frozenIds);
    }

    public synchronized void unfreeze(String accNo, String pin, String phrase)
            throws AccountNotFoundException, InvalidPinException {
        Account acc = requireAccount(accNo);
        Customer c = requireCustomer(acc.getCustomerId());
        if (!c.checkPin(pin)) {
            throw new InvalidPinException("PIN required to unfreeze");
        }
        if (!"UNFREEZE".equals(phrase)) {
            throw new InvalidPinException("Type UNFREEZE exactly to confirm");
        }
        acc.unfreeze();
        frozenIds.remove(accNo);
        System.out.println("  [FREEZE] " + acc.maskNumber() + " restored");
    }

    public void printStatement(String accNo, String sortBy) throws AccountNotFoundException {
        Account acc = requireAccount(accNo);
        ArrayList<Transaction> list = statement(accNo, sortBy);
        System.out.println("Statement " + acc.maskNumber() + "  type=" + acc.getAccountType()
                + "  bal=Rs." + acc.getBalance() + "  frozen=" + acc.isFrozen());
        if (acc instanceof SavingsAccount) {
            System.out.println("Safety vault: Rs." + ((SavingsAccount) acc).getVaultBalance());
        }
        if (acc instanceof CurrentAccount) {
            System.out.println("Overdraft limit: Rs." + ((CurrentAccount) acc).getOverdraftLimit()
                    + "  available=Rs." + acc.availableLimit());
        }
        if (list.isEmpty()) {
            System.out.println("  (no transactions)");
            return;
        }
        for (int i = 0; i < list.size(); i++) {
            System.out.println("  " + list.get(i).summary());
        }
    }

    public void printSpending(String accNo) throws AccountNotFoundException {
        SpendingIntelligence.ArrayReport r = spendingReport(accNo);
        for (int i = 0; i < r.lines.length; i++) {
            if (r.lines[i] != null) {
                System.out.println(r.lines[i]);
            }
        }
    }

    public void seedDemo() {
        try {
            Customer a = createCustomer("Navneet", "1234");
            Customer b = createCustomer("Aarav", "2345");
            Customer c = createCustomer("Meera", "3456");
            Account aSav = createAccount(a.getCustomerId(), "SAVINGS", 100000);
            Account aCur = createAccount(a.getCustomerId(), "CURRENT", 25000);
            Account bSav = createAccount(b.getCustomerId(), "SAVINGS", 40000);
            Account cSav = createAccount(c.getCustomerId(), "SAVINGS", 15000);
            System.out.println("Seeded demo customers:");
            System.out.println("  " + a.getCustomerId() + " Navneet PIN 1234  " + aSav.getAccountNumber()
                    + " (SAVINGS 100000)  " + aCur.getAccountNumber() + " (CURRENT 25000)");
            System.out.println("  " + b.getCustomerId() + " Aarav   PIN 2345  " + bSav.getAccountNumber()
                    + " (SAVINGS 40000)");
            System.out.println("  " + c.getCustomerId() + " Meera   PIN 3456  " + cSav.getAccountNumber()
                    + " (SAVINGS 15000)");
        } catch (AccountNotFoundException e) {
            System.out.println(e.getMessage());
        }
    }

    public HashMap<String, Account> getAccounts() {
        return accounts;
    }

    public HashMap<String, Customer> getCustomers() {
        return customers;
    }

    public ArrayList<Transaction> statement(String accNo, String sortBy) throws AccountNotFoundException {
        Account acc = requireAccount(accNo);
        ArrayList<Transaction> list = acc.copyHistory();
        if ("AMOUNT".equalsIgnoreCase(sortBy)) {
            Collections.sort(list, new Comparator<Transaction>() {
                public int compare(Transaction a, Transaction b) {
                    if (a.getAmount() > b.getAmount()) {
                        return -1;
                    }
                    if (a.getAmount() < b.getAmount()) {
                        return 1;
                    }
                    return 0;
                }
            });
        } else {
            Collections.sort(list);
        }
        return list;
    }

    public SpendingIntelligence.ArrayReport spendingReport(String accNo) throws AccountNotFoundException {
        Account acc = requireAccount(accNo);
        Customer c = requireCustomer(acc.getCustomerId());
        double vault = 0;
        if (acc instanceof SavingsAccount) {
            vault = ((SavingsAccount) acc).getVaultBalance();
        }
        return spendIntel.report(c, acc.copyCategorySpend(), vault);
    }
}
