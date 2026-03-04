package com.example.taskmanager;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class OverdueNotificationScheduler {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public OverdueNotificationScheduler(TaskRepository taskRepository, NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 */30 * * * *")
    public void notifyOverdueTasks() {
        List<Task> overdue = taskRepository.findByArchivedFalseAndStatusNotAndDueDateBefore(TaskStatus.DONE, LocalDate.now());
        String date = LocalDate.now().toString();
        for (Task task : overdue) {
            String recipient = task.getAssignee() == null || task.getAssignee().isBlank() ? "admin" : task.getAssignee();
            String message = "Task #" + task.getId() + " is overdue: " + task.getTitle();
            notificationService.createInApp(recipient, NotificationType.OVERDUE, message, "OVERDUE:" + task.getId() + ":" + date);
            notificationService.sendEmailIfConfigured(recipient, "Overdue task", message);
        }
    }
}
