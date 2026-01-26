package com.example.tasquemanager.service.impl;

import com.example.tasquemanager.dto.TaskRequest;
import com.example.tasquemanager.dto.TaskResponse;
import com.example.tasquemanager.exception.ResourceNotFoundException;
import com.example.tasquemanager.mapper.TaskMapper;
import com.example.tasquemanager.model.Task;
import com.example.tasquemanager.model.TaskPriority;
import com.example.tasquemanager.model.TaskStatus;
import com.example.tasquemanager.repository.TaskRepository;
import com.example.tasquemanager.service.TaskService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository repo;

    @Autowired
    public TaskServiceImpl(TaskRepository repo) {
        this.repo = repo;
    }

    @Override
    public TaskResponse create(TaskRequest request) {
        Task entity = TaskMapper.toEntity(request);
        Task saved = repo.save(entity);
        return TaskMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getById(UUID id) {
        Task t = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        return TaskMapper.toDto(t);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> list(TaskStatus status, TaskPriority priority, String q, Instant dueBefore, Instant dueAfter, Pageable pageable) {
        Specification<Task> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }
            if (dueBefore != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueBefore));
            }
            if (dueAfter != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueAfter));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Task> page = repo.findAll(spec, pageable);
        List<TaskResponse> dtos = page.stream().map(TaskMapper::toDto).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Override
    public TaskResponse update(UUID id, TaskRequest request) {
        Task existing = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        // Full update: replace fields
        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setStatus(request.getStatus() != null ? request.getStatus() : existing.getStatus());
        existing.setPriority(request.getPriority());
        existing.setDueDate(request.getDueDate());
        Task saved = repo.save(existing);
        return TaskMapper.toDto(saved);
    }

    @Override
    public TaskResponse partialUpdate(UUID id, Map<String, Object> updates) {
        Task existing = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        // Simple, pragmatic partial update
        if (updates.containsKey("title")) existing.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) existing.setDescription((String) updates.get("description"));
        if (updates.containsKey("status")) {
            existing.setStatus(TaskStatus.valueOf(((String) updates.get("status")).toUpperCase()));
        }
        if (updates.containsKey("priority")) {
            existing.setPriority(TaskPriority.valueOf(((String) updates.get("priority")).toUpperCase()));
        }
        if (updates.containsKey("dueDate")) {
            Object v = updates.get("dueDate");
            if (v instanceof String) {
                existing.setDueDate(Instant.parse((String) v));
            }
        }
        Task saved = repo.save(existing);
        return TaskMapper.toDto(saved);
    }

    @Override
    public void delete(UUID id) {
        Task existing = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        repo.delete(existing);
    }
}