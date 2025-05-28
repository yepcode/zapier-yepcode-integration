const { YepCodeApi } = require("@yepcode/run");

const testAuth = async (z, bundle) => {
  try {
    const api = new YepCodeApi({
      apiToken: bundle.authData.apiToken,
      apiHost: bundle.authData.apiHost || "https://cloud.yepcode.io",
    });
    await api.getProcesses({ limit: 1 });
    return api;
  } catch (error) {
    throw new z.errors.Error(error.message, "AuthenticationError", 401);
  }
};

module.exports = {
  type: "custom",
  test: testAuth,
  fields: [
    {
      computed: false,
      key: "apiToken",
      required: true,
      label: "API Token",
      type: "password",
      helpText:
        "Find your API Token in the YepCode dashboard under the 'Settings -> API Credentials' section.",
    },
    {
      computed: false,
      key: "apiHost",
      required: false,
      label: "API Host",
      type: "string",
      helpText:
        "The YepCode API host to use (default: https://cloud.yepcode.io). It can be customized for YepCode On-Premise instances.",
      default: "https://cloud.yepcode.io",
    },
  ],
  connectionLabel: "Connected to YepCode",
};
