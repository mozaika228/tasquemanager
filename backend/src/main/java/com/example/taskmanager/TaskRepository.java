package com.example.taskmanager;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status, Sort sort);

    List<Task> findByPriority(TaskPriority priority, Sort sort);

    List<Task> findByStatusAndPriority(TaskStatus status, TaskPriority priority, Sort sort);
}
