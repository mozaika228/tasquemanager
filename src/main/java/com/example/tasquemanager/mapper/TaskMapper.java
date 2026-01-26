package com.example.tasquemanager.mapper;

import com.example.tasquemanager.dto.TaskRequest;
import com.example.tasquemanager.dto.TaskResponse;
import com.example.tasquemanager.model.Task;

public final class TaskMapper {

    private TaskMapper() {}

    public static Task toEntity(TaskRequest r) {
        if (r == null) return null;
        return Task.builder()
                .title(r.getTitle())
                .description(r.getDescription())
                .status(r.getStatus())
                .priority(r.getPriority())
                .dueDate(r.getDueDate())
                .build();
    }

    public static TaskResponse toDto(Task t) {
        if (t == null) return null;
        return TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .dueDate(t.getDueDate())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .version(t.getVersion())
                .build();
    }
}