export const getFeatureFlags = () => {
  let flags: Set<string> = new Set();
  try {
    const existingFlags = localStorage.getItem("FEATURE_FLAGS");
    if (existingFlags) {
      flags = new Set(JSON.parse(existingFlags));
    }
  } catch (err) {}
  return flags;
};

const toggleFeatureFlag = (flag: string) => {
  const flags = getFeatureFlags();

  if (flags.has(flag)) {
    flags.delete(flag);
  } else {
    flags.add(flag);
  }

  localStorage.setItem("FEATURE_FLAGS", JSON.stringify(Array.from(flags)));

  console.debug({ flags });
};

export const flagEnabled = (flag: string) => getFeatureFlags().has(flag);

(window as any).featureFlags = {
  toggle: toggleFeatureFlag,
  get: getFeatureFlags,
  isEnabled: flagEnabled,
};

export const FEATURE_FLAG__CAN_SAVE_AND_RETURN = flagEnabled("SAVE_AND_RETURN");
