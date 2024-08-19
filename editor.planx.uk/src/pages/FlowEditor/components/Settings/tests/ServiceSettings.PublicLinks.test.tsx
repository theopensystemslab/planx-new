import { useStore } from "pages/FlowEditor/lib/store";
import ServiceSettings from "../ServiceSettings";
import setupServiceSettingsScreen, {
  mockWindowLocationObject,
} from "./helpers/setupServiceSettingsScreen";
import { screen } from "@testing-library/react";
import { rootFlowPath } from "routes/utils";

const { getState, setState } = useStore;

const disabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: `copy` });
  expect(copyButton).toBeDisabled();
};

const inactiveLinkCheck = async () => {
  const publicLink = await screen.findByText(
    `https://mockedteamdomain.com/mock-planning-permish`
  );

  expect(publicLink.tagName).toBe("P");
};

describe("A team with a subdomain has an offline, published service. ", () => {
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

  it(
    "has a public link with the subdomain url in a <p> tag",
    inactiveLinkCheck
  );
  it("has a disabled copy button", disabledCopyCheck);
});
