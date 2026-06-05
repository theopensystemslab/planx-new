import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {
  AVAILABLE_FEATURE_FLAGS,
  type FeatureFlag,
  hasFeatureFlag,
  toggleFeatureFlag,
} from "lib/featureFlags";
import { useMemo, useState } from "react";
import { EmptyState } from "ui/editor/EmptyState";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";
import { Switch } from "ui/shared/Switch";

function FeatureFlagsSettings() {
  const savedFlags = useMemo(
    () =>
      Object.fromEntries(
        AVAILABLE_FEATURE_FLAGS.map((flag) => [flag, hasFeatureFlag(flag)]),
      ) as Record<FeatureFlag, boolean>,
    [],
  );

  const [workingFlags, setWorkingFlags] =
    useState<Record<FeatureFlag, boolean>>(savedFlags);

  const dirty = AVAILABLE_FEATURE_FLAGS.some(
    (flag) => workingFlags[flag] !== savedFlags[flag],
  );

  const handleToggle = (flag: FeatureFlag) => {
    setWorkingFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleSave = () => {
    AVAILABLE_FEATURE_FLAGS.forEach((flag) => {
      if (workingFlags[flag] !== savedFlags[flag]) {
        toggleFeatureFlag(flag, false);
      }
    });
    window.location.reload();
  };

  const handleReset = () => {
    setWorkingFlags(savedFlags);
  };

  return (
    <NewSettingsSection>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InputLegend>Feature flags</InputLegend>
          <SettingsDescription>
            Enable experimental or in-development features in this environment.
            Changes take effect after saving (the page will auto-refresh).
          </SettingsDescription>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {(AVAILABLE_FEATURE_FLAGS.length as number) === 0 ? (
            <EmptyState title="No feature flags available" />
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  paddingTop: 0.25,
                }}
              >
                {AVAILABLE_FEATURE_FLAGS.map((flag) => (
                  <Switch
                    key={flag}
                    label={flag.charAt(0) + flag.slice(1).toLowerCase()}
                    name={flag}
                    variant="editorPage"
                    capitalize
                    checked={workingFlags[flag]}
                    onChange={() => handleToggle(flag)}
                  />
                ))}
              </Box>
              <Box sx={{ mt: 2.5, display: "flex", gap: 1.5 }}>
                <Button
                  variant="contained"
                  disabled={!dirty}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!dirty}
                  onClick={handleReset}
                >
                  Reset changes
                </Button>
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </NewSettingsSection>
  );
}

export default FeatureFlagsSettings;
