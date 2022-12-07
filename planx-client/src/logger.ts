const logLevel = process.env.LOG_LEVEL;

// this simple wrapper allows debug logging to be turned with an environment variable
export default function log(args: any) {
  if (!logLevel) return;
  console.log(args);
}
