--
-- All SQL statements must be on a single line and end in a semicolon.

DROP TABLE IF EXISTS "user";

DROP TABLE IF EXISTS goal;
DROP TABLE IF EXISTS member_goal;

CREATE TABLE "user" (id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);
CREATE TABLE goal(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), "goal" jsonb);
CREATE TABLE member_goal (member_id UUID REFERENCES "user" (id), goal_id UUID REFERENCES goal (id), data jsonb, PRIMARY KEY (member_id, goal_id));