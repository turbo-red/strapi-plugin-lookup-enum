import { getTranslation } from './utils/getTranslation';
import LookupEnumIcon from './components/LookupEnumIcon'
import MultiLookupEnumIcon from './components/MultiLookupEnumIcon'

import { StrapiApp, getFetchClient } from '@strapi/strapi/admin';
import pluginId from "./pluginId";

export default {
  async register(app: StrapiApp) {

    const { get } = getFetchClient();
    const contentTypesResp = await get<{ data: { uid: string; schema: { kind: 'collectionType' | 'singleType' } }[] }>(
      "/content-type-builder/content-types"
    );


    const contentTypeOptions: string[] = (!contentTypesResp.status || contentTypesResp.status === 200) ?
      contentTypesResp.data.data.filter(item => item.schema.kind === 'singleType').map(item => item.uid)
      : [];


    app.customFields.register(
      [{
        name: "lookup-enum",
        pluginId,
        type: "string",
        icon: LookupEnumIcon,
        intlLabel: {
          id: "lookup-enum.label",
          defaultMessage: "Lookup enum",
        },
        intlDescription: {
          id: "lookup-enum.description",
          defaultMessage: "Like enum field , but options are extracted from a field provided by a single content type!",
        },
        description: {
          id: "lookup-enum.description",
          defaultMessage: "Like enum field , but options are extracted from a field provided by a single content type!",
        },
      },
      {
        name: "multi-lookup-enum",
        pluginId,
        type: "json",
        icon: MultiLookupEnumIcon,
        intlLabel: {
          id: "multi-lookup-enum.label",
          defaultMessage: "Multiple lookup enum",
        },
        intlDescription: {
          id: "multi-lookup-enum.description",
          defaultMessage: "Multiple selection enum field , options are extracted from a field provided by a single content type!",
        },
      },
      ].map((item) => (
        {
          ...(item as any),

          components: {

            Input: async () => {
              const makeDynamicEnum =
                (await import(
              /* webpackChunkName: "lookup-enum" */ "./components/DynamicEnum"
                )).default;
              const component = makeDynamicEnum(item.type === 'json');
              return { default: component }
            }
          },
          options: {

            base: [

              {
                sectionTitle: {
                  id: getTranslation('lookup-enum.options.advanced.optionsSection'),
                  defaultMessage: 'Options source',
                },
                items: [
                  {
                    intlLabel: {
                      id: getTranslation('lookup-enum.options.base.lookupSingleType'),
                      defaultMessage: 'Single-Type',
                    },
                    name: 'options.lookupSingleType' as any,
                    type: 'select',
                    description: {
                      id: getTranslation('lookup-enum.options.base.description'),
                      defaultMessage: 'Lookup Single-Type entity',
                    },
                    options: contentTypeOptions.map((value) => {
                      return {
                        key: value,
                        value,
                        metadatas: {
                          intlLabel: { id: `${value}.no-override`, defaultMessage: value },
                        },
                      }
                    })
                  },
                  {
                    intlLabel: {
                      id: getTranslation('lookup-enum.options.base.lookupField'),
                      defaultMessage: 'Lookup field',
                    },
                    name: 'options.lookupField' as any,
                    type: 'text',

                    description: {
                      id: getTranslation('lookup-enum.options.base.description'),
                      defaultMessage: 'Single-type text field where options are extracted using spaces,tabs and returns as delimiter.',
                    },
                  }
                ]
              },

            ],
            advanced: [
              {
                sectionTitle: {
                  id: getTranslation('lookup-enum.options.advanced.settings'),
                  defaultMessage: 'Settings',
                },
                items: [
                  {
                    name: 'required',
                    type: 'checkbox',
                    intlLabel: {
                      id: 'form.attribute.item.requiredField',
                      defaultMessage: 'Required field',
                    },
                    description: {
                      id: 'form.attribute.item.requiredField.description',
                      defaultMessage: "You won't be able to create an entry if this field is empty",
                    },
                  },
                  {
                    name: 'unique',
                    type: 'checkbox',
                    intlLabel: {
                      id: 'form.attribute.item.uniqueField',
                      defaultMessage: 'Unique field',
                    },
                    description: {
                      id: 'form.attribute.item.uniqueField.description',
                      defaultMessage: "You won't be able to create an entry if there is an existing entry with identical content",
                    },
                  },
                  {
                    name: 'private',
                    type: 'checkbox',
                    intlLabel: {
                      id: 'form.attribute.item.privateField',
                      defaultMessage: 'Private field',
                    },
                    description: {
                      id: 'form.attribute.item.privateField.description',
                      defaultMessage: "This field will not show up in the API response",
                    },
                  },
                ],
              }
            ]

          }
        })
      )
    );





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
