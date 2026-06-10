-- Performance indexes
create index if not exists idx_projects_responsible on projects(responsible_id);
create index if not exists idx_projects_client on projects(client_id);
create index if not exists idx_stages_project on stages(project_id);
create index if not exists idx_diaries_project on diaries(project_id);
create index if not exists idx_nonconformities_project on nonconformities(project_id);
create index if not exists idx_payments_project on payments(project_id);
create index if not exists idx_payments_vencimento on payments(data_vencimento);
create index if not exists idx_documents_project on documents(project_id);
create index if not exists idx_messages_project on messages(project_id);
create index if not exists idx_notifications_user on notifications(user_id, lido);

-- Idempotency uniqueness (partial index — only when key is present)
create unique index if not exists idx_diaries_idempotency on diaries(idempotency_key) where idempotency_key is not null;
create unique index if not exists idx_messages_idempotency on messages(idempotency_key) where idempotency_key is not null;

-- Safe defaults for nullable progress columns
alter table stages alter column progresso set default 0;
alter table projects alter column progresso set default 0;
