import { Pool } from 'pg';

declare global {
  namespace NodeJS {
    interface Global {
      dbPool: Pool | undefined;
    }
  }
}

export {};