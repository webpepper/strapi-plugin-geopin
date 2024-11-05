import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { StrapiApp } from '@strapi/strapi/admin';

export default {
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'location',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: 'geopin.label',
        defaultMessage: 'geopin',
      },
      intlDescription: {
        id: 'geopin.description',
        defaultMessage: 'Allows to save and manage geographic locations in a PostGIS database.',
      },
      components: {
        Input: async () => import('./components/Input') as any,
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
    });
  },

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTranslations = await Promise.all(
      (locales as string[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: getTranslation(data),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return importedTranslations;
  },
};
