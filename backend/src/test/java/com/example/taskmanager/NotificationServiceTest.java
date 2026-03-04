package com.example.taskmanager;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void markAsRead_setsFlagForRecipient() {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setRecipient("user");

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsRead(1L, "user");

        assertTrue(result.isReadFlag());
        verify(notificationRepository).save(notification);
    }

    @Test
    void createInApp_skipsDuplicateSourceKey() {
        when(notificationRepository.existsBySourceKey("KEY-1")).thenReturn(true);

        notificationService.createInApp("user", NotificationType.MENTION, "msg", "KEY-1");

        verify(notificationRepository, never()).save(any(Notification.class));
    }
}