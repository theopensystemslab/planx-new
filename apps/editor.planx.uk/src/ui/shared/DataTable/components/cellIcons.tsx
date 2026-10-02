import { IconCheckFilled, IconXFilled } from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

export const True: React.FC = () => (
  <Icon icon={IconCheckFilled} color="success" fontSize="medium" />
);

export const False: React.FC = () => (
  <Icon icon={IconXFilled} color="error" fontSize="medium" />
);
