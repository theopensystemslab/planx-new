// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-localstorage-mock";
import "jest-axe/extend-expect";

import dotenv from "dotenv";
import { mockFade } from "testUtils";

dotenv.config({ path: "./.env.test" });

beforeAll(() => mockFade);
