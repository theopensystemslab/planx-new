import { parseMoreInformation } from "../shared";

export interface Send {}

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  ...parseMoreInformation(data),
});

export const BOPS_URL = `${process.env.REACT_APP_API_URL}/bops`;
