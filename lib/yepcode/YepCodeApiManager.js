const { YepCodeApi } = require("@yepcode/run");

class YepCodeApiManager {
  static #instance = null;

  static getAuthenticatedClient(apiToken, apiHost) {
    if (!this.#instance) {
      if (!apiToken) {
        throw new Error("apiToken is required to initialize YepCodeApi");
      }
      this.#instance = new YepCodeApi({
        apiToken,
        apiHost: apiHost || "https://cloud.yepcode.io",
      });
    }
    return this.#instance;
  }
}

module.exports = YepCodeApiManager;
