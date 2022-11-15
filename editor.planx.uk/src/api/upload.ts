import axios from "axios";

export { uploadFile };

async function uploadFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {}
) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/sign-s3-upload`, {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const token = await res.json();
  await axios.put(token.upload_to, file, {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `inline;filename="${file.name}"`,
    },
    onUploadProgress: ({ loaded, total }) => {
      if (onProgress) {
        onProgress(loaded / total);
      }
    },
  });
  return token.public_readonly_url_will_be;
}
