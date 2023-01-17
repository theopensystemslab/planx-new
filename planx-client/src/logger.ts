// this simple wrapper allows debug logging to be turned with an environment variable
export default function log(...args: any[]): void {
  if (process.env.DEBUG) console.log(...args);
}
