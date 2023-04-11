const assert = require("assert");

require("should");

const zapier = require("zapier-platform-core");

const App = require("../../index");
const appTester = zapier.createAppTester(App);

describe("Create - invoke_process", () => {
  zapier.tools.env.inject();

  it("should invoke a process", async () => {
    const bundle = {
      authData: {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
        team: process.env.TEAM,
      },
      inputData: {
        process: "a4f0c6fd-0da8-4769-8ebb-6c0c030fdfb8",
        webhookauthtoken: "bXktdXNlcjpteS1wYXNzd29yZA==",
        version: "current",
        async: "false",
        payload: {
          name: "World",
        },
      },
    };

    const result = await appTester(
      App.creates["invoke_process"].operation.perform,
      bundle
    );
    assert.equal(result.theMessage, "Hello World");
  });
  it("should invoke a versioned process", async () => {
    const bundle = {
      authData: {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
        team: process.env.TEAM,
      },
      inputData: {
        process: "35a421c3-e818-4dc1-9be3-9ab6db2c1306",
        webhookauthtoken: null,
        version: "v2.0.0",
      },
    };

    const result = await appTester(
      App.creates["invoke_process"].operation.perform,
      bundle
    );
    assert.equal(result.message, "Hello from version 2.0.0");
  });
  it("should invoke an async process", async () => {
    const bundle = {
      authData: {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
        team: process.env.TEAM,
      },
      inputData: {
        process: "a4f0c6fd-0da8-4769-8ebb-6c0c030fdfb8",
        webhookauthtoken: "bXktdXNlcjpteS1wYXNzd29yZA==",
        async: "true",
        payload: {
          name: "World",
        },
      },
    };

    const result = await appTester(
      App.creates["invoke_process"].operation.perform,
      bundle
    );
    assert.equal(result.status, "CREATED");
  });
});
