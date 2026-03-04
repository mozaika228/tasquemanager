package com.example.taskmanager;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskCommentServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskCommentRepository commentRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TaskCommentService service;

    @Test
    void create_extractsMentions_andPublishesNotifications() {
        Task task = new Task();
        task.setId(7L);
        when(taskRepository.findById(7L)).thenReturn(Optional.of(task));

        when(commentRepository.save(any(TaskComment.class))).thenAnswer(invocation -> {
            TaskComment c = invocation.getArgument(0);
            c.setId(42L);
            return c;
        });

        CommentResponse response = service.create(7L, new CommentRequest("admin", "Hello @user and @qa-team"));

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.mentions()).contains("user").contains("qa-team");

        verify(notificationService, times(2)).createInApp(anyString(), eq(NotificationType.MENTION), contains("mentioned"), contains("MENTION:42"));

        ArgumentCaptor<TaskComment> captor = ArgumentCaptor.forClass(TaskComment.class);
        verify(commentRepository).save(captor.capture());
        assertThat(captor.getValue().getMentions()).contains("user").contains("qa-team");
    }
}
