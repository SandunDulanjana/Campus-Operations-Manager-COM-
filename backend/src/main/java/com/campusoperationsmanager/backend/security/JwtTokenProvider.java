package com.campusoperationsmanager.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${application.security.jwt.secret-key}")
    private String jwtSecret;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        return Long.valueOf(
                Jwts.parser().verifyWith(getSigningKey()).build()
                        .parseSignedClaims(token).getPayload().getSubject()
        );
    }

    public String getRoleFromToken(String token) {
        return (String) Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload().get("role");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("JWT invalid: {}", e.getMessage());
        }
        return false;
    }
}