package finguard.safety;

import java.util.HashMap;
import java.util.Map;

import finguard.model.Customer;

public class SpendingIntelligence {

    public String categorize(String purpose) {
        if (purpose == null) {
            return "OTHER";
        }
        String p = purpose.toLowerCase();
        if (p.indexOf("food") >= 0 || p.indexOf("swiggy") >= 0 || p.indexOf("zomato") >= 0
                || p.indexOf("grocery") >= 0) {
            return "FOOD";
        }
        if (p.indexOf("uber") >= 0 || p.indexOf("ola") >= 0 || p.indexOf("travel") >= 0
                || p.indexOf("fuel") >= 0) {
            return "TRAVEL";
        }
        if (p.indexOf("rent") >= 0 || p.indexOf("electric") >= 0 || p.indexOf("bill") >= 0
                || p.indexOf("wifi") >= 0) {
            return "BILLS";
        }
        if (p.indexOf("netflix") >= 0 || p.indexOf("movie") >= 0 || p.indexOf("game") >= 0) {
            return "ENTERTAINMENT";
        }
        if (p.indexOf("atm") >= 0 || p.indexOf("cash") >= 0) {
            return "ATM";
        }
        if (p.indexOf("transfer") >= 0 || p.indexOf("upi") >= 0) {
            return "TRANSFER";
        }
        return "OTHER";
    }

    public String personality(HashMap<String, Double> spend, double vault, double totalDebit) {
        if (totalDebit <= 0) {
            return "NEW";
        }
        double saveRate = vault / (totalDebit + vault);
        if (saveRate >= 0.20) {
            return "SAVER";
        }
        for (Map.Entry<String, Double> e : spend.entrySet()) {
            if (e.getValue().doubleValue() > 0.40 * totalDebit) {
                return "IMPULSE";
            }
        }
        return "BALANCED";
    }

    public ArrayReport report(Customer customer, HashMap<String, Double> spend, double vault) {
        ArrayReport r = new ArrayReport();
        double total = 0;
        for (Double v : spend.values()) {
            total += v.doubleValue();
        }
        r.totalDebit = total;
        r.lines = new String[spend.size() + 3];
        int i = 0;
        r.lines[i++] = "Spending report for " + customer.getName();
        for (Map.Entry<String, Double> e : spend.entrySet()) {
            String cat = e.getKey();
            double used = e.getValue().doubleValue();
            Double capObj = customer.getCategoryBudgets().get(cat);
            double cap = capObj == null ? 0 : capObj.doubleValue();
            String flag = "";
            if (cap > 0 && used > cap) {
                flag = "  ** OVER BUDGET **";
            } else if (cap > 0 && used > 0.8 * cap) {
                flag = "  (80% warning)";
            }
            String pct = total <= 0 ? "0" : String.valueOf((used * 100) / total);
            r.lines[i++] = "  " + cat + ": Rs." + used + " / budget Rs." + cap
                    + "  (" + pct + "% of debit)" + flag;
        }
        String p = personality(spend, vault, total);
        customer.setPersonality(p);
        r.lines[i++] = "Vault savings: Rs." + vault;
        r.lines[i] = "Spending personality: " + p;
        r.personality = p;
        return r;
    }

    public static class ArrayReport {
        public String[] lines;
        public String personality;
        public double totalDebit;
    }
}
