-- insert sql data for startup in dev

--INSERT INTO "user"(data) VALUES (jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs')));

INSERT INTO "user"(id, data) VALUES ('66c0cab9-4d54-4d69-98e1-4e0f7198c6f0',jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs'), 'bio', 'itsabio'));

INSERT INTO goal(goal) VALUES (jsonb_build_object('user_id', '1', 'title', 'Learn React', 'description', 'Learn React', 'recurrence', '1'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('user_id', '2', 'title', 'Run a Mile', 'description', 'Run a mile', 'recurrence', '7'));
INSERT INTO goal(goal) VALUES (jsonb_build_object('user_id', '3', 'title', 'Drink Water', 'description', 'Drink Water', 'recurrence', '1'));

INSERT INTO member_goal (member_id, goal_id, data) VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Learn React'), jsonb_build_object('streak', '0'));
INSERT INTO member_goal (member_id, goal_id, data) VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Run a Mile'), jsonb_build_object('streak', '3'));
INSERT INTO member_goal (member_id, goal_id, data) VALUES ((SELECT id FROM "user" WHERE data->>'email' = 'hunter@ucsc.edu'), (SELECT id FROM goal WHERE goal->>'title' = 'Drink Water'), jsonb_build_object('streak', '7'));
