-- insert sql data for startup in dev

INSERT INTO "user"(data) VALUES (jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs')));

INSERT INTO "user"(id, data) VALUES ('66c0cab9-4d54-4d69-98e1-4e0f7198c6f0',jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs'), 'bio', 'helpmehelpme'));

INSERT INTO goal(goal) VALUES (jsonb_build_object('user_id', '1', 'title', 'Learn React', 'description', 'Learn React', 'recurrence', '1'));

INSERT INTO member_goal (member_id, goal_id, data) VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Learn React'), jsonb_build_object('streak', '0'))
