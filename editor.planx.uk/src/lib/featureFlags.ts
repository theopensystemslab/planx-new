// add/edit/remove feature flags in array below
const AVAILABLE_FEATURE_FLAGS = [
  "DISABLE_SAVE_AND_RETURN",
] as const;

type featureFlag = (typeof AVAILABLE_FEATURE_FLAGS)[number];

/**
 * get list of feature flags that have been enabled for this session
 * @returns Set of feature flag strings
 */
const activeFeatureFlags = (() => {
  let flags: Set<featureFlag> = new Set();
  try {
    const existingFlags = localStorage.getItem("FEATURE_FLAGS");
    if (existingFlags) {
      flags = new Set(JSON.parse(existingFlags));
    }
  } catch (err) {}
  return flags;
})();

/**
 * switches feature flag on/off based on whether or not it's already active
 * @param flag feature flag name
 * @param autoReload reload the page after change? default = true
 */
export const toggleFeatureFlag = (
  featureFlag: featureFlag,
  autoReload = true
) => {
  const supportedFlag = AVAILABLE_FEATURE_FLAGS.includes(featureFlag);

  if (activeFeatureFlags.has(featureFlag)) {
    activeFeatureFlags.delete(featureFlag);
  } else if (supportedFlag) {
    activeFeatureFlags.add(featureFlag);
  } else {
    throw new Error(
      `${featureFlag} is not a supported feature flag, try again. Available flags are: ${AVAILABLE_FEATURE_FLAGS}`
    );
  }

  localStorage.setItem(
    "FEATURE_FLAGS",
    JSON.stringify(Array.from(activeFeatureFlags))
  );

  if (autoReload) window.location.reload();
};

/**
 * check if feature flag is active
 * @param flag flag name
 * @returns boolean
 */
export const hasFeatureFlag = (featureFlag: featureFlag) =>
  activeFeatureFlags.has(featureFlag);

// add methods to window for easy access in browser console
(window as any).featureFlags = {
  toggle: toggleFeatureFlag,
  active: activeFeatureFlags,
  has: hasFeatureFlag,
};

if (process.env.REACT_APP_ENV !== "test") {
  // log current flag status on page load
  console.debug(
    activeFeatureFlags.size > 0
      ? `🎏 ${activeFeatureFlags.size} feature flags enabled: ${[
          ...activeFeatureFlags,
        ]
          .sort()
          .join(", ")}`
      : `🎏 no active feature flags`
  );
}
