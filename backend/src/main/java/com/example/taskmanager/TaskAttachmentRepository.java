package com.example.taskmanager;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, Long> {
    List<TaskAttachment> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}
