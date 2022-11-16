/*
 * Sourced from https://github.com/GeorgePhillips/node-s3-url-encode/blob/master/index.js
 * node-s3-url-encode - Because s3 urls are annoying
 */

const encodings: Record<string, string> = {
  "+": "%2B",
  "!": "%21",
  '"': "%22",
  "#": "%23",
  $: "%24",
  "£": "%C2%A3",
  "&": "%26",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
  ",": "%2C",
  ":": "%3A",
  ";": "%3B",
  "=": "%3D",
  "?": "%3F",
  "@": "%40",
};

function encodeS3URI(filename: string): string {
  return encodeURI(filename) // Do the standard url encoding
    .replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/gim, function (match) {
      return encodings[match];
    });
}

export { encodeS3URI };
