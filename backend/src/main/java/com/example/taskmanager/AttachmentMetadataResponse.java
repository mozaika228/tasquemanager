package com.example.taskmanager;

import java.time.LocalDateTime;

public record AttachmentMetadataResponse(
    Long id,
    String fileName,
    String contentType,
    long size,
    LocalDateTime createdAt
) {
    static AttachmentMetadataResponse from(TaskAttachment a) {
        return new AttachmentMetadataResponse(a.getId(), a.getFileName(), a.getContentType(), a.getSize(), a.getCreatedAt());
    }
}
