import type { SvgIconProps } from "@mui/material/SvgIcon";
import SvgIcon from "@mui/material/SvgIcon";

export default function NoteIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M22,7.5c0-1.1-.9-2-2-2H4c-1.1,0-2,.9-2,2v9c0,1.1.9,2,2,2h12l6-6v-5ZM15,11.5h5.5l-5.5,5.5v-5.5Z" />
    </SvgIcon>
  );
}
