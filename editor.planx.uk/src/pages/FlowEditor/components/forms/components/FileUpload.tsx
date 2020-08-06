import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import ImageIcon from "@material-ui/icons/Image";
import axios from "axios";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onChange?: (image: string) => void;
}

const fileUploadStyles = makeStyles((theme) => ({
  inputIconButton: {
    borderRadius: 0,
    height: 50,
    width: 50,
    backgroundColor: "#fff",
    color: theme.palette.text.secondary,
  },
  focused: {
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

interface SignedUrlResponse {
  upload_to: string;
  public_readonly_url_will_be: string;
}

const uploadRequest = (
  signedUrlResponse: SignedUrlResponse,
  file: File
): Promise<string> =>
  new Promise(async (resolve, reject) => {
    try {
      await axios.put(signedUrlResponse.upload_to, file, {
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": `inline;filename="${file.name}"`,
        },
      });
      resolve(signedUrlResponse.public_readonly_url_will_be);
    } catch (err) {
      reject(err);
    }

    // const formData = new FormData();
    // formData.append("file", file);
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState !== 4) {
    //     return;
    //   }
    //   if (xhr.status !== 200) {
    //     reject({
    //       error: true,
    //       readyState: xhr.readyState,
    //       status: xhr.status,
    //     });
    //     return;
    //   }
    //   resolve(signedUrlResponse.public_readonly_url_will_be);
    // };
    // xhr.open("PUT", signedUrlResponse.upload_to, true);
    // // xhr.setRequestHeader("Content-Type", signedUrlResponse.file_type);
    // // xhr.setRequestHeader("Content-Disposition", `inline;filename=${file.name}`);
    // xhr.send(formData);
  });

const FileUpload: React.FC<Props> = (props) => {
  const onDrop = useCallback((files) => {
    const file: File = files[0];
    if (!file) {
      return;
    }
    // Do something here
    fetch(`${process.env.REACT_APP_API_URL}/sign-s3-upload`, {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        return uploadRequest(res, file);
      })
      .then((res) => {
        console.log({ uploaded: res });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const classes = fileUploadStyles();
  return (
    <ButtonBase
      onClick={() => {
        props.onChange && props.onChange("image");
      }}
      classes={{
        root: classes.inputIconButton,
        focusVisible: classes.focused,
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <ImageIcon />
    </ButtonBase>
  );
};

export default FileUpload;
