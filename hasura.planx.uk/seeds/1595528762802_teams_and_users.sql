INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (1, 'John', 'Rees', 'john@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (2, 'Alastair', 'Parvin', 'alastair@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (6, 'Gunar', 'Gessner', 'gunargessner@gmail.com', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (13, 'Sarah', 'Scott', 'sarah@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (20, 'Jessica', 'McInchak', 'jessica@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (33, 'Dafydd', 'Pearson', 'dafydd@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.users (id, first_name, last_name, email, is_admin) VALUES (36, 'Benjamin', 'Williams', 'benjamin@opensystemslab.io', true) ON CONFLICT (id) DO NOTHING;
SELECT setval('users_id_seq', max(id)) FROM users;
SELECT setval('teams_id_seq', max(id)) FROM teams;