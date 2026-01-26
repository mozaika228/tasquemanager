CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status NOT NULL,
  priority task_priority NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);