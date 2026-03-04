package com.example.taskmanager;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks/export")
public class TaskExportController {

    private final TaskExportService exportService;

    public TaskExportController(TaskExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping(value = "/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] body = exportService.exportCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tasks.csv")
            .body(body);
    }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf() {
        byte[] body = exportService.exportPdf();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tasks.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(body);
    }
}
