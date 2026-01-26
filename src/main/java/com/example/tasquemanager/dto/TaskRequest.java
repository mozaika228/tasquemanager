package com.example.tasquemanager.dto;

import com.example.tasquemanager.model.TaskPriority;
import com.example.tasquemanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private Instant dueDate;
}