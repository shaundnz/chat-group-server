import { Options } from '@mikro-orm/core';
import 'dotenv/config';

export default async () => {
  const config: Options = {
    entities: ['./dist/database/entities'],
    entitiesTs: ['./src/database/entities'],
    dbName: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT as string, 10),
    type: 'postgresql',
    seeder: {
      path: 'dist/database/seeders',
      pathTs: 'src/database/seeders',
    },
    migrations: {
      path: 'dist/database/migrations',
      pathTs: 'src/database/migrations',
    },
  };

  return config;
};
