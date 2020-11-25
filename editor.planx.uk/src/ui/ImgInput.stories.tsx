import Box from "@material-ui/core/Box";
import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import ImgInput from "./ImgInput";

export default {
  title: "Forms/Image Upload", // Stories will be organized based on hierarchy specified with `/` in the `title`
  component: ImgInput, // DocsPage will infer props from the component for generated documentation
} as Meta;

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
