--
-- All SQL statements must be on a single line and end in a semicolon.

DROP TABLE IF EXISTS user_goal;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS goal;
DROP TABLE IF EXISTS "user";

CREATE TABLE "user" (id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);
CREATE TABLE goal(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), "goal" jsonb);
CREATE TABLE comment(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES "user"(id) ON DELETE CASCADE, goal_id UUID REFERENCES goal(id) ON DELETE CASCADE, data jsonb);
CREATE TABLE user_goal(user_id UUID REFERENCES "user"(id) ON DELETE CASCADE, goal_id UUID REFERENCES goal(id) ON DELETE CASCADE, last_checked TIMESTAMP, streak INT);