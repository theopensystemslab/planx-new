import supertest from "supertest";
import app from "../../../../server";

const { post } = supertest(app);
const ENDPOINT = "/webhooks/hasura/validate-input/jsonb/clean-html";

describe("Authentication", () => {
  it("fails without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });
});

describe("Dirty HTML", () => {
  it("handles a simple object", async () => {
    const body = {
      data: {
        input: [{ key1: "<img src=x onerror=alert(1)//>" }],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: "Invalid HTML content",
        });
      });
  });

  it("handles a deeply nested object", async () => {
    const body = {
      data: {
        input: [
          {
            a: {
              b: {
                c: {
                  d: {
                    e: "<img src=x onerror=alert(1)//>",
                  },
                },
              },
            },
          },
        ],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: "Invalid HTML content",
        });
      });
  });
});

describe("Clean HTML", () => {
  it("handles a simple object", async () => {
    const body = {
      data: {
        input: [{ key1: '<img src="cuteDogs.jpg">' }],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => expect(response.body).toEqual({}));
  });

  it("handles a deeply nested object", async () => {
    const body = {
      data: {
        input: [
          {
            a: {
              b: {
                c: {
                  d: {
                    e: '<img src="cuteDogs.jpg">',
                  },
                },
              },
            },
          },
        ],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => expect(response.body).toEqual({}));
  });
});

describe("Mixed clean and dirty HTML", () => {
  it("handles a simple object", async () => {
    const body = {
      data: {
        input: [
          { key1: '<img src="cuteDogs.jpg">' },
          { key1: "<img src=x onerror=alert(1)//>" },
        ],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: "Invalid HTML content",
        });
      });
  });

  it("handles a deeply nested object", async () => {
    const body = {
      data: {
        input: [
          {
            a: {
              b: {
                c: '<img src="cuteDogs.jpg">',
                d: {
                  e: {
                    f: "<img src=x onerror=alert(1)//>",
                  },
                },
              },
            },
          },
        ],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: "Invalid HTML content",
        });
      });
  });
});

describe("Non-HTML input", () => {
  it("handles a simple object", async () => {
    const body = {
      data: {
        input: [
          { key1: 12345 },
          { key2: false },
          { key3: 3.14 },
          { key4: "This is just a string" },
          { key5: null },
          { key6: undefined },
          { key6: [] },
          { key6: {} },
        ],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => expect(response.body).toEqual({}));
  });

  it("handles a deeply nested object", async () => {
    const body = {
      data: {
        input: [
          {
            a: {
              a1: 12345,
              a2: null,
              b: {
                b1: false,
                b2: undefined,
                c: {
                  c1: 3.14,
                  c2: [],
                  d: {
                    d1: "This is just a string",
                    d2: {},
                  },
                },
              },
            },
          },
        ],
      },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => expect(response.body).toEqual({}));
  });
});
