package com.example.tasquemanager.dto;

import com.example.tasquemanager.model.TaskPriority;
import com.example.tasquemanager.model.TaskStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Instant dueDate;
    private Instant createdAt;
    private Instant updatedAt;
    private Long version;
}