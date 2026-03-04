package com.example.taskmanager;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TaskCommentService {

    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9_.-]{2,80})");

    private final TaskRepository taskRepository;
    private final TaskCommentRepository commentRepository;
    private final NotificationService notificationService;

    public TaskCommentService(TaskRepository taskRepository, TaskCommentRepository commentRepository, NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    public List<CommentResponse> list(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream().map(CommentResponse::from).toList();
    }

    public CommentResponse create(Long taskId, CommentRequest request) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new TaskNotFoundException(taskId));

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(request.author());
        comment.setContent(request.content());

        List<String> mentions = extractMentions(request.content());
        comment.setMentions(String.join(",", mentions));

        TaskComment saved = commentRepository.save(comment);

        for (String mention : mentions) {
            notificationService.createInApp(
                mention,
                NotificationType.MENTION,
                "You were mentioned in task #" + taskId + " by " + request.author(),
                "MENTION:" + saved.getId() + ":" + mention
            );
        }

        return CommentResponse.from(saved);
    }

    private List<String> extractMentions(String text) {
        Matcher matcher = MENTION_PATTERN.matcher(text);
        var mentions = new java.util.LinkedHashSet<String>();
        while (matcher.find()) {
            mentions.add(matcher.group(1));
        }
        return mentions.stream().collect(Collectors.toList());
    }
}
