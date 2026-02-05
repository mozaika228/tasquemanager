package com.example.taskmanager.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class RefreshTokenStore {

    private final ConcurrentHashMap<String, String> userToToken = new ConcurrentHashMap<>();

    public void store(String username, String refreshToken) {
        if (username == null || refreshToken == null) {
            return;
        }
        userToToken.put(username, refreshToken);
    }

    public boolean isValid(String username, String refreshToken) {
        if (username == null || refreshToken == null) {
            return false;
        }
        String stored = userToToken.get(username);
        return refreshToken.equals(stored);
    }

    public void revoke(String username) {
        if (username != null) {
            userToToken.remove(username);
        }
    }
}
