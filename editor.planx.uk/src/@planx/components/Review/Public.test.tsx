import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";
import { act } from "react-dom/test-utils";
import waitForExpect from "wait-for-expect";

import Review from "./Public/Presentational";

jest.mock("../../../api/download.ts", () => ({
  __esModule: true,
  downloadFile: jest.fn(() => Promise.resolve({})),
}));

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={{}}
      breadcrumbs={{}}
      passport={{}}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
      showChangeButton={true}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Review");

  userEvent.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("REGRESSION: doesn't return undefined when multiple nodes are filled", async () => {
  const handleSubmit = jest.fn();

  render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={mockedFlow}
      breadcrumbs={mockedBreadcrumbs}
      passport={mockedPassport}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
      showChangeButton={true}
    />
  );

  expect(screen.getByText("This is a text")).toBeTruthy();
  expect(screen.getByText("356")).toBeTruthy();
  expect(screen.getByText("Option 2")).toBeTruthy();
  expect(screen.queryAllByText("undefined")).toHaveLength(0);
});

const mockedBreadcrumbs = {
  ZM31xEWH2c: {
    auto: false,
    data: {
      ZM31xEWH2c: 356,
    },
  },
  "1A14DTRw0d": {
    auto: false,
    data: {
      "1A14DTRw0d": "This is a text",
    },
  },
  duzkfXlWGn: {
    auto: false,
    answers: ["iWvI9QkgIT"],
  },
};
const mockedPassport = {
  data: {
    ZM31xEWH2c: 356,
    "1A14DTRw0d": "This is a text",
  },
};
const mockedFlow = {
  _root: { edges: ["ZM31xEWH2c", "1A14DTRw0d", "duzkfXlWGn", "EJBY2zSbmL"] },
  "1A14DTRw0d": { data: { title: "Input a text" }, type: 110 },
  EJBY2zSbmL: { type: 600 },
  ZM31xEWH2c: { data: { title: "Input a number" }, type: 150 },
  duzkfXlWGn: {
    data: { text: "Select the desired options", allRequired: false },
    type: 105,
    edges: ["ky2QQWHgi5", "iWvI9QkgIT", "nyYCBQs24s"],
  },
  iWvI9QkgIT: { data: { text: "Option 2" }, type: 200 },
  ky2QQWHgi5: { data: { text: "Option 1" }, type: 200 },
  nyYCBQs24s: { data: { text: "Option 3" }, type: 200 },
};

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={mockedFlow}
      breadcrumbs={mockedBreadcrumbs}
      passport={mockedPassport}
      changeAnswer={() => {}}
      showChangeButton={true}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

const mockLink =
  "blob:http://localhost:3000/935d6c9f-6bbf-4eef-a79b-ddd570359958";
const mockDownloadFile = jest.fn(() => Promise.resolve({}));

beforeAll(() => {
  global.URL = {
    createObjectURL: jest.fn(() => mockLink),
  } as any;
});

it("should render file upload link", async () => {
  const { getByTestId, debug } = render(
    <Review
      title="Review"
      description="Check your answers before submitting"
      flow={fileUploadFlow}
      breadcrumbs={fileUploadBreadcrumbs}
      passport={fileUploadPassport}
      changeAnswer={() => {}}
      showChangeButton={true}
    />
  );

  const link = getByTestId("file-upload-link");

  await act(async () => {
    await waitForExpect(() => {
      expect(link).toHaveAttribute("href", mockLink);
    });
  });
});

const fileUploadBreadcrumbs = {
  VKKfyUDKxs: {
    auto: false,
    data: {
      VKKfyUDKxs: [
        {
          serverFile: {
            fileHash:
              "8c91f81b213865af9632d2296039984753f0e41cfe234ba1dce65ad58568209b",
            fileId: "0702enth/my-file.png",
          },
          filename: "my-file.png",
          cachedSlot: {
            file: {
              path: "my-file.png",
              type: "image/png",
              size: 633,
            },
            status: "success",
            progress: 1,
            id: "0J0AX3GlR9ygsJC8Gh6-o",
            serverFile: {
              fileHash:
                "8c91f81b213865af9632d2296039984753f0e41cfe234ba1dce65ad58568209b",
              fileId: "0702enth/my-file.png",
            },
          },
        },
      ],
    },
  },
  rXucZa1gpi: {
    auto: false,
    answers: ["x87bWxbNwy"],
  },
};

const fileUploadFlow = {
  _root: {
    edges: ["VKKfyUDKxs", "rXucZa1gpi", "MkrYcPlXWU", "6VFTB9ltyl"],
  },
  "6VFTB9ltyl": {
    data: {
      flowId: "50757d36-9b99-41c9-acf2-b012ed244994",
    },
    type: 310,
  },
  BmfRWM82a2: {
    data: {
      text: "Test",
    },
    type: 200,
  },
  MkrYcPlXWU: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  VKKfyUDKxs: {
    data: {
      color: "#EFEFEF",
    },
    type: 140,
  },
  rXucZa1gpi: {
    data: {
      img: "http://localhost:7002/file/public/8wy6v1go/my-file.png",
      text: "Text",
    },
    type: 100,
    edges: ["x87bWxbNwy", "BmfRWM82a2"],
  },
  x87bWxbNwy: {
    data: {
      img: "http://localhost:7002/file/public/pvqr5pm5/legend-of-zelda-the-link-s-awakening-dx.webp",
      text: "Opt 1",
    },
    type: 200,
  },
};

const fileUploadPassport = {
  data: {
    VKKfyUDKxs: [
      {
        serverFile: {
          fileHash:
            "8c91f81b213865af9632d2296039984753f0e41cfe234ba1dce65ad58568209b",
          fileId: "0702enth/my-file.png",
        },
        filename: "my",
        cachedSlot: {
          file: {
            path: "my",
            type: "image/png",
            size: 633,
          },
          status: "success",
          progress: 1,
          id: "0J0AX3GlR9ygsJC8Gh6-o",
          serverFile: {
            fileHash:
              "8c91f81b213865af9632d2296039984753f0e41cfe234ba1dce65ad58568209b",
            fileId: "0702enth/my",
          },
        },
      },
    ],
  },
};
