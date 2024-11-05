import type { Core } from '@strapi/strapi';
import createSubscriber from './utils/lifecycles';
import _ from 'lodash';
import createFilterMiddleware from './utils/middleware';
import type { Meta } from '@strapi/database/dist/metadata';

const SERVICE_UID = 'plugin::geopin.service';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const db = strapi.db.connection;
  const service = strapi.services[SERVICE_UID];
  const modelsWithLocation = service.getModelsWithLocation() as Meta[];

  await Promise.all(
    modelsWithLocation.map(async (model) => {
      const tableName = model.tableName;

      const locationFields = service.getLocationFields(model.attributes) as string[];
      await Promise.all(
        locationFields.map(async (locationField) => {
          const locationFieldSnakeCase = _.snakeCase(locationField);
          const hasColumn = await db.schema.hasColumn(
            `${tableName}`,
            `${locationFieldSnakeCase}_geom`
          );
          if (!hasColumn) {
            await db.raw(`
              ALTER TABLE ${tableName}
              ADD COLUMN ${locationFieldSnakeCase}_geom GEOGRAPHY(Point, 4326);
            `);
          }
          // Generate point column field using only a query
          await db.raw(`
          UPDATE ${tableName}
          SET ${locationFieldSnakeCase}_geom = ST_SetSRID(ST_MakePoint(
              CAST((${locationFieldSnakeCase}::json->'lng')::text AS DOUBLE PRECISION),
              CAST((${locationFieldSnakeCase}::json->'lat')::text AS DOUBLE PRECISION)

          ), 4326)
          WHERE (${locationFieldSnakeCase}::json->'lng')::text != 'null' AND
                (${locationFieldSnakeCase}::json->'lat')::text != 'null' AND
                ${locationFieldSnakeCase}_geom IS NULL;
          `);
        })
      );
    })
  );

  strapi.db.lifecycles.subscribe(createSubscriber(strapi));
  strapi.server.use(createFilterMiddleware(strapi));
};

export default bootstrap;
