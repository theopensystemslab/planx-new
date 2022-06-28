export { downloadFile, getPrivateFileURL };

function getPrivateFileURL(fileKey: string) {
  return `${process.env.REACT_APP_API_URL}/file/private/${fileKey}`;
}

async function downloadFile(fileKey: string, fileHash: string) {
  const res = await fetch(getPrivateFileURL(fileKey), {
    method: "GET",
    headers: {
      "file-hash": fileHash,
    },
  });
  return res.blob();
}
