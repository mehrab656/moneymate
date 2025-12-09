import React from "react";
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * SidebarFooterButtons
 * Reusable footer actions renderer for GlobalSidebar and local sticky footers.
 *
 * props.actions: Array of action descriptors
 *   - label: string (button text)
 *   - type: 'submit' | 'button' (default 'button')
 *   - formId?: string (required when type='submit')
 *   - onClick?: Function (used when type='button')
 *   - variant?: 'contained' | 'outlined' | 'text' (default 'contained')
 *   - size?: 'small' | 'medium' | 'large' (default 'small')
 *   - sx?: MUI SX overrides
 *   - disabled?: boolean
 *   - ...rest: forwarded to Button
 *
 * Optional styling props:
 * - containerClassName: className for container div (default: 'd-flex gap-2')
 * - buttonProps: default props to merge into each Button
 */
const SidebarFooterButtons = ({
  actions = [],
  containerClassName = "d-flex gap-2",
  buttonProps = {},
  variant = "contained",
  size = "small",
}) => {
  const theme = useTheme();

  const defaultSx = {
    backgroundColor:
      theme.palette.mode === "light" ? theme.palette.grey[300] : undefined,
    color: theme.palette.mode === "light" ? theme.palette.text.primary : undefined,
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "light" ? theme.palette.grey[400] : undefined,
    },
  };

  return (
    <div className={containerClassName}>
      {actions.map((action, idx) => {
        const {
          label,
          type = "button",
          formId,
          onClick,
          variant: actionVariant = variant,
          size: actionSize = size,
          sx = {},
          disabled,
          ...rest
        } = action || {};

        const finalProps = {
          variant: actionVariant,
          size: actionSize,
          sx: { ...defaultSx, ...sx },
          disabled,
          ...buttonProps,
          ...rest,
        };

        if (type === "submit") {
          return (
            <Button key={idx} type="submit" form={formId} {...finalProps}>
              {label}
            </Button>
          );
        }
        return (
          <Button key={idx} onClick={onClick} {...finalProps}>
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default SidebarFooterButtons;

