package com.example.taskmanager;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/attachments")
public class TaskAttachmentController {

    private final TaskAttachmentService attachmentService;

    public TaskAttachmentController(TaskAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @GetMapping
    public List<AttachmentMetadataResponse> list(@PathVariable Long taskId) {
        return attachmentService.list(taskId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AttachmentMetadataResponse upload(@PathVariable Long taskId, @RequestPart("file") MultipartFile file) throws IOException {
        return attachmentService.upload(taskId, file);
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<byte[]> download(@PathVariable Long taskId, @PathVariable Long attachmentId) {
        TaskAttachment attachment = attachmentService.get(attachmentId);
        if (!attachment.getTask().getId().equals(taskId)) {
            throw new TaskNotFoundException(attachmentId);
        }
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
            .contentType(MediaType.parseMediaType(attachment.getContentType()))
            .body(attachment.getData());
    }
}
