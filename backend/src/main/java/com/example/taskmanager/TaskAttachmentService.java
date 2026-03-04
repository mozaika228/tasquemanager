package com.example.taskmanager;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class TaskAttachmentService {

    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository attachmentRepository;

    public TaskAttachmentService(TaskRepository taskRepository, TaskAttachmentRepository attachmentRepository) {
        this.taskRepository = taskRepository;
        this.attachmentRepository = attachmentRepository;
    }

    public List<AttachmentMetadataResponse> list(Long taskId) {
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
            .map(AttachmentMetadataResponse::from)
            .toList();
    }

    public AttachmentMetadataResponse upload(Long taskId, MultipartFile file) throws IOException {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new TaskNotFoundException(taskId));
        TaskAttachment attachment = new TaskAttachment();
        attachment.setTask(task);
        attachment.setFileName(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        attachment.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        attachment.setSize(file.getSize());
        attachment.setData(file.getBytes());
        return AttachmentMetadataResponse.from(attachmentRepository.save(attachment));
    }

    public TaskAttachment get(Long id) {
        return attachmentRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }
}
