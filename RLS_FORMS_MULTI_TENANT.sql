-- Activer RLS si besoin
alter table forms enable row level security;

-- Lecture : membres de l'org ou formulaires sans org (legacy)
create policy "Forms: members can read" on forms
for select using (
  organization_id is null
  or exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
      and memberships.organization_id = forms.organization_id
  )
);

-- Insertion : membres admin/editor
create policy "Forms: members can insert" on forms
for insert with check (
  organization_id is null
  or exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
      and memberships.organization_id = forms.organization_id
      and memberships.role in ('admin', 'editor')
  )
);

-- Update : membres admin/editor
create policy "Forms: members can update" on forms
for update using (
  organization_id is null
  or exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
      and memberships.organization_id = forms.organization_id
      and memberships.role in ('admin', 'editor')
  )
);

-- Delete : admin uniquement
create policy "Forms: members can delete" on forms
for delete using (
  organization_id is null
  or exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
      and memberships.organization_id = forms.organization_id
      and memberships.role = 'admin'
  )
);
