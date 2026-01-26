package com.example.tasquemanager.web;

import com.example.tasquemanager.dto.TaskRequest;
import com.example.tasquemanager.dto.TaskResponse;
import com.example.tasquemanager.model.TaskPriority;
import com.example.tasquemanager.model.TaskStatus;
import com.example.tasquemanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@Validated
public class TaskController {

    private final TaskService svc;

    @Autowired
    public TaskController(TaskService svc) {
        this.svc = svc;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        TaskResponse created = svc.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<TaskResponse>> list(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Instant dueBefore,
            @RequestParam(required = false) Instant dueAfter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        // build Pageable - support sort param like sort=dueDate,asc
        Sort sortObj = Sort.by(Sort.Order.desc("createdAt"));
        if (sort != null && sort.length > 0) {
            String[] parts = sort[0].split(",");
            if (parts.length == 2) {
                sortObj = Sort.by(Sort.Direction.fromString(parts[1]), parts[0]);
            } else {
                sortObj = Sort.by(parts[0]);
            }
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<TaskResponse> result = svc.list(status, priority, q, dueBefore, dueAfter, pageable);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(svc.update(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponse> partialUpdate(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(svc.partialUpdate(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }
}