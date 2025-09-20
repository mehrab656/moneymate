
const CenteredMessage = ({ text, color = "gray", size = "1.2rem" }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontWeight: "bold",
        color,
        fontSize: size,
      }}
    >
      {text}
    </div>
  );
};

export default CenteredMessage;
