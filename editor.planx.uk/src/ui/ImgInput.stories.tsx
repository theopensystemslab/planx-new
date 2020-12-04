import Box from "@material-ui/core/Box";
import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import ImgInput from "./ImgInput";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Image Upload",
  component: ImgInput,
};

export const Basic = () => {
  const [imageUrl, setImageUrl] = useState<string>();

  return (
    <>
      <ImgInput onChange={(url: string) => setImageUrl(url)} />
      {imageUrl && (
        <Box
          width="20rem"
          m={1}
          border="1px solid black"
          display="flex"
          justifyContent="center"
        >
          <img src={imageUrl} style={{ width: "100%" }} />
        </Box>
      )}
    </>
  );
};

export default metadata;
