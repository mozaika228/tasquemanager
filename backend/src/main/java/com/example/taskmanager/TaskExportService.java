package com.example.taskmanager;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class TaskExportService {

    private final TaskRepository taskRepository;

    public TaskExportService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public byte[] exportCsv() {
        List<Task> tasks = taskRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,title,status,priority,assignee,dueDate,archived");
        sb.append('\n');
        for (Task t : tasks) {
            sb.append(t.getId()).append(',')
                .append(csv(t.getTitle())).append(',')
                .append(t.getStatus()).append(',')
                .append(t.getPriority()).append(',')
                .append(csv(t.getAssignee())).append(',')
                .append(t.getDueDate() == null ? "" : t.getDueDate()).append(',')
                .append(Boolean.TRUE.equals(t.getArchived()));
            sb.append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportPdf() {
        List<Task> tasks = taskRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("Task export"));
            document.add(new Paragraph(" "));
            for (Task t : tasks) {
                document.add(new Paragraph("#" + t.getId() + " " + t.getTitle() + " [" + t.getStatus() + "]"));
            }
            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new IllegalStateException("Failed to export PDF", e);
        }
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
