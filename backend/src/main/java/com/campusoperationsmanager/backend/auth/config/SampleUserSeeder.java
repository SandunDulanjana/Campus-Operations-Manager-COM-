package com.campusoperationsmanager.backend.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.repository.UserRepository;

@Configuration
public class SampleUserSeeder {

    private static final String SAMPLE_USERNAME = "demo_student";
    private static final String SAMPLE_EMAIL = "demo.student@smartcampus.local";
    private static final String SAMPLE_PASSWORD = "Student@123";

    @Bean
    CommandLineRunner seedSampleUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername(SAMPLE_USERNAME).isPresent()
                || userRepository.findByEmail(SAMPLE_EMAIL).isPresent()) {
                return;
            }

            User user = User.builder()
                .username(SAMPLE_USERNAME)
                .email(SAMPLE_EMAIL)
                .name("Demo Student")
                .password(passwordEncoder.encode(SAMPLE_PASSWORD))
                .role(User.Role.USER)
                .enabled(true)
                .build();

            userRepository.save(user);
        };
    }
}
