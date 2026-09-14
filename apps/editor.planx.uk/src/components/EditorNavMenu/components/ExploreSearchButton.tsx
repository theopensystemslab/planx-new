import TravelExploreIcon from "@mui/icons-material/TravelExplore";

import { ExploreButton } from "../styles";

export interface ExploreSearchButtonProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const ExploreSearchButton = ({
  title,
  isActive,
  onClick,
}: ExploreSearchButtonProps) => (
  <ExploreButton isActive={isActive} disableRipple onClick={onClick}>
    <TravelExploreIcon fontSize="small" />
    {title}
  </ExploreButton>
);

export default ExploreSearchButton;
