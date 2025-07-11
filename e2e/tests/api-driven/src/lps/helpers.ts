import { strict as assert } from "node:assert";
import { $admin } from "../client.js";
import {
  createFlow,
  createTeam,
  createUser,
  safely,
} from "../globalHelpers.js";
import { CustomWorld } from "./steps.js";
import { gql } from "graphql-tag";

export const setup = async ({
  email,
}: {
  email: string;
}): Promise<CustomWorld["sessionIds"]> => {
  const teamId = await createTeam();
  const userId = await createUser();
  const flowId = await createFlow({
    teamId,
    userId,
    slug: "test-flow",
    name: "Test Flow",
  });

  // Create other user sessions
  await $admin.session.create({
    flowId,
    data: {
      passport: { data: {} },
      breadcrumbs: {},
    },
    email: "person1@example.com",
  });

  await $admin.session.create({
    flowId,
    data: {
      passport: { data: {} },
      breadcrumbs: {},
    },
    email: "person2@example.com",
  });

  await $admin.session.create({
    flowId,
    data: {
      passport: { data: {} },
      breadcrumbs: {},
    },
    email: "person3@example.com",
  });

  // Create my sessions
  const sessionIds = await Promise.all([
    $admin.session.create({
      flowId,
      data: {
        passport: { data: {} },
        breadcrumbs: {},
      },
      email,
    }),

    $admin.session.create({
      flowId,
      data: {
        passport: { data: {} },
        breadcrumbs: {},
      },
      email,
    }),

    $admin.session.create({
      flowId,
      data: {
        passport: { data: {} },
        breadcrumbs: {},
      },
      email,
    }),
  ]);

  // Mark one session as submitted to populate "submitted" applications
  $admin.client.request(
    `
    mutation MarkSessionAsSubmitted($id: uuid!) {
      update_lowcal_sessions_by_pk(pk_columns: {id: $id}, _set: {submitted_at: "now()"}) {
        id
      }
    }
  `,
    {
      id: sessionIds[0],
    },
  );
  return sessionIds;
};

export const cleanup = async () => {
  await $admin.flow._destroyPublishedAll();
  await $admin.flow._destroyAll();
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();

  await safely(() =>
    $admin.client.request(gql`
      mutation DeleteAllMagicLinks {
        delete_lps_magic_links(where: {}) {
          affected_rows
        }
      }
    `),
  );

  await safely(() =>
    $admin.client.request(gql`
      mutation DeleteAllLowcalSessions {
        delete_lowcal_sessions(where: {}) {
          affected_rows
        }
      }
    `),
  );
};

/**
 * "Log in" to the LPS platform by generating a magic link via the PlanX API
 */
export const login = async (email: string) => {
  const response = await fetch(`${process.env.API_URL_EXT}/lps/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    assert.fail("Failed to create magic link via /lps/login endpoint");
  }
};

interface GetLatestMagicLink {
  lpsMagicLinks: {
    token: string;
    email: string;
    usedAt: string | null;
  }[];
}

export const getLatestMagicLink = async () => {
  const {
    lpsMagicLinks: [magicLinkRecord],
  } = await safely(() =>
    $admin.client.request<GetLatestMagicLink>(gql`
      query GetLatestMagicLink {
        lpsMagicLinks: lps_magic_links(
          limit: 1
          order_by: { created_at: desc }
        ) {
          token
          email
          usedAt: used_at
        }
      }
    `),
  );

  return magicLinkRecord;
};

export const getApplications = async (email: string, token: string) => {
  const response = await fetch(`${process.env.API_URL_EXT}/lps/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, token }),
  });

  if (!response.ok) {
    assert.fail("Failed to get applications via /lps/applications endpoint");
  }

  const applications: CustomWorld["applications"] = await response.json();

  return applications;
};
