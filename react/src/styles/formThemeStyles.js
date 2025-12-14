import { alpha } from "@mui/material/styles";

export const createSelectStyles = (theme, inputFontSize = "0.875rem") => {
  const palette = theme.palette;
  const bgPaper = palette.background.paper;
  const inputBg = palette.mode === "dark" ? "#1c1f24" : "#fff";
  const textPrimary = palette.text.primary;
  const textSecondary = palette.text.secondary;
  const divider = palette.divider;
  const primaryMain = palette.primary.main;
  const isDark = palette.mode === "dark";

  return {
    container: (base) => ({
      ...base,
      width: "100%",
      flex: 1,
      minWidth: 0,
    }),
    control: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      minHeight: 38,
      backgroundColor: inputBg,
      borderColor: state.isFocused ? primaryMain : divider,
      boxShadow: "none",
      ":hover": {
        borderColor: textSecondary,
      },
      color: textPrimary,
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: textPrimary,
    }),
    input: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: textPrimary,
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: textSecondary,
    }),
    menu: (base) => ({
      ...base,
      fontSize: inputFontSize,
      backgroundColor: inputBg,
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: inputBg,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      color: textPrimary,
      backgroundColor: state.isSelected
        ? alpha(primaryMain, isDark ? 0.24 : 0.12)
        : state.isFocused
          ? alpha(primaryMain, isDark ? 0.18 : 0.08)
          : inputBg,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };
};
