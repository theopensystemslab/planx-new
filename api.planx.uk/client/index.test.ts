import { CoreDomainClient } from "@opensystemslab/planx-core";
import { getClient } from "./index.js";
import { userContext } from "../modules/auth/middleware.js";
import { getJWT } from "../tests/mockJWT.js";

test("getClient() throws an error if a store is not set", () => {
  expect(() => getClient()).toThrow();
});

test("getClient() returns a client if store is set", () => {
  const getStoreMock = jest.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getJWT({ role: "teamEditor" }),
    },
  });

  const client = getClient();

  expect(client).toBeDefined();
  expect(client).toBeInstanceOf(CoreDomainClient);
});
