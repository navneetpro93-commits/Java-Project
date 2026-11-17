package finguard.api;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import finguard.concurrent.ClearingHouse;
import finguard.concurrent.CustomerWorker;
import finguard.concurrent.RaceLab;
import finguard.exception.AccountNotFoundException;
import finguard.model.Account;
import finguard.model.CurrentAccount;
import finguard.model.Customer;
import finguard.model.SavingsAccount;
import finguard.model.SavingsChallenge;
import finguard.model.Transaction;
import finguard.model.TransactionRequest;
import finguard.safety.BankClock;
import finguard.safety.CooldownVault;
import finguard.safety.SpendingIntelligence;
import finguard.service.Bank;

public class ApiServer {
    private Bank bank;
    private ClearingHouse house;
    private CooldownVault vault;
    private BankClock clock;

    public ApiServer(Bank bank, ClearingHouse house, CooldownVault vault, BankClock clock) {
        this.bank = bank;
        this.house = house;
        this.vault = vault;
        this.clock = clock;
    }

    public void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api", this::handle);
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();
        System.out.println("FinGuard API listening on http://localhost:" + port);
    }

    private void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        if ("OPTIONS".equals(method)) {
            send(exchange, 204, "");
            return;
        }
        String path = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getRawQuery();
        String body = readBody(exchange);
        try {
            if ("GET".equals(method) && "/api/health".equals(path)) {
                send(exchange, 200, "{\"ok\":true,\"tick\":" + clock.now() + "}");
            } else if ("GET".equals(method) && "/api/overview".equals(path)) {
                send(exchange, 200, overviewJson());
            } else if ("POST".equals(method) && "/api/login".equals(path)) {
                Customer customer = bank.login(Json.field(body, "customerId"), Json.field(body, "pin"));
                send(exchange, 200, "{\"customer\":" + customerJson(customer) + "}");
            } else if ("POST".equals(method) && "/api/customers".equals(path)) {
                Customer customer = bank.createCustomer(Json.field(body, "name"), Json.field(body, "pin"));
                send(exchange, 200, "{\"customer\":" + customerJson(customer) + "}");
            } else if ("POST".equals(method) && "/api/accounts".equals(path)) {
                Account account = bank.createAccount(
                        Json.field(body, "customerId"),
                        Json.field(body, "type"),
                        Json.num(body, "opening"));
                send(exchange, 200, "{\"account\":" + accountJson(account) + "}");
            } else if ("POST".equals(method) && "/api/move".equals(path)) {
                move(exchange, body);
            } else if ("GET".equals(method) && "/api/statement".equals(path)) {
                String account = queryValue(query, "account");
                String sort = queryValue(query, "sort");
                send(exchange, 200, statementJson(account, sort));
            } else if ("GET".equals(method) && "/api/spending".equals(path)) {
                send(exchange, 200, spendingJson(queryValue(query, "account")));
            } else if ("POST".equals(method) && "/api/freeze".equals(path)) {
                bank.freeze(Json.field(body, "account"), Json.field(body, "pin"));
                send(exchange, 200, "{\"message\":\"Account frozen\"}");
            } else if ("POST".equals(method) && "/api/unfreeze".equals(path)) {
                bank.unfreeze(Json.field(body, "account"), Json.field(body, "pin"), Json.field(body, "phrase"));
                send(exchange, 200, "{\"message\":\"Account restored\"}");
            } else if ("POST".equals(method) && "/api/cooldown/cancel".equals(path)) {
                int id = (int) Json.num(body, "id");
                boolean ok = vault.cancel(id);
                send(exchange, 200, "{\"cancelled\":" + ok + "}");
            } else if ("POST".equals(method) && "/api/labs/race".equals(path)) {
                String log = ConsoleCapture.run(new Runnable() {
                    public void run() {
                        new RaceLab().runDemo();
                    }
                });
                send(exchange, 200, "{\"log\":" + Json.q(log) + "}");
            } else if ("POST".equals(method) && "/api/labs/priority".equals(path)) {
                send(exchange, 200, "{\"log\":" + Json.q(priorityDemo()) + "}");
            } else if ("POST".equals(method) && "/api/labs/freeze".equals(path)) {
                send(exchange, 200, "{\"log\":" + Json.q(freezeDemo()) + "}");
            } else {
                send(exchange, 404, "{\"error\":\"Unknown route " + path + "\"}");
            }
        } catch (Exception e) {
            String message = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
            send(exchange, 400, "{\"error\":" + Json.q(message) + "}");
        }
    }

    private void move(HttpExchange exchange, String body) throws IOException {
        final String rawType = Json.field(body, "type");
        final String type = rawType == null ? "" : rawType.trim().toUpperCase();
        final String from = Json.field(body, "fromAccount");
        final String to = Json.field(body, "toAccount");
        final double amount = Json.num(body, "amount");
        final String purpose = Json.field(body, "purpose");
        final String[] message = new String[1];
        String log = ConsoleCapture.run(new Runnable() {
            public void run() {
                TransactionRequest request = bank.buildRequest(type, from, to, amount, purpose);
                message[0] = bank.settle(request, false);
                System.out.println(message[0]);
            }
        });
        send(exchange, 200, "{\"message\":" + Json.q(message[0]) + ",\"log\":" + Json.q(log) + "}");
    }

    private String priorityDemo() {
        return ConsoleCapture.run(new Runnable() {
            public void run() {
                System.out.println("Priority clearing: SALARY should settle before BILL and UPI.");
                TransactionRequest upi = bank.buildRequest(TransactionRequest.TYPE_TRANSFER, "FG1001", "FG1003", 500, "upi snack");
                TransactionRequest bill = bank.buildRequest(TransactionRequest.TYPE_BILL, "FG1001", "FG1003", 1200, "electric bill");
                TransactionRequest salary = bank.buildRequest(TransactionRequest.TYPE_SALARY, "FG1003", "FG1001", 8000, "salary");
                Thread p1 = new Thread(new CustomerWorker("producer-UPI", house, new TransactionRequest[] { upi }), "producer-UPI");
                Thread p2 = new Thread(new CustomerWorker("producer-BILL-SALARY", house,
                        new TransactionRequest[] { bill, salary }), "producer-BILL-SALARY");
                p1.start();
                p2.start();
                try {
                    p1.join();
                    p2.join();
                    Thread.sleep(1200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
    }

    private String freezeDemo() {
        return ConsoleCapture.run(new Runnable() {
            public void run() {
                System.out.println("Workers withdraw from FG1002 while the account is frozen.");
                try {
                    TransactionRequest[] first = new TransactionRequest[] {
                            bank.buildRequest(TransactionRequest.TYPE_WITHDRAW, "FG1002", "", 100, "atm")
                    };
                    TransactionRequest[] second = new TransactionRequest[] {
                            bank.buildRequest(TransactionRequest.TYPE_WITHDRAW, "FG1002", "", 100, "atm")
                    };
                    Thread t1 = new Thread(new CustomerWorker("wd-1", house, first), "wd-1");
                    Thread t2 = new Thread(new CustomerWorker("wd-2", house, second), "wd-2");
                    t1.start();
                    bank.freeze("FG1002", "1234");
                    t2.start();
                    t1.join();
                    t2.join();
                    Thread.sleep(700);
                    bank.unfreeze("FG1002", "1234", "UNFREEZE");
                    System.out.println("Demo finished and FG1002 was unfrozen.");
                } catch (Exception e) {
                    System.out.println("Freeze demo failed: " + e.getMessage());
                }
            }
        });
    }

    private String overviewJson() {
        StringBuilder json = new StringBuilder();
        json.append("{\"tick\":").append(clock.now());
        json.append(",\"customers\":[");
        boolean first = true;
        for (Customer customer : bank.getCustomers().values()) {
            if (!first) {
                json.append(',');
            }
            first = false;
            json.append(customerJson(customer));
        }
        json.append("],\"accounts\":[");
        first = true;
        for (Account account : bank.getAccounts().values()) {
            if (!first) {
                json.append(',');
            }
            first = false;
            json.append(accountJson(account));
        }
        json.append("],\"cooldown\":").append(cooldownJson());
        json.append(",\"challenges\":").append(challengesJson());
        json.append('}');
        return json.toString();
    }

    private String customerJson(Customer customer) {
        StringBuilder accounts = new StringBuilder();
        accounts.append('[');
        ArrayList<String> numbers = customer.getAccountNumbers();
        for (int i = 0; i < numbers.size(); i++) {
            if (i > 0) {
                accounts.append(',');
            }
            accounts.append(Json.q(numbers.get(i)));
        }
        accounts.append(']');
        return "{\"id\":" + Json.q(customer.getCustomerId())
                + ",\"name\":" + Json.q(customer.getName())
                + ",\"personality\":" + Json.q(customer.getPersonality())
                + ",\"accounts\":" + accounts + "}";
    }

    private String accountJson(Account account) {
        double vault = 0;
        double overdraft = 0;
        if (account instanceof SavingsAccount) {
            vault = ((SavingsAccount) account).getVaultBalance();
        }
        if (account instanceof CurrentAccount) {
            overdraft = ((CurrentAccount) account).getOverdraftLimit();
        }
        return "{\"number\":" + Json.q(account.getAccountNumber())
                + ",\"holder\":" + Json.q(account.getHolderName())
                + ",\"customerId\":" + Json.q(account.getCustomerId())
                + ",\"type\":" + Json.q(account.getAccountType())
                + ",\"balance\":" + account.getBalance()
                + ",\"frozen\":" + account.isFrozen()
                + ",\"vault\":" + vault
                + ",\"overdraft\":" + overdraft
                + ",\"available\":" + account.availableLimit()
                + ",\"masked\":" + Json.q(account.maskNumber()) + "}";
    }

    private String cooldownJson() {
        ArrayList<TransactionRequest> held = vault.snapshot();
        StringBuilder json = new StringBuilder();
        json.append('[');
        for (int i = 0; i < held.size(); i++) {
            TransactionRequest request = held.get(i);
            if (i > 0) {
                json.append(',');
            }
            json.append("{\"id\":").append(request.getId())
                    .append(",\"type\":").append(Json.q(request.getType()))
                    .append(",\"amount\":").append(request.getAmount())
                    .append(",\"fromAccount\":").append(Json.q(request.getFromAccount()))
                    .append(",\"toAccount\":").append(Json.q(request.getToAccount()))
                    .append(",\"purpose\":").append(Json.q(request.getPurpose()))
                    .append(",\"priority\":").append(request.getPriority())
                    .append(",\"readyTick\":").append(request.getReadyTick())
                    .append('}');
        }
        json.append(']');
        return json.toString();
    }

    private String challengesJson() {
        ArrayList<SavingsChallenge> ranked = bank.getChallenges().ranked();
        StringBuilder json = new StringBuilder();
        json.append('[');
        for (int i = 0; i < ranked.size(); i++) {
            SavingsChallenge challenge = ranked.get(i);
            if (i > 0) {
                json.append(',');
            }
            json.append("{\"account\":").append(Json.q(challenge.getAccountNumber()))
                    .append(",\"title\":").append(Json.q(challenge.getTitle()))
                    .append(",\"progress\":").append(challenge.progressPercent())
                    .append(",\"streak\":").append(challenge.getStreak())
                    .append(",\"target\":").append(challenge.getWeeklyTarget())
                    .append(",\"weeks\":[");
            double[] weeks = challenge.getWeeks();
            for (int w = 0; w < weeks.length; w++) {
                if (w > 0) {
                    json.append(',');
                }
                json.append(weeks[w]);
            }
            json.append("]}");
        }
        json.append(']');
        return json.toString();
    }

    private String statementJson(String accountNo, String sort) throws AccountNotFoundException {
        Account account = bank.requireAccount(accountNo);
        ArrayList<Transaction> list = bank.statement(accountNo, sort);
        StringBuilder json = new StringBuilder();
        json.append("{\"account\":").append(accountJson(account)).append(",\"items\":[");
        for (int i = 0; i < list.size(); i++) {
            Transaction txn = list.get(i);
            if (i > 0) {
                json.append(',');
            }
            json.append("{\"id\":").append(txn.getId())
                    .append(",\"tick\":").append(txn.getTick())
                    .append(",\"type\":").append(Json.q(txn.getType()))
                    .append(",\"amount\":").append(txn.getAmount())
                    .append(",\"fromAccount\":").append(Json.q(txn.getFromAccount()))
                    .append(",\"toAccount\":").append(Json.q(txn.getToAccount()))
                    .append(",\"purpose\":").append(Json.q(txn.getPurpose()))
                    .append(",\"category\":").append(Json.q(txn.getCategory()))
                    .append(",\"status\":").append(Json.q(txn.getStatus()))
                    .append(",\"risk\":").append(txn.getRiskScore())
                    .append('}');
        }
        json.append("]}");
        return json.toString();
    }

    private String spendingJson(String accountNo) throws AccountNotFoundException {
        Account account = bank.requireAccount(accountNo);
        Customer customer = bank.requireCustomer(account.getCustomerId());
        SpendingIntelligence.ArrayReport report = bank.spendingReport(accountNo);
        HashMap<String, Double> spend = account.copyCategorySpend();
        HashMap<String, Double> budgets = customer.getCategoryBudgets();
        HashSet<String> keys = new HashSet<String>();
        keys.addAll(budgets.keySet());
        keys.addAll(spend.keySet());
        StringBuilder json = new StringBuilder();
        json.append("{\"personality\":").append(Json.q(report.personality))
                .append(",\"totalDebit\":").append(report.totalDebit)
                .append(",\"vault\":");
        if (account instanceof SavingsAccount) {
            json.append(((SavingsAccount) account).getVaultBalance());
        } else {
            json.append('0');
        }
        json.append(",\"categories\":[");
        boolean first = true;
        for (String key : keys) {
            if (!first) {
                json.append(',');
            }
            first = false;
            Double usedObj = spend.get(key);
            Double capObj = budgets.get(key);
            double used = usedObj == null ? 0 : usedObj.doubleValue();
            double cap = capObj == null ? 0 : capObj.doubleValue();
            json.append("{\"name\":").append(Json.q(key))
                    .append(",\"used\":").append(used)
                    .append(",\"budget\":").append(cap)
                    .append('}');
        }
        json.append("]}");
        return json.toString();
    }

    private String queryValue(String query, String key) {
        if (query == null) {
            return "";
        }
        String[] parts = query.split("&");
        for (int i = 0; i < parts.length; i++) {
            int eq = parts[i].indexOf('=');
            if (eq > 0 && parts[i].substring(0, eq).equals(key)) {
                return parts[i].substring(eq + 1);
            }
        }
        return "";
    }

    private String readBody(HttpExchange exchange) throws IOException {
        InputStream in = exchange.getRequestBody();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[1024];
        int n;
        while ((n = in.read(chunk)) >= 0) {
            buffer.write(chunk, 0, n);
        }
        return buffer.toString("UTF-8");
    }

    private void send(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.sendResponseHeaders(status, bytes.length);
        OutputStream out = exchange.getResponseBody();
        out.write(bytes);
        out.close();
    }
}
