import type { Passport } from "@opensystemslab/planx-core/types";

import { isApplicationTypeSupported } from "./helpers.js";

describe("isApplicationTypeSupported", () => {
  test("returns true for statutory application types", () => {
    const mockPassport: Passport = { data: { "application.type": ["ldc.p"] } };
    expect(isApplicationTypeSupported(mockPassport)).toEqual(true);
  });

  test("return true for pre-applications", () => {
    const mockPassport: Passport = { data: { "application.type": ["preApp"] } };
    expect(isApplicationTypeSupported(mockPassport)).toEqual(true);
  });

  test("returns false for discretionary types", () => {
    const mockPassport: Passport = { data: { "application.type": ["breach"] } };
    expect(isApplicationTypeSupported(mockPassport)).toEqual(false);
  });

  test("returns false if passport does not have application.type key", () => {
    const mockPassport: Passport = {
      data: { "property.type": ["residential"] },
    };
    expect(isApplicationTypeSupported(mockPassport)).toEqual(false);
  });
});
