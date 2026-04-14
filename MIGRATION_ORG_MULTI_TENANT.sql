-- 1. Créer la table organizations
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Créer la table memberships (liaison users <-> organizations)
create type if not exists membership_role as enum ('admin', 'editor', 'viewer');

create table if not exists memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  role membership_role not null default 'viewer',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (user_id, organization_id)
);

-- 3. Ajouter organization_id (nullable) à forms
alter table if exists forms add column if not exists organization_id uuid references organizations(id);

-- 4. Migration progressive : créer une org par user existant et migrer les données
insert into organizations (id, name)
select uuid_generate_v4(), u.email || ' workspace'
from users u
where not exists (
  select 1 from organizations o
  join memberships m on m.organization_id = o.id
  where m.user_id = u.id
);

insert into memberships (user_id, organization_id, role)
select u.id, o.id, 'admin'
from users u
join organizations o on o.name = u.email || ' workspace'
where not exists (
  select 1 from memberships m where m.user_id = u.id and m.organization_id = o.id
);

update forms f
set organization_id = o.id
from users u
join organizations o on o.name = u.email || ' workspace'
where f.user_id = u.id and f.organization_id is null;
