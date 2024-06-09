-- please keep all statements on one line! tests will fail if you don't
INSERT INTO "user"(id, data) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs'), 'img', 'https://i.pinimg.com/736x/32/7e/db/327edb9a15b304efc264668ada03f725.jpg'));
INSERT INTO "user"(data) VALUES (jsonb_build_object('name', 'arelyx', 'email', 'arelyx@example.com', 'password', crypt('arelyxuser', 'cs')));
INSERT INTO goal(id, goal) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e81', jsonb_build_object('title', 'Learn React', 'description', 'Learn React', 'recurrence', '1 day', 'author', (SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), 'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Academics'));
INSERT INTO goal(id, goal)
VALUES ('2e0d7c46-2194-4a30-b8e5-1b0a7c287e82',
        jsonb_build_object('title', 'Walk a mile', 'description', 'Walk a mile every day to be healthy!', 'recurrence',
                           '1 day', 'author', (SELECT id FROM "user" WHERE data ->> 'email' = 'hunter@ucsc.edu'),
                           'memberCount', 1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate',
                           '2024-05-18 20:09:57.341567', 'completed', false, 'tag', 'Health'));
INSERT INTO goal(id, goal)
VALUES ('3e0d7c46-2194-4a30-b8e5-1b0a7c287e83', jsonb_build_object('title', 'Eat breakfast at 9am', 'description',
                                                                   'Eat breakfast at an early time to stay consistent!',
                                                                   'recurrence', '1 day', 'author',
                                                                   (SELECT id FROM "user" WHERE data ->> 'email' = 'hunter@ucsc.edu'),
                                                                   'memberCount', 1, 'startdate',
                                                                   '2024-05-18 20:09:57.341567', 'enddate',
                                                                   '2024-05-18 20:09:57.341567', 'completed', false,
                                                                   'tag', 'Health'));
INSERT INTO goal(id, goal)
VALUES ('4e0d7c46-2194-4a30-b8e5-1b0a7c287e84', jsonb_build_object('title', 'Do your 114A homework', 'description',
                                                                   'CSE 114A homework due on Tuesday at 11:59pm',
                                                                   'recurrence', '1 week', 'author',
                                                                   (SELECT id FROM "user" WHERE data ->> 'email' = 'hunter@ucsc.edu'),
                                                                   'memberCount', 1, 'startdate',
                                                                   '2024-05-18 20:09:57.341567', 'enddate',
                                                                   '2024-05-18 20:09:57.341567', 'completed', false,
                                                                   'tag', 'Academics'));
INSERT INTO goal(id, goal)
VALUES ('5e0d7c46-2194-4a30-b8e5-1b0a7c287e85',
        jsonb_build_object('title', 'Get your mom a gift on Mothers Day', 'description',
                           'May 14th is Mothers Day, get her a gift!', 'recurrence', '1 year', 'author',
                           (SELECT id FROM "user" WHERE data ->> 'email' = 'hunter@ucsc.edu'), 'memberCount', 1,
                           'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567',
                           'completed', false, 'tag', 'Personal'));
INSERT INTO goal(id, goal)
VALUES ('6e0d7c46-2194-4a30-b8e5-1b0a7c287e86',
        jsonb_build_object('title', 'Go to the gym', 'description', 'Toadal fitness baybe', 'recurrence', '2 days',
                           'author', (SELECT id FROM "user" WHERE data ->> 'email' = 'hunter@ucsc.edu'), 'memberCount',
                           1, 'startdate', '2024-05-18 20:09:57.341567', 'enddate', '2024-05-18 20:09:57.341567',
                           'completed', false, 'tag', 'Health'));
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Walk a mile'), CURRENT_TIMESTAMP, 0);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Eat breakfest at 9am'), '2024-05-18 20:09:57.341567'::timestamp, 16);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Do your 114A homework'), '2024-05-12 20:09:57.341567'::timestamp, 3);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Get your mom a gift on mothers day'), '2024-05-17 20:09:57.341567'::timestamp, 22);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Go to the gym'), '2024-04-19 20:09:57.341567'::timestamp, 56);
INSERT INTO user_goal VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Learn React'), '2024-04-19 20:09:57.341567'::timestamp, 75);
INSERT INTO user_goal
VALUES ((SELECT id FROM "user" WHERE data ->> 'email' = 'arelyx@example.com'),
        (SELECT id FROM goal WHERE goal ->> 'title' = 'Learn React'), '2024-04-19 20:09:57.341567'::timestamp, 81);
INSERT INTO comment(user_id, goal_id, data) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', '1e0d7c46-2194-4a30-b8e5-1b0a7c287e81', jsonb_build_object('content', 'Test Comment', 'date', '2022-01-01'));

