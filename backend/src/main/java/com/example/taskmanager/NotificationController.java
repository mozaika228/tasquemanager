package com.example.taskmanager;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> list(Authentication authentication) {
        return notificationService.findByRecipient(authentication.getName());
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id, Authentication authentication) {
        return notificationService.markAsRead(id, authentication.getName());
    }
}
