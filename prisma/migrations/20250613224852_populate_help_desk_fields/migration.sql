-- This is an empty migration.

-- Populate title field for existing help desk records
UPDATE "HelpDesk" 
SET "title" = SUBSTRING("question", 1, 100)
WHERE "title" = '';