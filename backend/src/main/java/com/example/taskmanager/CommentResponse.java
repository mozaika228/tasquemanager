package com.example.taskmanager;

import java.time.LocalDateTime;

public record CommentResponse(
    Long id,
    String author,
    String content,
    String mentions,
    LocalDateTime createdAt
) {
    static CommentResponse from(TaskComment c) {
        return new CommentResponse(c.getId(), c.getAuthor(), c.getContent(), c.getMentions(), c.getCreatedAt());
    }
}
