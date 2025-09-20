// @mui
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
//
// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  height: "auto",
  display: "flex",
  textAlign: "center",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(8, 2),
}));


export default function EmptyContent({ title, description, img, ...other }) {
  return (
    <RootStyle {...other}>
      <img
        alt="empty content"
        src={img || "https://cdn-icons-png.flaticon.com/128/7486/7486744.png"}
      />

      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      )}
    </RootStyle>
  );
}
