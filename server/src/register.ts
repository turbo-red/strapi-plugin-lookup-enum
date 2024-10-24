import type { Core } from '@strapi/strapi';
import pluginId from "./pluginId";

const register = () => {
  // register phase
  strapi.customFields.register({
    name: "lookup-enum",
    plugin: pluginId,
    type: "string"
  });

  strapi.customFields.register({
    name: "multi-lookup-enum",
    plugin: pluginId,
    type: "json"
  });
};

export default register;
