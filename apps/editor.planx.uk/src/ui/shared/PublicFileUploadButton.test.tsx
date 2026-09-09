import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from "@planx/file-upload";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import { vi } from "vitest";

import PublicFileUploadButton from "./PublicFileUploadButton";

const FILE_URL = `${import.meta.env.VITE_APP_API_URL}/file/public/abc12345/logo.png`;

/**
 * This dropzone used to pass neither `onDropRejected` nor `maxSize`, so an oversized or
 * wrong-typed image did nothing whatsoever - the file was dropped on the floor in silence.
 *
 * Note its `accept` uses the `image/*` wildcard, which admits image formats the API refuses
 * (e.g. .avif, .heic), hence the extension validator - see extensionValidator.
 */

const dropFile = async (file: File) => {
  const onChange = vi.fn();
  // applyAccept: false because user-event otherwise filters by the input's `accept` attribute
  const utils = await setup(<PublicFileUploadButton onChange={onChange} />, {
    applyAccept: false,
  });

  await utils.user.upload(utils.getByTestId("upload-file-input"), file);

  return { ...utils, onChange };
};

it("reports an image format we do not accept", async () => {
  const file = new File(["x"], "logo.avif", { type: "image/avif" });

  const { findByLabelText, onChange } = await dropFile(file);

  // message is shared with applicant-facing Dropzone, but narrowed to a smaller field of accepted extensions
  expect(
    await findByLabelText(
      /File must be one of the following types: jpg, jpeg, png, svg$/,
    ),
  ).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it("reports an oversized image", async () => {
  const file = new File(["x"], "logo.png", { type: "image/png" });
  Object.defineProperty(file, "size", { value: MAX_UPLOAD_SIZE_BYTES + 1 });

  const { findByLabelText, onChange } = await dropFile(file);

  expect(
    await findByLabelText(
      new RegExp(`File must be smaller than ${MAX_UPLOAD_SIZE_MB}MB`),
    ),
  ).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

describe("waiting for the uploaded file to be servable", () => {
  const uploadHandler = http.post(
    `${import.meta.env.VITE_APP_API_URL}/file/public/upload`,
    () => HttpResponse.json({ fileType: "image/png", fileUrl: FILE_URL }),
  );

  it("holds off firing onChange until the file can actually be fetched", async () => {
    // hold the file request open with a deferred promise,
    // so we can observe the button mid-wait rather than racing it
    let serveFile: () => void;
    const fileRequested = new Promise<void>((resolve) => {
      serveFile = resolve;
    });

    server.use(
      uploadHandler,
      http.get(FILE_URL, async () => {
        await fileRequested;
        return new HttpResponse("image-bytes", { status: 200 });
      }),
    );

    const { onChange, findByLabelText } = await dropFile(
      new File(["x"], "logo.png", { type: "image/png" }),
    );

    // the button stays busy while the file is not yet servable
    expect(await findByLabelText("Upload image")).toHaveAttribute("aria-busy");
    expect(onChange).not.toHaveBeenCalled();

    // resolve the deferred promise, i.e. have the file request come back
    serveFile!();

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(FILE_URL));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the upload but warns when the scan is still pending", async () => {
    server.use(
      uploadHandler,
      http.get(FILE_URL, () =>
        HttpResponse.json(
          { error: "FILE_SCAN_PENDING" },
          { status: 503, headers: { "Retry-After": "0" } },
        ),
      ),
    );

    const { onChange, findByLabelText } = await dropFile(
      new File(["x"], "logo.png", { type: "image/png" }),
    );

    // the upload did succeed, so we keep the URL rather than discarding it
    expect(
      await findByLabelText(/may take a moment to appear/),
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(FILE_URL);
  });

  it("discards a file the scan has rejected", async () => {
    server.use(
      uploadHandler,
      http.get(FILE_URL, () =>
        HttpResponse.json({ error: "FILE_FLAGGED" }, { status: 404 }),
      ),
    );

    const { onChange, findByLabelText } = await dropFile(
      new File(["x"], "logo.png", { type: "image/png" }),
    );

    expect(
      await findByLabelText(/File could not be processed/),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
