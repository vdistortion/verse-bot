# `@verse-bot/postgres`

Optional PostgreSQL integration for user persistence and command logs.

## Install

```bash
npm install @verse-bot/postgres
```

## Usage

```ts
import { createPostgresDatabase, getPool, initPool } from '@verse-bot/postgres';

initPool({
  host: 'localhost',
  port: 5432,
  database: 'bot',
  user: 'postgres',
  password: 'postgres',
});

const database = createPostgresDatabase(getPool());
```

Pass `database` to a Telegram or VK factory to enable persistence and command logging. The package also exports user and command-log repositories, pool helpers and `runMigrations`.

The published package includes the SQL migration files under `dist/schema`.

## License

Apache-2.0
