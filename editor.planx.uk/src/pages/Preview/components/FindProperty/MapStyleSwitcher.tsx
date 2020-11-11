import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 1),
    backgroundColor: "#fff",
    boxShadow: "0 0 0 2px rgba(0,0,0,.1)",
    marginBottom: theme.spacing(1),
  },
  legend: {
    fontSize: 12,
    fontWeight: 700,
  },
  radioLabel: {
    fontSize: 14,
  },
}));

const MapStyleSwitcher = ({ handleChange, layer, options }: any) => {
  const classes = useStyles();

  return (
    <FormControl component="fieldset" className={classes.root}>
      <RadioGroup
        aria-label="Map style"
        name="mapstyle"
        value={layer}
        onChange={handleChange}
      >
        <FormControlLabel
          value=""
          control={<Radio size="small" />}
          label="streets"
          classes={{ label: classes.radioLabel }}
        />
        <FormControlLabel
          value="dark-v10"
          control={<Radio size="small" />}
          label="dark"
          classes={{ label: classes.radioLabel }}
        />
        <FormControlLabel
          value="satellite-v9"
          control={<Radio size="small" />}
          label="Satellite"
          classes={{ label: classes.radioLabel }}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default MapStyleSwitcher;
