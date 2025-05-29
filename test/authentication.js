const assert = require("assert");

require("should");

const zapier = require("zapier-platform-core");

const App = require("../index");
const appTester = zapier.createAppTester(App);

describe("Authentication", () => {
  zapier.tools.env.inject();

  it("should authenticate", async () => {
    const bundle = {
      authData: {
        apiToken: process.env.authData_apiToken,
        apiHost: process.env.authData_apiHost || "https://cloud.yepcode.io",
      },
    };

    const result = await appTester(App.authentication.test, bundle);
    assert.ok(result);
  });

  describe("should fail", () => {
    it("with invalid api token", async () => {
      const bundle = {
        authData: {
          apiToken: "invalid",
        },
      };

      await assert.rejects(
        async () => {
          await appTester(App.authentication.test, bundle);
        },
        (err) => {
          assert.strictEqual(err.name, "AppError");
          const parsedMessage = JSON.parse(err.message);
          assert.strictEqual(parsedMessage.code, "AuthenticationError");
          assert.strictEqual(parsedMessage.status, 401);
          assert.ok(parsedMessage.message.includes("Invalid API Token"));
          return true;
        }
      );
    });

    it("with invalid api host", async () => {
      const bundle = {
        authData: {
          apiToken: process.env.authData_apiToken,
          apiHost: "https://invalid",
        },
      };

      await assert.rejects(
        async () => {
          await appTester(App.authentication.test, bundle);
        },
        (err) => {
          assert.strictEqual(err.name, "AppError");
          const parsedMessage = JSON.parse(err.message);
          assert.strictEqual(parsedMessage.code, "AuthenticationError");
          assert.strictEqual(parsedMessage.status, 401);
          assert.ok(parsedMessage.message.includes("Invalid API Host"));
          return true;
        }
      );
    });
  });
});
