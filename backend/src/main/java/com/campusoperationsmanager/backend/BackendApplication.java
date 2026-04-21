package com.campusoperationsmanager.backend;

import java.sql.Connection;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            Connection connection = dataSource.getConnection();
            System.out.println("✅ Neon PostgreSQL connection successful!");
            System.out.println("📦 Database: " + connection.getCatalog());
            connection.close();
        } catch (Exception e) {
            System.out.println("❌ Neon connection failed: " + e.getMessage());
        }
    }
}