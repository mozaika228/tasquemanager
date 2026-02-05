package com.example.taskmanager;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Set;
import java.time.LocalDate;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public Page<Task> getAll(
        TaskStatus status,
        TaskPriority priority,
        Boolean archived,
        String query,
        LocalDate dueDateFrom,
        LocalDate dueDateTo,
        String sortBy,
        String direction,
        int page,
        int size
    ) {
        Sort sort = buildSort(sortBy, direction);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Task> spec = buildSpec(status, priority, archived, query, dueDateFrom, dueDateTo);
        return repository.findAll(spec, pageable);
    }

    public Task getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    @Transactional
    public Task create(Task task) {
        task.setId(null);
        return repository.save(task);
    }

    @Transactional
    public Task update(Long id, Task updates) {
        Task existing = getById(id);
        existing.setTitle(updates.getTitle());
        existing.setDescription(updates.getDescription());
        existing.setStatus(updates.getStatus() == null ? existing.getStatus() : updates.getStatus());
        existing.setPriority(updates.getPriority() == null ? existing.getPriority() : updates.getPriority());
        existing.setAssignee(updates.getAssignee());
        existing.setTags(updates.getTags());
        existing.setEstimateHours(updates.getEstimateHours());
        if (updates.getArchived() != null) {
            existing.setArchived(updates.getArchived());
        }
        existing.setDueDate(updates.getDueDate());
        return repository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Task existing = getById(id);
        repository.delete(existing);
    }

    private Sort buildSort(String sortBy, String direction) {
        Set<String> allowed = Set.of("createdAt", "dueDate", "priority", "status", "title", "assignee");
        String property = allowed.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, property);
    }

    private Specification<Task> buildSpec(
        TaskStatus status,
        TaskPriority priority,
        Boolean archived,
        String query,
        LocalDate dueDateFrom,
        LocalDate dueDateTo
    ) {
        return (root, cq, cb) -> {
            var predicates = cb.conjunction();

            if (status != null) {
                predicates.getExpressions().add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.getExpressions().add(cb.equal(root.get("priority"), priority));
            }
            if (archived != null) {
                predicates.getExpressions().add(cb.equal(root.get("archived"), archived));
            }
            if (query != null && !query.isBlank()) {
                String like = "%" + query.trim().toLowerCase() + "%";
                var titleLike = cb.like(cb.lower(root.get("title")), like);
                var descLike = cb.like(cb.lower(root.get("description")), like);
                predicates.getExpressions().add(cb.or(titleLike, descLike));
            }
            if (dueDateFrom != null) {
                predicates.getExpressions().add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateFrom));
            }
            if (dueDateTo != null) {
                predicates.getExpressions().add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateTo));
            }

            return predicates;
        };
    }
}
