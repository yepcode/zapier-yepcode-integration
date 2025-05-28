const authentication = require("./authentication");
const runProcessCreate = require("./creates/run_process.js");
const runCodeCreate = require("./creates/run_code.js");

module.exports = {
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,
  authentication: authentication,
  creates: {
    [runProcessCreate.key]: runProcessCreate,
    [runCodeCreate.key]: runCodeCreate,
  },
};
