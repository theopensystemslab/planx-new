import { IconChevronDownFilled } from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

export const PopupIcon = (
  <Icon
    icon={IconChevronDownFilled}
    sx={(theme) => ({ color: theme.palette.primary.main })}
    fontSize="large"
  />
);
