import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const LOGO_SRC = "/brand/hermes-logo.png";
const LOGO_HEIGHT = 250;
const LOGO_WIDTH = 160;
const LOGO_COLOR = "#EDEFF2";

const Logo = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasError(false);
    img.onerror = () => setHasError(true);
    img.src = LOGO_SRC;
  }, []);

  if (hasError) {
    return (
      <Typography variant="h6" fontWeight={700} color="#fff">
        hermes
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        height: LOGO_HEIGHT,
        width: LOGO_WIDTH,
        maxWidth: "100%",
        backgroundColor: LOGO_COLOR,
        maskImage: `url(${LOGO_SRC})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        WebkitMaskImage: `url(${LOGO_SRC})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        display: "block",
      }}
    />
  );
};

export default Logo;
