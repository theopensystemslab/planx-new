const getFlags = () => {
  let flags: Set<string> = new Set();
  try {
    const existingFlags = localStorage.getItem("FEATURE_FLAGS");
    if (existingFlags) {
      flags = new Set(JSON.parse(existingFlags));
    }
  } catch (err) {}
  return flags;
};

const toggleFlag = (flag: string) => {
  const flags = getFlags();

  if (flags.has(flag)) {
    flags.delete(flag);
  } else {
    flags.add(flag);
  }

  localStorage.setItem("FEATURE_FLAGS", JSON.stringify(Array.from(flags)));

  console.debug({ flags });
};

export const flagEnabled = (flag: string) => getFlags().has(flag);

(window as any).featureFlags = {
  toggle: toggleFlag,
  get: getFlags,
  isEnabled: flagEnabled,
};

export const FEATURE_FLAG__CAN_SAVE_AND_RETURN = flagEnabled("SAVE_AND_RETURN");
