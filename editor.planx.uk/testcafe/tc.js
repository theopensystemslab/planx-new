import { ClientFunction, Selector } from "testcafe";

const URL = "http://localhost:3000";

const setCookie = ClientFunction((JWT) => {
  document.cookie = `jwt=${JWT}`;
  window.location.reload();
});

fixture`Logging in`.page`${URL}`.beforeEach(async () => {
  await setCookie(process.env.JWT);
});

test("Teams List", async (t) => {
  await t.expect(Selector("title").innerText).eql("Teams | PlanX");
});
