package com.campusoperationsmanager.backend.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusoperationsmanager.backend.auth.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);   // WHY: prevents duplicate username on createPendingUser
    // WHY: invite validate + complete endpoints look up the pending user by token.
    List<User> findByRegistrationStatus(User.RegistrationStatus status);
    Optional<User> findByInviteToken(String inviteToken);
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByResetKeyword(String resetKeyword); // ← NEW for forgot password
}