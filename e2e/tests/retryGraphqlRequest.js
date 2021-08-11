import { RequestMock, Selector } from "testcafe";
import { getAdminJWT, setJWT, gqlAdmin } from "../common.js";
import assert from "assert";

const URL = "http://localhost:3000";

const apiMock = RequestMock()
    .onRequestTo('http://localhost:7000/v1/graphql')
    .respond(
      '',
      404,
      {
        'Access-Control-Allow-Origin': '*'
      }
    );

fixture`Retry requests with network error`
  .page`${URL}`

const TEAM_NAME = "test-team";
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
        insert_users(objects: {first_name: "test", last_name: "test", email: "test@test.com"}) {
          returning { id }
        }
        insert_teams(objects: {name: "${TEAM_NAME}", slug: "${TEAM_NAME}"}) {
          returning { id }
        }
      }
  `));
  })
  .after(async (t) => {
    const { errors } = await gqlAdmin(`
      mutation {
        delete_users(where: {id: {_in: ${JSON.stringify([userId])}}}) {
          affected_rows
        }
        delete_teams(where: {id: {_in: ${JSON.stringify([teamId])}}}) {
          affected_rows
        }
      }
    `);

    assert(!errors, JSON.stringify(errors));
  })("Shows error toast when there is a network error and removes it when a retry is successful", async (t) => {
  // Log in
  await t.expect(Selector("a").innerText).eql("Login with Google");
  await setJWT(t, getAdminJWT(userId));

  // Switch to mock api after teams are loaded
  await t.expect(Selector("h2").withText(TEAM_NAME).exists).ok();
  await t.addRequestHooks(apiMock);
  await t.click(Selector("h2").withText(TEAM_NAME));

  // Expect error toast
  const toastText = "Network error, attempting to reconnect…"
  await t.expect(Selector("div").withText(toastText).exists).ok();

  // Switch back from mocked api
  await t.removeRequestHooks(apiMock);
  await t.expect(Selector("h1").withText('My services').exists).ok();
  await t.expect(Selector("div").withText(toastText).exists).notOk();

});

