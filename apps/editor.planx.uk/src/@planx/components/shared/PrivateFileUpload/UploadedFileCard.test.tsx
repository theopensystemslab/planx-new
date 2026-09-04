import { screen } from "@testing-library/react";
import { setup } from "test/utils";
import { vi } from "vitest";

import { UploadedFileCard } from "./UploadedFileCard";

/**
 * Only formats in PREVIEWABLE_MIME_TYPES may be rendered inline. SVG in particular must not be,
 * since it is the one type we accept that can carry active content, and the one type our
 * content validation cannot sniff.
 */
type UploadedFileCardProps = React.ComponentProps<typeof UploadedFileCard>;

const buildProps = (file: File): UploadedFileCardProps => ({
  file,
  status: "success",
  progress: 1,
  id: "test-slot",
  drawingNumber: undefined,
  removeFile: vi.fn(),
});

const previewImage = () => screen.queryByAltText(/Preview of uploaded file/);

describe("thumbnail previews", () => {
  beforeAll(() => {
    // jsdom does not implement object URLs
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("previews a PNG", async () => {
    const file = new File(["x"], "plan.png", { type: "image/png" });
    await setup(<UploadedFileCard {...buildProps(file)} />);

    expect(previewImage()).toBeInTheDocument();
  });

  it("does not preview an SVG", async () => {
    const file = new File(["<svg/>"], "plan.svg", { type: "image/svg+xml" });
    await setup(<UploadedFileCard {...buildProps(file)} />);

    expect(previewImage()).not.toBeInTheDocument();
  });

  it.each([
    ["application/pdf", "plan.pdf"],
    ["text/csv", "data.csv"],
    ["video/mp4", "walkthrough.mp4"],
    ["image/vnd.dwg", "site.dwg"],
    ["image/tiff", "scan.tif"],
  ])("does not preview %s", async (type, name) => {
    const file = new File(["x"], name, { type });
    await setup(<UploadedFileCard {...buildProps(file)} />);

    expect(previewImage()).not.toBeInTheDocument();
  });

  it("does not preview a file recovered from a saved session", async () => {
    // cached slots carry a plain object rather than a File, so there are no bytes to preview
    const notAFile = { name: "plan.png", type: "image/png" } as unknown as File;
    await setup(<UploadedFileCard {...buildProps(notAFile)} />);

    expect(previewImage()).not.toBeInTheDocument();
  });
});
