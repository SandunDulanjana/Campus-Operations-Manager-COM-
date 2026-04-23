package com.campusoperationsmanager.backend.notification.controller;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TestController {
    private final JavaMailSender mailSender;

    @GetMapping("/api/test-email")
    public String testEmail(@RequestParam String to) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("Test Email - Smart Campus");
            msg.setText("If you see this, the email system is working!");
            mailSender.send(msg);
            return "Email sent successfully to " + to;
        } catch (Exception e) {
            return "Failed: " + e.getMessage();
        }
    }
}
