package com.example.taskmanager;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskExportServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskExportService exportService;

    @Test
    void exportCsv_containsHeaderAndTaskRows() {
        Task t = new Task();
        t.setId(1L);
        t.setTitle("Demo");
        t.setStatus(TaskStatus.TODO);
        t.setPriority(TaskPriority.HIGH);
        t.setAssignee("admin");
        t.setArchived(false);

        when(taskRepository.findAll()).thenReturn(List.of(t));

        String csv = new String(exportService.exportCsv());

        assertThat(csv).contains("id,title,status");
        assertThat(csv).contains("Demo");
        assertThat(csv).contains("TODO");
    }

    @Test
    void exportPdf_returnsBinaryContent() {
        when(taskRepository.findAll()).thenReturn(List.of());
        byte[] pdf = exportService.exportPdf();
        assertThat(pdf).isNotEmpty();
    }
}
