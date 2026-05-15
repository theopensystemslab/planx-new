import CloudUpload from "@mui/icons-material/CloudUpload";
import Home from "@mui/icons-material/Home";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import PaymentOutlined from "@mui/icons-material/PaymentOutlined";
import { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export interface PatternComponent {
  slug: string;
  title: string;
}

export interface PatternItem {
  id: string;
  title: string;
  description: string;
  components: PatternComponent[];
  Icon: React.ComponentType<SvgIconProps>;
}

export const ALL_PATTERNS: PatternItem[] = [
  {
    id: "locate-and-see-constraints",
    Icon: LocationOnOutlined,
    title: "Locate and see constraints",
    description:
      "Help users find their property and view relevant planning constraints",
    components: [
      { slug: "find-property", title: "Find property" },
      { slug: "property-information", title: "Property information" },
      { slug: "draw-boundary", title: "Draw boundary" },
      { slug: "planning-constraints", title: "Planning constraints" },
    ],
  },
  {
    id: "about-the-applicant",
    Icon: Home,
    title: "About the applicant",
    description: "Collect contact and address details from the applicant",
    components: [
      { slug: "section", title: "Section" },
      { slug: "address-input", title: "Address input" },
      { slug: "contact-input", title: "Contact input" },
    ],
  },
  {
    id: "pay-and-submit",
    Icon: PaymentOutlined,
    title: "Pay and submit",
    description:
      "Set fees, collect payment from the applicant, and submit the application",
    components: [
      { slug: "set-fee", title: "Set fees" },
      { slug: "pay", title: "Pay" },
      { slug: "send", title: "Send" },
    ],
  },
  {
    id: "upload-and-validate-files",
    Icon: CloudUpload,
    title: "Upload and validate files",
    description:
      "Allow users to upload, label, and validate supporting documents",
    components: [
      { slug: "section", title: "Section" },
      { slug: "file-upload-and-label", title: "Upload and label" },
      { slug: "file-upload", title: "File upload" },
    ],
  },
];
