import * as pulumi from "@pulumi/pulumi";

import { teams } from "../../common/teams";

import { KeyValuePair } from "../types";

// Greedily match any non-word characters
// XXX: Matches regex used in apps/api.planx.uk/send.js
const regex = new RegExp(/\W+/g);

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

export const generateTeamSecrets = (
  config: pulumi.Config,
  env: String
): KeyValuePair[] => {
  const secrets: KeyValuePair[] = [];
  teams.forEach((team) => {
    team.uniformInstances?.forEach((instance) => {
      secrets.push({
        name: `UNIFORM_CLIENT_${name(instance)}`,
        value: config.require(`uniform-client-${value(instance)}`),
      });
    });
  });
  return secrets;
};
