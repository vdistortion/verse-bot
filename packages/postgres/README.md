# @verse-bot/postgres

PostgreSQL integration for Verse Bot user persistence and command logs.

## Install

```bash
npm install @verse-bot/postgres
```

## Usage

```ts
import { createPostgresDatabase, initPool, getPool } from '@verse-bot/postgres';

initPool({
  host: 'localhost',
  port: 5432,
  database: 'bot',
  user: 'postgres',
  password: 'postgres',
});

const database = createPostgresDatabase(getPool());
```

Pass `database` to `createUniversalTelegramBot` or `createUniversalVKBot` to enable user persistence and command logging.

## API

- `createPool(config)` and `initPool(config)` create PostgreSQL pools;
- `getPool()` returns the pool initialized by `initPool`;
- `createPostgresDatabase(pool)` creates the adapter contract used by bot packages;
- `findOrCreateUser`, `userExists`, `getAllUsers`, and `removeUser` manage users;
- `logCommand`, `getCommandStats`, and `getUserCommandLogs` manage command logs;
- `runMigrations(pool, migrationPattern)` runs Postgrator migrations.

The package includes the initial SQL migration files in its published `dist` directory.

## License

Apache-2.0
