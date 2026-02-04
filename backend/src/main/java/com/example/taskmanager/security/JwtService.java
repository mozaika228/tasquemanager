package com.example.taskmanager.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessExpirationMinutes;
    private final long refreshExpirationMinutes;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.access-expiration-minutes}") long accessExpirationMinutes,
        @Value("${app.jwt.refresh-expiration-minutes}") long refreshExpirationMinutes
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(encodeIfNeeded(secret)));
        this.accessExpirationMinutes = accessExpirationMinutes;
        this.refreshExpirationMinutes = refreshExpirationMinutes;
    }

    public String generateAccessToken(UserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("type", "access")
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plusSeconds(accessExpirationMinutes * 60)))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public String generateRefreshToken(UserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .setSubject(user.getUsername())
            .claim("type", "refresh")
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plusSeconds(refreshExpirationMinutes * 60)))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public boolean isAccessTokenValid(String token, UserDetails user) {
        String username = extractUsername(token);
        return username.equals(user.getUsername()) && hasType(token, "access");
    }

    public boolean isRefreshTokenValid(String token, UserDetails user) {
        String username = extractUsername(token);
        return username.equals(user.getUsername()) && hasType(token, "refresh");
    }

    private boolean hasType(String token, String type) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
        Object claim = claims.get("type");
        return type.equals(claim);
    }

    private String encodeIfNeeded(String secret) {
        if (secret == null) {
            return "";
        }
        String trimmed = secret.trim();
        if (trimmed.matches("^[A-Za-z0-9+/=]+$") && trimmed.length() % 4 == 0) {
            return trimmed;
        }
        return java.util.Base64.getEncoder().encodeToString(trimmed.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
