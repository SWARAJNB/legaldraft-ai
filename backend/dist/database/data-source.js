"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: '.env' });
exports.dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://legaldraft:legaldraft_password@localhost:5432/legaldraft_ai',
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [(0, path_1.join)(__dirname, 'migrations', '*{.ts,.js}')],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production' ? ['error'] : false,
    ssl: (process.env.DATABASE_URL || '').includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined,
};
const AppDataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map