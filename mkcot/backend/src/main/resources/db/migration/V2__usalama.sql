-- MKCOT toleo la 2.1: usalama wa akaunti na kumbukumbu za ukaguzi (audit log)

-- token_version: inaongezeka neno la siri likibadilishwa, hivyo tokeni zote za zamani zinakufa mara moja.
-- failed_logins / locked_until: akaunti inafungwa kwa muda baada ya majaribio mengi mabaya ya kuingia.
alter table app_user add column token_version  integer     not null default 0;
alter table app_user add column failed_logins  integer     not null default 0;
alter table app_user add column locked_until   timestamptz;
alter table app_user add column last_login_at  timestamptz;

-- Kila badiliko la data na kila tukio la usalama linaandikwa hapa (nani, lini, nini, kutoka wapi).
create table audit_log (
  id          bigserial    primary key,
  at          timestamptz  not null default now(),
  user_id     varchar(40),
  user_email  varchar(200),
  action      varchar(40)  not null,
  target      varchar(40),
  target_id   varchar(40),
  ip          varchar(64),
  detail      varchar(500)
);
create index audit_log_at_idx on audit_log (at desc);
