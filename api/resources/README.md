# Resources Folder

This folder contains project resources that are not part of the main source code.

## Contents

### Scripts (`scripts/`)

- **`dev-start.bat`** - Quick setup for development mode
    - Starts PostgreSQL, PostgREST (exposed), and Adminer
    - Ready for `npm run dev`

- **`prod-start.bat`** - Quick setup for production mode
    - Builds and starts all services in Docker
    - PostgREST is fully isolated (not exposed)

- **`start-docker.bat`** - Legacy startup script (deprecated, use prod-start.bat)

### Database (`db/`)

- **`db/init/`** - PostgreSQL initialization scripts
    - `01-schema.sql` - Database schema and functions
    - `02-seed.sql` - Mock data
    - `03-functions-demo.sql` - Example queries

## Usage

### Development Mode

```bash
# From project root
.\resources\scripts\dev-start.bat

# Then in another terminal
npm run dev
```

### Production Mode

```bash
# From project root
.\resources\scripts\prod-start.bat
```

## Database Scripts

The database initialization scripts are automatically executed when PostgreSQL starts for the first time, in alphabetical order:

1. **01-schema.sql** - Creates tables, extensions, and functions
2. **02-seed.sql** - Inserts mock data
3. **03-functions-demo.sql** - Example queries for reference

To reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

This will delete all data and re-run the initialization scripts.
