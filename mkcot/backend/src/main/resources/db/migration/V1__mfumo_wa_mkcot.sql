-- MKCOT (Mfuko wa Kuhani wa Operation and Training): majedwali ya PostgreSQL.
-- Flyway inaendesha faili hili mara ya kwanza backend inapowaka.

-- Watumiaji wa mfumo na nafasi zao
create table app_user (
  id            varchar(40) primary key,
  email         varchar(200) not null unique,
  password_hash varchar(100) not null,
  full_name     varchar(200),
  role          varchar(20)  not null default 'anasubiri'
                check (role in ('anasubiri','mwanachama','malipo','katibu','mhazini','msomaji','msimamizi')),
  member_id     varchar(40),
  created_at    timestamptz  not null default now()
);

-- Sehemu zinazojirudia kwenye kila kumbukumbu
-- (id, created_at, created_by, updated_at, updated_by)

create table member (
  id varchar(40) primary key,
  no varchar(40), rank varchar(80), name varchar(200) not null,
  army_no varchar(80), unit varchar(200), phone varchar(60),
  join_date date, status varchar(40) default 'Hai',
  usaili varchar(40) default 'Bado', usaili_date date,
  address varchar(300), kin varchar(200), kin_phone varchar(60),
  deps jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);
create unique index member_no_uq on member (no) where no is not null and no <> '';

create table payment (
  id varchar(40) primary key,
  member_id varchar(40), type varchar(20) not null,
  year integer, month integer check (month is null or month between 1 and 12),
  amount numeric(14,2) not null default 0, date date,
  receipt varchar(120), note text,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);
create index payment_member_idx on payment (member_id);

create table support_event (
  id varchar(40) primary key,
  member_id varchar(40), date date, kind varchar(60), relation varchar(60),
  person varchar(200), place varchar(200), amount numeric(14,2) not null default 0,
  status varchar(20) default 'Imelipwa', pay_date date, approved_by varchar(200),
  receipt varchar(120), description text,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);
create index support_event_member_idx on support_event (member_id);

create table loan (
  id varchar(40) primary key,
  no varchar(40), member_id varchar(40), date date,
  principal numeric(14,2) not null default 0, rate numeric(6,2), months integer,
  guarantor varchar(200), purpose varchar(300), note text,
  repayments jsonb not null default '[]'::jsonb,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);
create index loan_member_idx on loan (member_id);

create table project (
  id varchar(40) primary key,
  name varchar(200) not null, status varchar(40) default 'Wazo', start_date date,
  lead varchar(200), budget numeric(14,2), description text,
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);

create table cabinet_member (
  id varchar(40) primary key,
  position varchar(80), member_id varchar(40), name varchar(200), phone varchar(60),
  term_start date, term_end date, status varchar(40) default 'Yupo madarakani', duties text,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);

create table meeting (
  id varchar(40) primary key,
  title varchar(300), kind varchar(80), date date, venue varchar(200),
  chair varchar(200), secretary varchar(200), agenda text,
  attendees jsonb not null default '[]'::jsonb,
  resolutions text, minutes text, next_date date,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);

create table notice (
  id varchar(40) primary key,
  title varchar(300) not null, date date, pinned varchar(10) default 'hapana', body text,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);

create table ledger_entry (
  id varchar(40) primary key,
  dir varchar(10) not null default 'out' check (dir in ('in','out')),
  date date, category varchar(200), amount numeric(14,2) not null default 0,
  approved_by varchar(200), receipt varchar(120), note text,
  created_at timestamptz, created_by varchar(40), updated_at timestamptz, updated_by varchar(40)
);

-- Mipangilio na taarifa za mfuko: mstari mmoja tu kila moja
create table fund_settings (
  id integer primary key check (id = 1),
  fund_name varchar(200) not null default 'MKCOT',
  branch varchar(300) not null default 'Tawi la COT (Chief of Operations and Training), JWTZ',
  entry_fee numeric(14,2) not null default 35000,
  monthly_fee numeric(14,2) not null default 10000,
  interest_rate numeric(6,2) not null default 0,
  opening_balance numeric(14,2) not null default 0,
  opening_date date,
  logo bytea, logo_type varchar(60), logo_version integer not null default 0,
  updated_at timestamptz, updated_by varchar(40)
);
insert into fund_settings (id) values (1);

create table fund_about (
  id integer primary key check (id = 1),
  intro text, history text, goals text, rules text, contact text,
  updated_at timestamptz, updated_by varchar(40)
);
insert into fund_about (id) values (1);
