import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const prestaShopDataSource: DataSourceOptions = {
  name: 'presta',
  type: 'mysql',
  host: `${process.env.PRESTA_DB_HOSTNAME}`,
  port: parseInt(process.env.PRESTA_DB_PORT!, 10),
  username: `${process.env.PRESTA_DB_USERNAME}`,
  password: `${process.env.PRESTA_DB_PASSWORD}`,
  database: `${process.env.PRESTA_DB_NAME}`,
  entities: ['dist/src/presta_entities**/*.ps-entity.js'],
  synchronize: false,
};

const dataSource = new DataSource(prestaShopDataSource);

export default dataSource;
