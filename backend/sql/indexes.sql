--
-- All SQL statements must be on a single line and end in a semicolon.
--

-- Index Your Tables Here (Optional) --
CREATE UNIQUE INDEX ON "user" ((data->>'email'))