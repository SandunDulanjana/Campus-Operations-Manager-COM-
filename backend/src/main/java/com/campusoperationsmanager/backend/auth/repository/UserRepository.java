package com.campusoperationsmanager.backend.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusoperationsmanager.backend.auth.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByResetKeyword(String resetKeyword); // ← NEW for forgot password
}