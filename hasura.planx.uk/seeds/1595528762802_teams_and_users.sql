INSERT INTO public.teams (id, name, slug, theme, created_at, updated_at) VALUES (1, 'Open Systems Lab', 'opensystemslab', '{}', '2020-07-23 18:23:19.033145+00', '2020-07-23 18:23:19.033145+00');
INSERT INTO public.teams (id, name, slug, theme, created_at, updated_at) VALUES (2, 'Canterbury', 'canterbury', '{"logo": "https://editor.planx.uk/logos/canterbury.svg", "primary": "#331035"}', '2020-07-23 18:23:29.83714+00', '2020-07-23 18:23:37.427868+00');
INSERT INTO public.users (id, first_name, last_name, email, is_admin, created_at, updated_at) VALUES (1, 'John', 'Rees', 'john@opensystemslab.io', false, '2020-07-23 18:23:58.107854+00', '2020-07-23 18:23:58.107854+00');
INSERT INTO public.users (id, first_name, last_name, email, is_admin, created_at, updated_at) VALUES (2, 'Alastair', 'Parvin', 'alastair@opensystemslab.io', false, '2020-07-23 18:24:12.683041+00', '2020-07-23 18:24:12.683041+00');
INSERT INTO public.users (id, first_name, last_name, email, is_admin, created_at, updated_at) VALUES (3, 'Test', 'User', 'test@example.com', false, '2020-07-23 18:24:25.997949+00', '2020-07-23 18:24:25.997949+00');
INSERT INTO public.team_members (team_id, user_id, creator_id, created_at, updated_at) VALUES (2, 3, 1, '2020-07-23 18:24:39.117659+00', '2020-07-23 18:24:39.117659+00');
SELECT pg_catalog.setval('public.teams_id_seq', 2, true);
SELECT pg_catalog.setval('public.users_id_seq', 3, true);
