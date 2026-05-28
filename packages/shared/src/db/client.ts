import { Pool, type PoolConfig } from 'pg';

export type DbConfig = PoolConfig;

let pool: Pool | null = null;

/**
 * Создать новый пул с указанной конфигурацией.
 */
export function createPool(config: DbConfig): Pool {
  return new Pool(config);
}

/**
 * Инициализировать глобальный синглтон пула.
 * Должен быть вызван один раз перед использованием getPool().
 */
export function initPool(config: DbConfig): Pool {
  pool = new Pool(config);
  return pool;
}

/**
 * Получить глобальный экземпляр пула. Выбрасывает ошибку, если не инициализирован.
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initPool() first.');
  }
  return pool;
}
