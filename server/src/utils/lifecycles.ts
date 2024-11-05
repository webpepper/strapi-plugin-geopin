import type { Core } from '@strapi/strapi';
import { Event, Subscriber } from '@strapi/database/dist/lifecycles/types';
import _ from 'lodash';
import { Meta } from '@strapi/database/dist/metadata';

const SERVICE_UID = 'plugin::geopin.service';

const createSubscriber = (strapi: Core.Strapi): Subscriber => {
  const db = strapi.db.connection;
  const service = strapi.services[SERVICE_UID];
  const modelsWithLocation = service.getModelsWithLocation() as Meta[];

  return {
    models: modelsWithLocation.map((model) => model.uid),

    afterCreate: async (event: Event) => {
      const { model } = event;
      const locationFields = service.getLocationFields(model.attributes) as string[];

      const id = event?.result?.id;
      if (!id) {
        return;
      }

      await Promise.all(
        locationFields.map(async (locationField) => {
          const data = event.params.data[locationField];

          if (!data?.lng || !data?.lat) {
            return;
          }

          await db.raw(
            `UPDATE ${model.tableName} SET ${_.snakeCase(locationField)}_geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?;`,
            [data.lng, data.lat, id]
          );
        })
      );
    },

    // Using afterUpdate leads to some sort of a transaction deadlock.
    // Possibly because this additional update runs on a row that is already locked for update by the original update.
    beforeUpdate: async (event: Event) => {
      const { model, params } = event;
      const locationFields = service.getLocationFields(model.attributes) as string[];

      await Promise.all(
        locationFields.map(async (locationField) => {
          const data = params.data[locationField];
          if (!params.where.id || !data?.lng || !data?.lat) {
            return;
          }

          await db.raw(
            `UPDATE ${model.tableName} SET ${_.snakeCase(locationField)}_geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?;`,
            [data.lng, data.lat, params.where.id]
          );
        })
      );
    },
  };
};

export default createSubscriber;
