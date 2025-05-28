const assert = require("assert");

require("should");

const zapier = require("zapier-platform-core");

const App = require("../../index");
const appTester = zapier.createAppTester(App);

describe("Create - run_code", () => {
  zapier.tools.env.inject();

  it("should run code", async () => {
    const bundle = {
      authData: {
        apiToken: process.env.authData_apiToken,
        apiHost: process.env.authData_apiHost,
      },
      inputData: {
        code: 'const isOdd = require("is-odd");\nconst number = yepcode.context.parameters?.number || 3;\nconst result = isOdd(number);\nreturn { message: `${number} is ${result ? "odd" : "even"}` };',
        removeOnDone: true,
      },
    };

    const result = await appTester(
      App.creates["run_code"].operation.perform,
      bundle
    );
    assert.equal(result.returnValue.message, "3 is odd");
  });
});
