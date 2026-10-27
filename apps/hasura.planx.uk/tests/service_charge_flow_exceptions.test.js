import { introspectAs } from "./utils.js";

describe("service_charge_flow_exceptions", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query service_charge_flow_exceptions", () => {
      expect(i.queries).toContain("service_charge_flow_exceptions");
    });

    test("cannot create, update, or delete service_charge_flow_exceptions", () => {
      expect(i).toHaveNoMutationsFor("service_charge_flow_exceptions");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate service_charge_flow_exceptions", () => {
      expect(i.queries).toContain("service_charge_flow_exceptions");
      expect(i.mutations).toContain("insert_service_charge_flow_exceptions");
      expect(i.mutations).toContain(
        "update_service_charge_flow_exceptions_by_pk",
      );
      expect(i.mutations).toContain("delete_service_charge_flow_exceptions");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query service_charge_flow_exceptions", () => {
      expect(i.queries).not.toContain("service_charge_flow_exceptions");
    });

    test("cannot create, update, or delete service_charge_flow_exceptions", () => {
      expect(i).toHaveNoMutationsFor("service_charge_flow_exceptions");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query service_charge_flow_exceptions", () => {
      expect(i.queries).not.toContain("service_charge_flow_exceptions");
    });

    test("cannot create, update, or delete service_charge_flow_exceptions", () => {
      expect(i).toHaveNoMutationsFor("service_charge_flow_exceptions");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query service_charge_flow_exceptions", () => {
      expect(i.queries).not.toContain("service_charge_flow_exceptions");
    });

    test("cannot create, update, or delete service_charge_flow_exceptions", () => {
      expect(i).toHaveNoMutationsFor("service_charge_flow_exceptions");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query service_charge_flow_exceptions", () => {
      expect(i.queries).not.toContain("service_charge_flow_exceptions");
    });

    test("cannot create, update, or delete service_charge_flow_exceptions", () => {
      expect(i).toHaveNoMutationsFor("service_charge_flow_exceptions");
    });
  });
});
