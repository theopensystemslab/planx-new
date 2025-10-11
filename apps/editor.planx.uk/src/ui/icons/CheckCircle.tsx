import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import * as React from "react";

function CheckCircleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12,2C6.47,2,2,6.47,2,12s4.48,10,10,10,10-4.48,10-10S17.53,2,12,2ZM17.55,9.46l-6.6,6.6c-.43.43-1.13.43-1.55,0l-2.94-2.94c-.4-.44-.39-1.11.03-1.53.43-.41,1.1-.43,1.53-.03l2.16,2.16,5.83-5.83c.44-.4,1.11-.39,1.53.03.41.43.43,1.1.03,1.53Z" />
    </SvgIcon>
  );
}

CheckCircleIcon.muiName = "CheckCircleIcon";

export default CheckCircleIcon;
