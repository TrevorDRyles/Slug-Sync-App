-- insert sql data for startup in dev

INSERT INTO "user"(id, data) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs')));

-- TODO change goal column to data column -- it was named incorrectly by mistake
INSERT INTO goal(id, goal) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e81', jsonb_build_object('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', '1', 'title', 'Learn React', 'description', 'Learn React', 'recurrence', '1', 'completed', false));

INSERT INTO comment(user_id, goal_id, data) VALUES ('1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', '1e0d7c46-2194-4a30-b8e5-1b0a7c287e81', jsonb_build_object('content', 'Test Comment', 'date', '2022-01-01'));

