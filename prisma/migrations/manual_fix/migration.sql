-- Remove firstName and lastName columns from the users table if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'firstName') THEN
        ALTER TABLE "users" DROP COLUMN "firstName";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lastName') THEN
        ALTER TABLE "users" DROP COLUMN "lastName";
    END IF;
END $$; 