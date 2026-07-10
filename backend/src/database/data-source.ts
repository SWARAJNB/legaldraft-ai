import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables for the CLI
config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://legaldraft:legaldraft_password@localhost:5432/legaldraft_ai',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false, // Migrations should be used instead
  logging: process.env.NODE_ENV !== 'production' ? ['error'] : false,
  ssl: (process.env.DATABASE_URL || '').includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
