const fs = require("fs");

const possibleDockerEnvVars = new Set(
  fs
    .readdirSync("..")
    .filter((fn) => fn.startsWith("docker-"))
    .flatMap((file) => extractPossibleEnvVars(`../${file}`))
);

const possiblePulumiEnvVars = new Set([
  ...extractPossibleEnvVars(`./application/index.ts`),
  ...extractPossibleEnvVars(`./certificates/index.ts`),
  ...extractPossibleEnvVars(`./data/index.ts`),
  ...extractPossibleEnvVars(`./networking/index.ts`)
]);

const inDockerAndPulumi = new Set(
  [...possibleDockerEnvVars].filter((x) => possiblePulumiEnvVars.has(x))
);

const inDockerOnly = new Set(
  [...possibleDockerEnvVars].filter((x) => !possiblePulumiEnvVars.has(x))
);

const inPulumiOnly = new Set(
  [...possiblePulumiEnvVars].filter((x) => !possibleDockerEnvVars.has(x))
);

console.log({ inDockerAndPulumi, inDockerOnly, inPulumiOnly });

function extractPossibleEnvVars(fileName) {
  const data = fs.readFileSync(fileName);
  return data.toString().match(/[A-Z][A-Z0-9_]{3,}/g) || [];
}
