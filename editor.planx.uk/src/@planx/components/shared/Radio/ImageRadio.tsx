import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Radio, { RadioProps } from "@mui/material/Radio";
import { useRadioGroup } from "@mui/material/RadioGroup";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useLayoutEffect, useRef, useState } from "react";

export interface Props {
  id: string;
  title: string;
  description?: string;
  responseKey?: string | number;
  img?: string;
  onChange: RadioProps["onChange"];
}

const FallbackImage = styled(Box)({
  alignItems: "center",
  backgroundColor: "white",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  left: 0,
  objectFit: "contain",
  position: "absolute",
  top: 0,
  width: "100%",
});

const Image = styled("img")({
  alignItems: "center",
  backgroundColor: "white",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  left: 0,
  objectFit: "contain",
  position: "absolute",
  top: 0,
  width: "100%",
});

const ImageLabelRoot = styled(Box)(() => ({
  width: "100%",
  paddingTop: "100%",
  position: "relative",
  height: 0,
  overflow: "hidden",
  zIndex: 2,
  borderBottom: "none",
}));

const TextLabelRoot = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
}));

const TextLabelContainer = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.primary,
  "& > p": {
    color: theme.palette.text.secondary,
  },
}));

interface StyledFormLabelProps {
  isSelected: boolean;
}

const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<StyledFormLabelProps>(({ theme, isSelected }) => ({
  border: "2px solid",
  borderColor: isSelected
    ? theme.palette.primary.main
    : theme.palette.secondary.main,
  padding: theme.spacing(1),
  cursor: "pointer",
  display: "block",
  height: "100%",
}));

const TextLabel = (props: Props): FCReturn => {
  const { title, id, onChange, description } = props;
  const [multiline, setMultiline] = useState(false);

  const textContentEl = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (textContentEl.current) {
      const totalHeight = textContentEl.current.offsetHeight;
      // It's possible to calculate the number of lines of text, but we need this
      // to align differently even if there is only one line of text in this
      // component but more in its neighbour
      if (totalHeight > 50) {
        setMultiline(true);
      }
    }
  });

  return (
    <TextLabelRoot
      {...({ ref: textContentEl } as any)}
      sx={{ alignItems: multiline ? "flex-start" : "center", padding: 0.5 }}
    >
      <TextLabelContainer>
        <Radio value={id} onChange={onChange} />
        <Typography>{title}</Typography>
      </TextLabelContainer>
      <Typography variant="body2">{description}</Typography>
    </TextLabelRoot>
  );
};

const ImageLabel = (props: Props): FCReturn => {
  const { img, title, description } = props;
  const altText = description ? `${title} - ${description}` : title;
  const [imgError, setImgError] = useState(!(img && img.length));
  const onError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  return (
    <ImageLabelRoot>
      {imgError ? (
        <FallbackImage>
          <ImageIcon />
        </FallbackImage>
      ) : (
        <Image
          src={img}
          onError={onError}
          // Use a null alt to indicate that this image can be ignored by screen readers
          alt={altText || ""}
        />
      )}
    </ImageLabelRoot>
  );
};

const ImageRadio: React.FC<Props> = (props: Props) => {
  const radioGroupState = useRadioGroup();
  const isSelected = radioGroupState?.value === props.id;

  return (
    <StyledFormLabel focused={false} isSelected={isSelected}>
      <ImageLabel {...props} />
      <TextLabel {...props} />
    </StyledFormLabel>
  );
};

export default ImageRadio;
