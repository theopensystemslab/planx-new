import { renderHook } from "@testing-library/react";
import * as reactUse from "react-use";
import type { LocationSensorState } from "react-use/lib/useLocation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLPS } from "./useLPS";

vi.mock("react-use", () => ({
  useLocation: vi.fn(),
}));

const mockUseLocation = vi.mocked(reactUse.useLocation);

describe("useLPS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe("production environment", () => {
    it("returns production URL when VITE_APP_ENV is production", () => {
      vi.stubEnv("VITE_APP_ENV", "production");
      mockUseLocation.mockReturnValue({
        hostname: "editor.planx.uk",
      } as LocationSensorState);

      const { result } = renderHook(() => useLPS());

      expect(result.current.url).toBe("https://www.localplanning.services");
    });

    it("returns production URL regardless of hostname", () => {
      vi.stubEnv("VITE_APP_ENV", "production");
      mockUseLocation.mockReturnValue({
        hostname: "editor.planx.dev",
      } as LocationSensorState);

      const { result } = renderHook(() => useLPS());

      expect(result.current.url).toBe("https://www.localplanning.services");
    });
  });

  describe("non-production environments", () => {
    it("returns staging URL for editor.planx.dev hostname", () => {
      vi.stubEnv("VITE_APP_ENV", "staging");
      mockUseLocation.mockReturnValue({
        hostname: "editor.planx.dev",
      } as LocationSensorState);

      const { result } = renderHook(() => useLPS());

      expect(result.current.url).toBe("https://localplanning.editor.planx.dev");
    });

    it("returns pizza URL for editor.1234.planx.pizza hostname", () => {
      vi.stubEnv("VITE_APP_ENV", "pizza");
      mockUseLocation.mockReturnValue({
        hostname: "1234.planx.pizza",
      } as LocationSensorState);

      const { result } = renderHook(() => useLPS());

      expect(result.current.url).toBe("https://localplanning.1234.planx.pizza");
    });
  });
});
