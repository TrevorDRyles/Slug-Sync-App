-- insert sql data for startup in dev

INSERT INTO "user"(data) VALUES (jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs')))

-- INSERT INTO goal(goal) VALUES (jsonb_build_object('user_id', '1', 'title', 'Learn React', 'description', 'Learn React', 'recurrence', '1'))
