INSERT INTO tasks (title, description, status, priority, assignee, tags, estimate_hours, archived, due_date, created_at, updated_at) VALUES
('Setup project', 'Initialize Spring Boot and React apps', 'DONE', 'MEDIUM', 'Alex', 'setup,backend', 3, false, '2026-02-01', NOW(), NOW()),
('Implement CRUD', 'Create Task entity, repository, service, controller', 'IN_PROGRESS', 'HIGH', 'Mira', 'api,backend', 8, false, '2026-02-05', NOW(), NOW()),
('Add security', 'JWT auth and role-based access', 'TODO', 'LOW', 'Sam', 'security,auth', 5, false, '2026-02-10', NOW(), NOW());
