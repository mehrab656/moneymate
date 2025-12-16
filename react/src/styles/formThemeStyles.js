import { alpha } from "@mui/material/styles";

export const createSelectStyles = (theme, inputFontSize = "0.875rem") => {
  const palette = theme.palette;
  const bgPaper = palette.background.paper;
  const inputBg = palette.mode === "dark" ? "#1c1f24" : "#fff";
  const textPrimary = palette.text.primary;
  const textSecondary = palette.text.secondary;
  const divider = palette.divider;
  const primaryMain = palette.primary.main;
  const secondaryMain = palette.secondary.main;
  const contrastOnPrimary = palette.getContrastText(primaryMain);
  const contrastOnSecondary = palette.getContrastText(secondaryMain);
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
      borderRadius: 4,
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: inputFontSize,
      color: textPrimary,
      fontWeight: 500,
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
      backgroundColor: bgPaper,
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: bgPaper,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: inputFontSize,
      color: state.isSelected ? contrastOnPrimary : textPrimary,
      backgroundColor: state.isSelected
        ? primaryMain
        : state.isFocused
          ? alpha(primaryMain, isDark ? 0.18 : 0.10)
          : bgPaper,
      ":active": {
        backgroundColor: state.isSelected ? primaryMain : alpha(primaryMain, isDark ? 0.22 : 0.12),
      },
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };
};

export const createInputGroupTextStyle = (theme) => {
  const bg = theme.palette.secondary.main;
  const fg = theme.palette.getContrastText(bg);
  return { backgroundColor: bg, color: fg };
};

export const createDateInputStyle = (theme, inputFontSize = "0.875rem") => {
  const palette = theme.palette;
  const inputBg = palette.mode === "dark" ? "#1c1f24" : "#fff";
  const textPrimary = palette.text.primary;
  const borderColor = palette.mode === "dark" ? "#3a4048" : "#c5ccd6";
  return {
    backgroundColor: inputBg,
    color: textPrimary,
    borderColor,
    fontSize: inputFontSize,
    minHeight: 36,
    height: 36,
  };
};
