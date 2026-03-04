create table if not exists task_comments (
    id bigserial primary key,
    task_id bigint not null references tasks(id) on delete cascade,
    author varchar(80) not null,
    content varchar(1000) not null,
    mentions varchar(255),
    created_at timestamp not null default current_timestamp
);

create index if not exists idx_task_comments_task_id on task_comments(task_id);

create table if not exists task_attachments (
    id bigserial primary key,
    task_id bigint not null references tasks(id) on delete cascade,
    file_name varchar(255) not null,
    content_type varchar(120) not null,
    size bigint not null,
    data bytea not null,
    created_at timestamp not null default current_timestamp
);

create index if not exists idx_task_attachments_task_id on task_attachments(task_id);

create table if not exists notifications (
    id bigserial primary key,
    recipient varchar(80) not null,
    type varchar(20) not null,
    message varchar(500) not null,
    read_flag boolean not null default false,
    source_key varchar(120) unique,
    created_at timestamp not null default current_timestamp
);

create index if not exists idx_notifications_recipient on notifications(recipient);


