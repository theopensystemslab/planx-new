INSERT INTO public.users (id, first_name, last_name, email, is_platform_admin) VALUES (2, 'Alastair', 'Parvin', 'alastair@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_platform_admin) VALUES (20, 'Jessica', 'McInchak', 'jessica@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_platform_admin) VALUES (33, 'Dafydd', 'Pearson', 'dafydd@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_platform_admin) VALUES (65, 'Ian', 'Jones', 'ian@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
SELECT setval('users_id_seq', max(id)) FROM users;
SELECT setval('teams_id_seq', max(id)) FROM teams;
