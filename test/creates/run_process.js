const assert = require("assert");

require("should");

const zapier = require("zapier-platform-core");

const App = require("../../index");
const appTester = zapier.createAppTester(App);

describe("Create - run_process", () => {
  zapier.tools.env.inject();

  it("should invoke a process", async () => {
    const bundle = {
      authData: {
        apiToken: process.env.authData_apiToken,
        apiHost: process.env.authData_apiHost,
      },
      inputData: {
        process: "zapier-test",
        version: "current",
        synchronous: "true",
        parameters: [
          {
            message: "Hello World",
          },
        ],
      },
    };

    const result = await appTester(
      App.creates["run_process"].operation.perform,
      bundle
    );
    assert.equal(result.message, "Hello World");
  });

  it("should invoke an async process", async () => {
    const bundle = {
      authData: {
        apiToken: process.env.authData_apiToken,
        apiHost: process.env.authData_apiHost,
      },
      inputData: {
        process: "zapier-test",
        version: "current",
        parameters: [
          {
            message: "Hello World",
          },
        ],
      },
    };

    const result = await appTester(
      App.creates["run_process"].operation.perform,
      bundle
    );
    assert.ok(result.executionId);
  });
});
