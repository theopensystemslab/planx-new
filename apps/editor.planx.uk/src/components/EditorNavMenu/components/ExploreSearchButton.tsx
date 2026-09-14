import SearchIcon from "@mui/icons-material/Search";

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
    <SearchIcon fontSize="small" />
    {title}
  </ExploreButton>
);

export default ExploreSearchButton;
