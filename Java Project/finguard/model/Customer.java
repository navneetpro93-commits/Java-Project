package finguard.model;

import java.util.ArrayList;
import java.util.HashMap;

public class Customer {
    private String customerId;
    private String username;
    private String password;
    private String name;
    private String pin;
    private ArrayList<String> accountNumbers;
    private HashMap<String, Double> categoryBudgets;
    private String personality;

    public Customer(String customerId, String name, String pin) {
        this(customerId, name != null ? name.toLowerCase().replaceAll("\\s+", "") : customerId, pin, name);
    }

    public Customer(String customerId, String username, String password, String name) {
        this.customerId = customerId;
        this.username = username != null ? username.trim() : "";
        this.password = password != null ? password : "";
        this.name = name != null ? name.trim() : this.username;
        this.pin = this.password;
        this.accountNumbers = new ArrayList<String>();
        this.categoryBudgets = new HashMap<String, Double>();
        this.categoryBudgets.put("FOOD", 4000.0);
        this.categoryBudgets.put("TRAVEL", 3000.0);
        this.categoryBudgets.put("BILLS", 8000.0);
        this.categoryBudgets.put("ENTERTAINMENT", 2000.0);
        this.categoryBudgets.put("ATM", 5000.0);
        this.categoryBudgets.put("TRANSFER", 20000.0);
        this.categoryBudgets.put("OTHER", 5000.0);
        this.personality = "NEW";
    }

    public boolean checkPin(String entered) {
        if (entered == null) return false;
        String e = entered.trim();
        return (pin != null && pin.equalsIgnoreCase(e)) || (password != null && password.equalsIgnoreCase(e));
    }

    public boolean checkPassword(String entered) {
        return checkPin(entered);
    }

    public String getUsername() {
        return username != null && !username.isEmpty() ? username : customerId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password != null ? password : pin;
    }

    public void setPassword(String password) {
        this.password = password;
        this.pin = password;
    }

    public void addAccountNumber(String accountNumber) {
        accountNumbers.add(accountNumber);
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPin() {
        return pin;
    }

    public ArrayList<String> getAccountNumbers() {
        return accountNumbers;
    }

    public HashMap<String, Double> getCategoryBudgets() {
        return categoryBudgets;
    }

    public void setBudget(String category, double amount) {
        categoryBudgets.put(category.toUpperCase(), amount);
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }
}
