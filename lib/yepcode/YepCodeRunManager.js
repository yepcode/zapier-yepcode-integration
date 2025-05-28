const { YepCodeRun } = require("@yepcode/run");

class YepCodeRunManager {
  static #instance = null;

  static getAuthenticatedClient(apiToken, apiHost) {
    if (!this.#instance) {
      if (!apiToken) {
        throw new Error("apiToken is required to initialize YepCodeRun");
      }
      this.#instance = new YepCodeRun({
        apiToken,
        apiHost: apiHost || "https://cloud.yepcode.io",
      });
    }
    return this.#instance;
  }
}

module.exports = YepCodeRunManager;
