package com.example.taskmanager;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository, org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public List<Notification> findByRecipient(String recipient) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient);
    }

    public Notification markAsRead(Long id, String recipient) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        if (!n.getRecipient().equals(recipient)) {
            throw new IllegalArgumentException("Notification does not belong to current user");
        }
        n.setReadFlag(true);
        return notificationRepository.save(n);
    }

    public void createInApp(String recipient, NotificationType type, String message, String sourceKey) {
        if (sourceKey != null && notificationRepository.existsBySourceKey(sourceKey)) {
            return;
        }
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        n.setMessage(message);
        n.setSourceKey(sourceKey);
        notificationRepository.save(n);
    }

    public void sendEmailIfConfigured(String recipientEmail, String subject, String body) {
        if (mailSender == null || recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ignored) {
            // Optional channel: never break the request on email transport errors.
        }
    }
}
