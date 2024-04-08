--
-- All SQL statements must be on a single line and end in a semicolon.

DROP TABLE IF EXISTS "user";

CREATE TABLE "user"(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), "user" jsonb);

