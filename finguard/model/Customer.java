package finguard.model;

import java.util.ArrayList;
import java.util.HashMap;

public class Customer {
    private String customerId;
    private String name;
    private String pin;
    private ArrayList<String> accountNumbers;
    private HashMap<String, Double> categoryBudgets;
    private String personality;

    public Customer(String customerId, String name, String pin) {
        this.customerId = customerId;
        this.name = name;
        this.pin = pin;
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
        return pin.equals(entered);
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
