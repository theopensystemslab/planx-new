import Box from "@mui/material/Box";
import { Meta } from "@storybook/react";
import React, { useState } from "react";

import ImgInput from "./ImgInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Image Upload",
  component: ImgInput,
};

export const Basic = () => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  return (
    <>
      <ImgInput onChange={setImageUrl} />
      {imageUrl && (
        <Box
          width="20rem"
          m={1}
          border="1px solid black"
          display="flex"
          justifyContent="center"
        >
          <img src={imageUrl} style={{ width: "100%" }} alt="example" />
        </Box>
      )}
    </>
  );
};

export default metadata;
