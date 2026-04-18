package com.campusoperationsmanager.backend.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

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

    /**
 * Generates a short-lived (5 min) token for 2FA pending state.
 * This is NOT a full auth token — it only has scope "pending_2fa".
 */
public String generatePendingTwoFactorToken(Long userId) {
    return Jwts.builder()
            .claim("userId", userId)
            .claim("scope", "pending_2fa")
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + 5 * 60 * 1000L))
            .signWith(getSigningKey())
            .compact();
}

/**
 * Extracts userId from a pending 2FA token.
 * Returns null if the token is invalid, expired, or not a pending_2fa token.
 */
public Long extractUserIdFromPendingToken(String token) {
    try {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        if (!"pending_2fa".equals(claims.get("scope", String.class))) {
            return null;
        }
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Integer) return ((Integer) userIdObj).longValue();
        if (userIdObj instanceof Long)    return (Long) userIdObj;
        return null;
    } catch (Exception e) {
        return null;
    }
    }
            /**
         * Generates a 30-minute token for a brand-new Google user who has not yet
         * submitted their University ID. Carries Google profile info so the frontend
         * can POST it together with the University ID without re-doing OAuth.
         */
        public String generatePendingRegistrationToken(String email, String googleId,
                                                        String name, String picture) {
            return Jwts.builder()
                    .claim("email",    email)
                    .claim("googleId", googleId)
                    .claim("name",     name != null ? name : "")
                    .claim("picture",  picture != null ? picture : "")
                    .claim("scope",    "pending_registration")
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000L))
                    .signWith(getSigningKey())
                    .compact();
        }

        /**
         * Extracts Google profile info from a pending-registration token.
         * Returns null if invalid, expired, or wrong scope.
         */
        public java.util.Map<String, String> extractPendingRegistrationInfo(String token) {
            try {
                Claims claims = Jwts.parser().verifyWith(getSigningKey()).build()
                        .parseSignedClaims(token).getPayload();
                if (!"pending_registration".equals(claims.get("scope", String.class))) return null;
                java.util.Map<String, String> info = new java.util.HashMap<>();
                info.put("email",    claims.get("email",    String.class));
                info.put("googleId", claims.get("googleId", String.class));
                info.put("name",     claims.get("name",     String.class));
                info.put("picture",  claims.get("picture",  String.class));
                return info;
            } catch (Exception e) {
                return null;
            }
        }
    
}