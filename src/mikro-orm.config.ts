import { Options } from '@mikro-orm/core';

const config: Options = {
  entities: ['./dist/database/entities'],
  entitiesTs: ['./src/database/entities'],
  dbName: 'chat-app-db.sqlite3',
  type: 'sqlite',
  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'src/database/seeders',
  },
};

export default config;
