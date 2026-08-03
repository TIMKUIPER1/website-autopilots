begin;

alter table audit.events drop constraint events_result_check;
alter table audit.events add constraint events_result_check check (
  result in ('requested', 'succeeded', 'failed', 'rejected', 'blocked', 'approved')
) not valid;
alter table audit.events validate constraint events_result_check;

commit;
