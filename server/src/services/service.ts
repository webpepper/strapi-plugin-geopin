import type { Core } from '@strapi/strapi';
import type { Database } from '@strapi/database';
import { Meta } from '@strapi/database/dist/metadata';

const PLUGIN_FIELD = 'plugin::geopin.location';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getLocationFields: (modelAttributes: any): string[] => {
    return Object.entries(modelAttributes)
      .map(([key, value]) => {
        if (
          value &&
          typeof value === 'object' &&
          'customField' in value &&
          value.customField === PLUGIN_FIELD
        ) {
          return key;
        }

        return false;
      })
      .filter((v): v is string => Boolean(v));
  },

  getModelsWithLocation: (): Meta[] => {
    return Array.from(strapi.db.metadata.values())
      .filter(
        (model) =>
          model.uid.startsWith('api::') ||
          //@ts-ignore
          model.modelType === 'component' ||
          model.uid === 'plugin::users-permissions.user'
      )
      .map((model) => {
        const hasLocationField = Object.values(model.attributes).some(
          (entry) =>
            entry &&
            typeof entry === 'object' &&
            'customField' in entry &&
            entry.customField === PLUGIN_FIELD
        );
        return hasLocationField ? model : false;
      })
      .filter((v): v is Meta => Boolean(v));
  },
});

export default service;
