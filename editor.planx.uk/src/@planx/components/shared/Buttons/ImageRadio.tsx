import { RadioProps } from "@material-ui/core";
import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useLayoutEffect, useRef, useState } from "react";

export interface Props {
  id: string;
  title: string;
  description?: string;
  responseKey?: string | number;
  img?: string;
  onChange: RadioProps["onChange"];
}

const useStyles = makeStyles<Theme>((theme) => {
  return {
    img: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      objectFit: "contain",
      backgroundColor: "white",
    },
    key: {
      opacity: 0.3,
    },
    keySelected: {
      opacity: 0.7,
    },
    title: {
      marginLeft: theme.spacing(1.5),
    },
    subtitle: {
      marginTop: theme.spacing(1),
    },
    bold: {
      fontWeight: "bold",
    },
    label: {
      cursor: "pointer",
    },
    textLabelWrapper: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
    },
    imageButton: {
      alignItems: "flex-start",
    },
  };
});

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

  const classes = useStyles(props);

  return (
    <Box
      {...({ ref: textContentEl } as any)}
      alignItems={multiline ? "flex-start" : "center"}
      px={1}
      py={1}
      className={classes.textLabelWrapper}
    >
      <Box sx={{ paddingBottom: 2, display: "flex", alignItems: "center" }}>
        <Radio value={id} onChange={onChange} />
        <Typography>{title}</Typography>
      </Box>
      <Typography variant="body2">{description}</Typography>
    </Box>
  );
  // } else {
  //   const descriptionId = description ? `${id}-description` : undefined;
  //   return (
  //     <ButtonBase
  //       selected={props.selected}
  //       onClick={props.onClick}
  //       id={id}
  //       className={classes.imageButton}
  //     >
  //       <Box {...({ ref: textContentEl } as any)} px={2.25} py={1.75}>
  //         <Typography
  //           variant="body1"
  //           className={classes.bold}
  //           aria-describedby={descriptionId}
  //         >
  //           {title}
  //         </Typography>
  //         {Boolean(description) && (
  //           <Typography
  //             variant="body2"
  //             className={classes.subtitle}
  //             id={descriptionId}
  //           >
  //             {description}
  //           </Typography>
  //         )}
  //       </Box>
  //     </ButtonBase>
  //   );
  // }
};

interface ImageLabelProps {
  img?: string;
  alt?: string;
}

const ImageLabel = (props: ImageLabelProps): FCReturn => {
  const { img, alt } = props;
  const [imgError, setImgError] = useState(!(img && img.length));
  const classes = useStyles(props);
  const onError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  return (
    <Box
      width="100%"
      paddingTop="100%"
      position="relative"
      height={0}
      overflow="hidden"
      zIndex={2}
      borderBottom="none"
      bgcolor="background.default"
    >
      {imgError ? (
        <Box
          className={classes.img}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="secondary.dark"
        >
          <ImageIcon />
        </Box>
      ) : (
        <img
          className={classes.img}
          src={img}
          onError={onError}
          // Use a null alt to indicate that this image can be ignored by screen readers
          alt={alt || ""}
        />
      )}
    </Box>
  );
};

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  border: "2px lightgray solid",
  padding: theme.spacing(1.5),
  cursor: "pointer",
  display: "block",
  height: "100%",
}));

function ImageRadio(props: Props): FCReturn {
  const { img, description, title } = props;

  const altText = description ? `${title} - ${description}` : title;

  return (
    <StyledFormLabel>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        height="100%"
        data-testid="image-button"
      >
        <ImageLabel img={img} alt={altText} />
        <TextLabel {...props}></TextLabel>
      </Box>
    </StyledFormLabel>
  );
}

export default ImageRadio;
