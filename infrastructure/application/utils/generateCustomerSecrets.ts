import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { customers } from "../../common/customers"

// Greedily match any non-word characters
// XXX: Matches regex used in api.planx.uk/send.js
const regex = new RegExp(/\W+/g)

/**
 * Format string for "name" field
 * Matches environment variables (uppercase, snake case)
 */
const name = (name: string) => name.replace(regex, "_").toUpperCase();

/**
 * Format string for "value" field
 * Matches Pulumi secrets (lowercase, kebab case)
 */
const value = (value: string) => value.replace(regex, "-").toLowerCase();

export const generateCustomerSecrets = (config: pulumi.Config): awsx.ecs.KeyValuePair[] => {
  const secrets: awsx.ecs.KeyValuePair[] = [];
  customers.forEach(customer => {
    secrets.push({
      name: `GOV_UK_PAY_TOKEN_${name(customer.name)}`,
      value: config.require(`gov-uk-pay-token-${value(customer.name)}`),
    });
    customer.uniformInstances?.forEach(instance => {
      secrets.push({
        name: `UNIFORM_CLIENT_${name(instance)}`,
        value: config.require(`uniform-client-${value(instance)}`),
      });
    });
  });
  return secrets;
};

module.exports = { generateCustomerSecrets };