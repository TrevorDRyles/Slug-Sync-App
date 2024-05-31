

INSERT INTO "user"(id, data) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs')));
INSERT INTO "user"(data) VALUES (jsonb_build_object('name', 'arelyx', 'email', 'arelyx@example.com', 'password', crypt('arelyxuser', 'cs')));
INSERT INTO goal(id, goal) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e81', jsonb_build_object('title', 'Learn React', 'description', 'Learn React', 'recurrence', '1 day', 'author', (SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Academics'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('title', 'Walk a mile', 'description', 'Walk a mile every day to be healthy!', 'recurrence', '1 day', 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Heatlh'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('title', 'Eat breakfest at 9am', 'description', 'Eat breakfest at an early time to stay consistant!', 'recurrence', '1 day', 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Health'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('title', 'Do your 114A homework', 'description', 'CSE 114A homework due on tuesday at 11:59pm', 'recurrence', '1 week', 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Academics'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('title', 'Get your mom a gift on mothers day', 'description', 'May 14th is mothers day, get her a git!', 'recurrence', '1 year', 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Personal'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('title', 'Go to the gym', 'description', 'Toadal fitness baybe', 'recurrence', '2 days', 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Health'));
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Walk a mile'), CURRENT_TIMESTAMP, 0);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Eat breakfest at 9am'), '2024-05-18 20:09:57.341567'::timestamp, 16);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Do your 114A homework'), '2024-05-12 20:09:57.341567'::timestamp, 3);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Get your mom a gift on mothers day'), '2024-05-17 20:09:57.341567'::timestamp, 22);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Go to the gym'), '2024-04-19 20:09:57.341567'::timestamp, 56);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Learn React'), '2024-04-19 20:09:57.341567'::timestamp, 75);
INSERT INTO comment(user_id, goal_id, data) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', '1e0d7c46-2194-4a30-b8e5-1b0a7c287e81', jsonb_build_object('content', 'Test Comment', 'date', '2022-01-01'));

