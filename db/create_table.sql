CREATE TABLE users (
  id serial PRIMARY KEY,
  line_user_id varchar(64) UNIQUE NOT NULL,
  display_name varchar(64),
  avatar_url text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE groups (
  id serial PRIMARY KEY,
  line_group_id varchar(64) UNIQUE NOT NULL,
  group_name varchar(128),
  avatar_url text,
  currency varchar(8),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE group_members (
  id serial PRIMARY KEY,
  group_id integer REFERENCES groups(id) ON DELETE CASCADE,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamp DEFAULT now()
);

CREATE TABLE bills (
  id serial PRIMARY KEY,
  group_id integer REFERENCES groups(id) ON DELETE CASCADE,
  creator_id integer REFERENCES users(id) ON DELETE SET NULL,
  title varchar(128),
  description text,
  total_amount numeric(12,2) NOT NULL,
  split_method varchar(32), -- average, percent, fixed, custom
  paid_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE bill_payers (
  id serial PRIMARY KEY,
  bill_id integer REFERENCES bills(id) ON DELETE CASCADE,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL
);

CREATE TABLE bill_shares (
  id serial PRIMARY KEY,
  bill_id integer REFERENCES bills(id) ON DELETE CASCADE,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  split_method varchar(32), -- average, percent, fixed, custom
  split_rule jsonb -- 例如: {"percent": 25} 或 {"fixed": 100}
);