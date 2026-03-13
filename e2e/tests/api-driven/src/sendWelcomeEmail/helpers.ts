import axios from "axios";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $admin } from "../client.js";
import { createTeam, createUser } from "../globalHelpers.js";

interface WelcomeEmailPayload {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  defaultTeamId: number | null;
}

interface CallOptions {
  payload?: Partial<WelcomeEmailPayload>;
  includeAuth?: boolean;
}

export const validPayload: WelcomeEmailPayload = {
  userId: 1,
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  defaultTeamId: null,
};

export const callWelcomeEndpoint = async ({
  payload,
  includeAuth = true,
}: CallOptions = {}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    headers["Authorization"] = process.env.HASURA_PLANX_API_KEY!;
  }

  const response = await fetch(
    `${process.env.API_URL_EXT}/send-email/welcome`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        payload: { ...validPayload, ...payload },
      }),
    },
  );

  return {
    status: response.status,
    body: await response.json(),
  };
};

export async function setUpMocks() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const serverMockFile = readFileSync(`${__dirname}/mocks/server-mocks.yaml`);
  return axios({
    method: "POST",
    url: `${process.env.E2E_MOCK_SERVER_INTERFACE}/mocks?reset=true`,
    headers: {
      "Content-Type": "application/x-yaml",
    },
    data: serverMockFile,
  });
}

export const setup = async ({ isTrial }: { isTrial: boolean }) => {
  const teamId = await createTeam({
    settings: { homepage: "http://www.planx.uk", isTrial },
  });
  const userId = await createUser();
  return { teamId, userId };
};

export const cleanup = async () => {
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};
