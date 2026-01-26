package com.example.tasquemanager.service;

import com.example.tasquemanager.dto.TaskRequest;
import com.example.tasquemanager.dto.TaskResponse;
import com.example.tasquemanager.model.TaskPriority;
import com.example.tasquemanager.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public interface TaskService {
    TaskResponse create(TaskRequest request);
    TaskResponse getById(UUID id);
    Page<TaskResponse> list(TaskStatus status, TaskPriority priority, String q, Instant dueBefore, Instant dueAfter, Pageable pageable);
    TaskResponse update(UUID id, TaskRequest request);
    TaskResponse partialUpdate(UUID id, Map<String, Object> updates);
    void delete(UUID id);
}