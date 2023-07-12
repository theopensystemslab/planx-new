export function removeAt<T>(index: number, arr: Array<T>): Array<T> {
  return arr.filter((_item, i) => {
    return i !== index;
  });
}

export function setAt<T>(index: number, newItem: T, arr: Array<T>): Array<T> {
  return arr.map((item, i) => (i === index ? newItem : item));
}

// Basic explanation of this function: how many characters need to be shifted/modified in string 'a' to arrive at string 'b'
// Source: https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/string/levenshtein-distance/levenshteinDistance.js
export const levenshteinDistance = (a: string, b: string): number => {
  // Create empty edit distance matrix for all possible modifications of
  // substrings of a to substrings of b.
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  // Fill the first row of the matrix.
  // If this is first row then we're transforming empty string to a.
  // In this case the number of transformations equals to size of a substring.
  for (let i = 0; i <= a.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  // Fill the first column of the matrix.
  // If this is first column then we're transforming empty string to b.
  // In this case the number of transformations equals to size of b substring.
  for (let j = 0; j <= b.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // deletion
        distanceMatrix[j - 1][i] + 1, // insertion
        distanceMatrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return distanceMatrix[b.length][a.length];
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, "-") // swap any length of whitespace, underscore, hyphen characters with a single -
    .replace(/^-+|-+$/g, ""); // remove leading, trailing -
}

export const isLiveEnv = () =>
  ["production", "staging", "pizza"].includes(process.env.REACT_APP_ENV || "");

export const removeSessionIdSearchParam = () => {
  const currentURL = new URL(window.location.href);
  currentURL.searchParams.delete("sessionId");
  window.history.pushState({}, document.title, currentURL);
  window.location.reload();
};
