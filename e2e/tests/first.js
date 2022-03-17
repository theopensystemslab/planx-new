import assert from "assert";
import { Selector } from "testcafe";
import { getAdminJWT, gqlAdmin, setJWT } from "../common.js";

const URL = "http://localhost:3000";

fixture`Home page`.page`${URL}`;

const TEAM_NAME = "test-team";
const USER_EMAIL = "test@test.com";
const SERVICE_NAME = "test-service";

let userId;
let teamId;
test
  .before(async (t) => {
    ({
      data: {
        insert_users: {
          returning: [{ id: userId }],
        },
        insert_teams: {
          returning: [{ id: teamId }],
        },
      },
    } = await gqlAdmin(`
      mutation {
        delete_users(where: {email: {_eq: "${USER_EMAIL}"}}) {
          affected_rows
        }
        delete_teams(where: {slug: {_eq: "${TEAM_NAME}"}}) {
          affected_rows
        }
        insert_users(objects: {first_name: "test", last_name: "test", email: "${USER_EMAIL}"}) {
          returning { id }
        }
        insert_teams(objects: {name: "${TEAM_NAME}", slug: "${TEAM_NAME}"}) {
          returning { id }
        }
      }
    `));
  })
  .after(async (t) => {
    // TODO: determine whether or not to delete analytics when flow deleted
    await gqlAdmin(`
      mutation {
        delete_analytics_logs(where: {}) {
          affected_rows
        }
        delete_analytics(where: {}) {
          affected_rows
        }
      }
    `);

    const { errors } = await gqlAdmin(`
      mutation {
        delete_operations(where: {actor_id: {_in: ${JSON.stringify([
          userId,
        ])}}}) {
          affected_rows
        }
        delete_users(where: {id: {_in: ${JSON.stringify([userId])}}}) {
          affected_rows
        }
        delete_flows(where: {team_id: {_in: ${JSON.stringify([
          teamId,
        ])}}, slug: {_in: ${JSON.stringify([SERVICE_NAME])}}}) {
          affected_rows
        }
        delete_teams(where: {id: {_in: ${JSON.stringify([teamId])}}}) {
          affected_rows
        }
      }
    `);

    assert(!errors, JSON.stringify(errors));
  })("creates a flow that is executable", async (t) => {
  // Log in
  await t.expect(Selector("a").innerText).eql("Login with Google");
  await setJWT(getAdminJWT(userId));

  // Create a service
  await t.click(Selector("h2").withText(TEAM_NAME));
  await t.setNativeDialogHandler(() => SERVICE_NAME, {
    dependencies: { SERVICE_NAME },
  });
  await t.click(Selector("button").withText("Add a new service"));

  // Add a Question node
  await t.click("li.hanger>a");
  await t.typeText(
    Selector("input").withAttribute("placeholder", "Text"),
    "Is this a test?"
  );
  await t.click(Selector("span").withText("add new"));
  await t.typeText(
    Selector("input").withAttribute("placeholder", "Option"),
    "Yes"
  );
  await t.click(Selector("span").withText("add new"));
  await t.typeText(
    Selector("input").withAttribute("placeholder", "Option").nth(1),
    "No"
  );
  await t.click(Selector("span").withText("Create question"));

  // Add a notice to the "Yes" path
  const yesPath = Selector("li").withAttribute("class", "hanger").nth(1);
  await t.click(yesPath);
  await t.click(Selector("select"));
  await t.click(
    Selector("select")
      .child("optgroup")
      .withAttribute("label", "Information")
      .child("option")
      .withText("Notice")
  );
  const yesNoticeResult = "Yes! This is a test.";
  await t.typeText(
    Selector("input").withAttribute("placeholder", "Notice"),
    yesNoticeResult
  );
  await t.click(Selector("span").withText("Create notice"));

  // Add a notice to the "No" path
  const noPath = Selector("li")
    .withAttribute("class", "card option")
    .nth(1)
    .child("ol")
    .child("li")
    .child("a");
  await t.click(noPath);
  await t.click(Selector("select"));
  await t.click(
    Selector("select")
      .child("optgroup")
      .withAttribute("label", "Information")
      .child("option")
      .withText("Notice")
  );
  const noNoticeResult = "Sorry, this is a test";
  await t.typeText(
    Selector("input").withAttribute("placeholder", "Notice"),
    noNoticeResult
  );
  await t.click(Selector("span").withText("Create notice"));

  // Open preview URL
  const previewUrl = await Selector("a")
    .withAttribute("href", /preview/)
    .getAttribute("href");
  await t.navigateTo(previewUrl);

  // Test flow
  await t.click(Selector("p").withText("Yes"));
  await t.click(Selector("button").withText("Continue"));
  await t.expect(Selector("h3").withText(yesNoticeResult).exists).ok();

  await t.click(Selector("button").withText("Back"));

  await t.click(Selector("p").withText("No"));
  await t.click(Selector("button").withText("Continue"));
  await t.expect(Selector("h3").withText(noNoticeResult).exists).ok();
});
