const { introspectAs } = require("./utils");

describe("flow_integrations", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams", () => {
      expect(i.queries).toContain("flow_integrations");
    });

    test("cannot create, update, or delete flow integrations", () => {
      expect(i).toHaveNoMutationsFor("flow_integrations");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("flow_integrations");
    });

    test("has full access to query and mutate flow integrations", async () => {
      expect(i.queries).toContain("flow_integrations");

      expect(i.mutations).toContain("insert_flow_integrations");
      expect(i.mutations).toContain("update_flow_integrations_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("flow_integrations");
    });

    test("has full access to query and mutate flow integrations", async () => {
      expect(i.queries).toContain("flow_integrations");

      expect(i.mutations).toContain("insert_flow_integrations");
      expect(i.mutations).toContain("update_flow_integrations_by_pk");
    });

    test("can delete flow integrations", async () => {
      expect(i.mutations).toContain("delete_flow_integrations");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("flow_integrations");
    });

    test("can update flow integrations", () => {
      expect(i.mutations).toContain("update_flow_integrations");
      expect(i.mutations).toContain("update_flow_integrations_by_pk");
    });

    test("can delete flow integrations", async () => {
      expect(i.mutations).toContain("delete_flow_integrations");
    });

    test("can add flow integrations", async () => {
      expect(i.mutations).toContain("insert_flow_integrations");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query flow integrations", () => {
      expect(i.queries).not.toContain("flow_integrations");
    });

    test("cannot create, update, or delete flow integrations", () => {
      expect(i).toHaveNoMutationsFor("flow_integrations");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("flow_integrations");
    });

    test("cannot update flow integrations", () => {
      expect(i.mutations).not.toContain("update_flow_integrations");
      expect(i.mutations).not.toContain("update_flow_integrations_by_pk");
      expect(i.mutations).not.toContain("update_flow_integrations_many");
    });

    test("cannot create or delete flow integrations", () => {
      expect(i.mutations).not.toContain("insert_flow_integrations");
      expect(i.mutations).not.toContain("delete_flow_integrations");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("cannot query flow integrations", () => {
      expect(i.queries).not.toContain("flow_integrations");
    });

    test("cannot update flow integrations", () => {
      expect(i.mutations).not.toContain("update_flow_integrations");
      expect(i.mutations).not.toContain("update_flow_integrations_by_pk");
      expect(i.mutations).not.toContain("update_flow_integrations_many");
    });

    test("cannot create or delete flow integrations", () => {
      expect(i.mutations).not.toContain("insert_flow_integrations");
      expect(i.mutations).not.toContain("delete_flow_integrations");
    });
  });
});
