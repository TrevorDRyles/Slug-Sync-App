-- insert sql data for startup in dev

INSERT INTO "user"(data) VALUES (jsonb_build_object('name', 'Hunter', 'email', 'hunter@ucsc.edu', 'password', crypt('huntertratar', 'cs')))