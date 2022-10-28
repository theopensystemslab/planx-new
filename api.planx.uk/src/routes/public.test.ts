import supertest from "supertest";
import app from "../routes";

const { get, post } = supertest(app);

describe("public routes", () => {
  describe("/", () => {
    test("successful response", async () => {
      await get("/").expect(200);
    });
  });

  describe("/throw-error", () => {
    test("error is thrown", async () => {
      await get("/throw-error")
        .expect(500)
        .then((response) => {
          expect(response.text).toEqual(
            JSON.stringify({ error: "custom error" })
          );
        });
    });
  });

  describe("/hasura", () => {
    test.todo("TODO");
  });

  describe("/create-send-events/:sessionId", () => {
    test.todo("unknown :sessionId");
  });

  describe("/resume-application", () => {
    test.todo("TODO");
  });

  describe("/validate-session", () => {
    test.todo("TODO");
  });

  describe("/download-application", () => {
    test.todo("TODO");
  });

  describe("/sign-s3-upload", () => {
    test("missing filename", async () => {
      await post("/sign-s3-upload").expect(422);
    });
  });
});
