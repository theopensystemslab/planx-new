import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  icon: {
    borderRadius: 15,
    "&:hover": {
      backgroundColor: theme.palette.grey[300],
    },
  },
}));

export default function MoreInfoIcon(props: SvgIconProps) {
  const classes = useStyles();
  return (
    <SvgIcon {...props} className={classes.icon}>
      <g>
        <circle cx="15" cy="15" r="14.5" stroke="black" fill="transparent" />
        <path
          d="M13.9899 16.9318H15.2683V16.8679C15.2896 15.5469 15.6305 14.9716 16.568 14.3857C17.5055 13.8157 18.0595 12.9954 18.0595 11.8182C18.0595 10.1562 16.845 8.94176 14.97 8.94176C13.2442 8.94176 11.8752 10.0071 11.7953 11.8182H13.1377C13.2176 10.5611 14.0965 10.0497 14.97 10.0497C15.9715 10.0497 16.7811 10.7102 16.7811 11.7543C16.7811 12.6012 16.2964 13.2085 15.6732 13.5866C14.6291 14.2205 14.0059 14.8384 13.9899 16.8679V16.9318ZM14.6717 20.0852C15.1991 20.0852 15.6305 19.6538 15.6305 19.1264C15.6305 18.5991 15.1991 18.1676 14.6717 18.1676C14.1444 18.1676 13.7129 18.5991 13.7129 19.1264C13.7129 19.6538 14.1444 20.0852 14.6717 20.0852Z"
          fill="black"
        />
      </g>
    </SvgIcon>
  );
}
