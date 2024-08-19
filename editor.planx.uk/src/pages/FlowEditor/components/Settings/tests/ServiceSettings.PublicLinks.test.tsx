import { useStore } from "pages/FlowEditor/lib/store";
import ServiceSettings from "../ServiceSettings";
import setupServiceSettingsScreen, {
  mockWindowLocationObject,
} from "./helpers/setupServiceSettingsScreen";
import { screen } from "@testing-library/react";
import { rootFlowPath } from "routes/utils";

const { getState, setState } = useStore;

describe("Check when service is offline and published, the team has a subdomain", () => {
  beforeEach(async () => {
    // setup state values that <ServiceSettings/> depends on
    setState({
      flowSettings: {},
      flowStatus: "offline",
      teamDomain: "mockedteamdomain.com",
      teamName: "mockTeam",
      isFlowPublished: true,
      flowSlug: "mock-planning-permish",
    });

    // render the <ServiceSettings/> comp
    setupServiceSettingsScreen();

    // Mocking window.location.origin
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue(mockWindowLocationObject);
  });

  it("public link should be the current published url in a <p> tag", async () => {
    const publicLink = await screen.findByText(
      `https://mockedteamdomain.com/mock-planning-permish`
    );

    const copyButton = await screen.findByText(`copy`);
    expect(publicLink.tagName).toBe("P");
    expect(copyButton.tagName).toBe("SPAN");
  });
});
