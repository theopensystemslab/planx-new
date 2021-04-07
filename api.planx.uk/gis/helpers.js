const makeUrlFromObject = ({ root, params = {} }) =>
  [
    root,
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, escape(String(v))].join("="))
      .join("&"),
  ]
    .filter(Boolean)
    .join("?");

const makeObjectFromUrl = (url) => {
  const [root, queryString = ""] = url.split("?");
  const params = queryString.split("&").reduce((acc, curr) => {
    const [k, v] = curr.split("=");
    acc[k] = unescape(v);
    return acc;
  }, {});
  return { root, params };
};

module.exports = { 
  makeUrlFromObject, 
  makeObjectFromUrl,
};
