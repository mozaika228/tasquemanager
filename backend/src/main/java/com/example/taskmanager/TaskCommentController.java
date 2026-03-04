package com.example.taskmanager;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class TaskCommentController {

    private final TaskCommentService commentService;

    public TaskCommentController(TaskCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponse> list(@PathVariable Long taskId) {
        return commentService.list(taskId);
    }

    @PostMapping
    public CommentResponse create(@PathVariable Long taskId, @Valid @RequestBody CommentRequest request) {
        return commentService.create(taskId, request);
    }
}
