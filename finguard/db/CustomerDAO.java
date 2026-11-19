package finguard.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;

import finguard.model.Customer;

/**
 * Topics 19-20: Statement/PreparedStatement, Parameter binding, and CRUD with ResultSet.
 */
public class CustomerDAO {

    public void save(Customer customer) throws SQLException {
        String sql = "INSERT INTO customers (customer_id, name, pin, personality) "
                + "VALUES (?, ?, ?, ?) "
                + "ON DUPLICATE KEY UPDATE name = VALUES(name), pin = VALUES(pin), personality = VALUES(personality)";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, customer.getCustomerId());
        ps.setString(2, customer.getName());
        ps.setString(3, customer.getPin());
        ps.setString(4, customer.getPersonality());
        ps.executeUpdate();
        ps.close();
        conn.close();
    }

    public Customer findById(String customerId) throws SQLException {
        String sql = "SELECT customer_id, name, pin, personality FROM customers WHERE customer_id = ?";
        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, customerId);
        ResultSet rs = ps.executeQuery();

        Customer customer = null;
        if (rs.next()) {
            customer = new Customer(
                    rs.getString("customer_id"),
                    rs.getString("name"),
                    rs.getString("pin"));
            customer.setPersonality(rs.getString("personality"));
        }
        rs.close();
        ps.close();
        conn.close();
        return customer;
    }

    public HashMap<String, Customer> findAll() throws SQLException {
        String sql = "SELECT customer_id, name, pin, personality FROM customers";
        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ResultSet rs = ps.executeQuery();

        HashMap<String, Customer> map = new HashMap<String, Customer>();
        while (rs.next()) {
            Customer c = new Customer(
                    rs.getString("customer_id"),
                    rs.getString("name"),
                    rs.getString("pin"));
            c.setPersonality(rs.getString("personality"));
            map.put(c.getCustomerId(), c);
        }
        rs.close();
        ps.close();
        conn.close();
        return map;
    }

    public void delete(String customerId) throws SQLException {
        String sql = "DELETE FROM customers WHERE customer_id = ?";
        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, customerId);
        ps.executeUpdate();
        ps.close();
        conn.close();
    }
}
