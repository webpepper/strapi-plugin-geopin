import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../admin/src/pluginId';
import type { Knex } from 'knex';

const getPostgisVersion = async (db: Knex) => {
  try {
    const result = await db.raw(`SELECT PostGIS_version();`).catch((err) => {
      return err.message;
    });

    return result.rows[0].postgis_version as string;
  } catch (e) {
    return 'ERROR:' + e.message;
  }
};

const register = async ({ strapi }: { strapi: Core.Strapi }) => {
  const db = strapi.db.connection;
  const postgisVersion = await getPostgisVersion(db);
  strapi.log.info(`PostGIS Version: ${postgisVersion}`);

  strapi.customFields.register({
    name: 'location',
    plugin: PLUGIN_ID,
    type: 'json',
    inputSize: {
      default: 4,
      isResizable: true,
    },
  });
};

export default register;
