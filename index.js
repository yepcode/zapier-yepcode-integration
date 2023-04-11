const authentication = require("./authentication");
const invokeProcessCreate = require("./creates/invoke_process.js");

module.exports = {
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,
  authentication: authentication,
  creates: { [invokeProcessCreate.key]: invokeProcessCreate },
};
