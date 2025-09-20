import { atom } from "nanostores";

interface Session {
  token: string | null;
  email: string | null;
}

export const $session = atom<Session>({
  token: null,
  email: null,
})