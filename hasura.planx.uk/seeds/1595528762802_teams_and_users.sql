INSERT INTO public.users (id, first_name, last_name, email) VALUES (2, 'Alastair', 'Parvin', 'alastair@opensystemslab.io') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email) VALUES (20, 'Jessica', 'McInchak', 'jessica@opensystemslab.io') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email) VALUES (33, 'Dafydd', 'Pearson', 'dafydd@opensystemslab.io') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email) VALUES (65, 'Ian', 'Jones', 'ian@opensystemslab.io') ON CONFLICT (id) DO NOTHING;
SELECT setval('users_id_seq', max(id)) FROM users;
SELECT setval('teams_id_seq', max(id)) FROM teams;
