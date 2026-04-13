package com.campusoperationsmanager.backend.auth.service;

import com.campusoperationsmanager.backend.auth.dto.UserDTO;
import com.campusoperationsmanager.backend.auth.model.User;
import com.campusoperationsmanager.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateRole(Long userId, String newRole) {
        User user = getUserById(userId);
        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        log.info("Role updated → user: {} role: {}", user.getEmail(), newRole);
        return userRepository.save(user);
    }

    public void deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User deactivated: {}", user.getEmail());
    }

    // Called by OAuth2AuthenticationSuccessHandler on Google login
    public User findOrCreateUser(String email, String name,
                                  String googleId, String picture) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("New user via Google: {}", email);
                    return userRepository.save(
                            User.builder()
                                    .email(email)
                                    .name(name)
                                    .googleId(googleId)
                                    .profilePicture(picture)
                                    .role(User.Role.USER)
                                    .build()
                    );
                });
    }

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}