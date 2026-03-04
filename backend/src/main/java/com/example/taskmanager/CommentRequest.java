package com.example.taskmanager;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
    @NotBlank @Size(max = 80) String author,
    @NotBlank @Size(max = 1000) String content
) {}
