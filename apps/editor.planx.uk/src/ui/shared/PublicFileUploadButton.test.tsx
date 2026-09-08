import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from "@planx/file-upload";
import { setup } from "test/utils";
import { vi } from "vitest";

import PublicFileUploadButton from "./PublicFileUploadButton";

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
