exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // Root → index document
  if (uri === "/") {
    request.uri = "/index.html";
    return request;
  }

  // Trailing slash (e.g. /about/ → /about.html)
  if (uri.endsWith("/")) {
    request.uri = `${uri.slice(0, -1)}.html`;
    return request;
  }

  // Extensionless path (e.g. /about → /about.html)
  if (!uri.includes(".")) {
    request.uri = `${uri}.html`;
  }

  // Pass everything else through unchanged
  return request;
};
