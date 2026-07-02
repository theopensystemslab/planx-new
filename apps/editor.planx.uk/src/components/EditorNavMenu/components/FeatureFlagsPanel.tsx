import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import {
  AVAILABLE_FEATURE_FLAGS,
  type FeatureFlag,
  hasFeatureFlag,
  toggleFeatureFlag,
} from "lib/featureFlags";
import { useMemo, useState } from "react";
import { EmptyState } from "ui/editor/EmptyState";
import SettingsDescription from "ui/editor/SettingsDescription";
import { Switch } from "ui/shared/Switch";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const FeatureFlagsPanel = ({ anchorEl, onClose }: Props) => {
  const open = Boolean(anchorEl);

  const savedFlags = useMemo(
    () =>
      Object.fromEntries(
        AVAILABLE_FEATURE_FLAGS.map((flag) => [flag, hasFeatureFlag(flag)]),
      ) as Record<FeatureFlag, boolean>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
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
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slots={{ transition: Fade }}
      marginThreshold={0}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            display: "flex",
            flexDirection: "column",
            borderRadius: (theme) => `${theme.shape.borderRadius}px`,
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.5,
          position: "sticky",
          top: 0,
          backgroundColor: "background.paper",
          zIndex: 1,
        }}
      >
        <Typography variant="h4">Feature flags</Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ px: 1.5, py: 1, flex: 1 }}>
        <SettingsDescription>
          Enable experimental or in-development features in this environment.
          Changes take effect after saving (the page will auto-refresh).
        </SettingsDescription>
        {(AVAILABLE_FEATURE_FLAGS.length as number) === 0 ? (
          <EmptyState size="small" title="No feature flags available" />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
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
        )}
      </Box>
      <Box sx={{ px: 1.5, py: 1, display: "flex", gap: 1 }}>
        <Button variant="contained" disabled={!dirty} onClick={handleSave}>
          Save
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={!dirty}
          onClick={handleReset}
        >
          Reset
        </Button>
      </Box>
    </Popover>
  );
};

export default FeatureFlagsPanel;
