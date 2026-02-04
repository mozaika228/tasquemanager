package com.example.taskmanager;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Set;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> getAll(TaskStatus status, TaskPriority priority, String sortBy, String direction) {
        Sort sort = buildSort(sortBy, direction);

        if (status != null && priority != null) {
            return repository.findByStatusAndPriority(status, priority, sort);
        }
        if (status != null) {
            return repository.findByStatus(status, sort);
        }
        if (priority != null) {
            return repository.findByPriority(priority, sort);
        }
        return repository.findAll(sort);
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
        existing.setDueDate(updates.getDueDate());
        return repository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Task existing = getById(id);
        repository.delete(existing);
    }

    private Sort buildSort(String sortBy, String direction) {
        Set<String> allowed = Set.of("createdAt", "dueDate", "priority", "status", "title");
        String property = allowed.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, property);
    }
}
