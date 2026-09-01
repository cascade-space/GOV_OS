-- Create civicpath_user with proper permissions

-- Create the user
CREATE USER civicpath_user WITH PASSWORD 'mayursql';

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE civicpath TO civicpath_user;

-- Connect to civicpath database (you need to run \c civicpath before the next commands)
-- The following commands should be run after connecting to civicpath database

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO civicpath_user;

-- Grant privileges on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO civicpath_user;

-- Grant privileges on all existing sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO civicpath_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO civicpath_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO civicpath_user;
