const testAuth = async (z, bundle) => {
  const apiHost = bundle.authData.apiHost || "https://cloud.yepcode.io";
  const options = {
    url: `${apiHost}/run/whoami`,
    headers: {
      "x-api-token": bundle.authData.apiToken,
    },
  };

  return z
    .request(options)
    .then((response) => {
      response.throwForStatus();
      return response.data;
    })
    .catch((error) => {
      if (error.message.includes("Invalid API token")) {
        throw new z.errors.Error(
          "Invalid API Token",
          "AuthenticationError",
          401
        );
      }
      throw new z.errors.Error("Invalid API Host", "AuthenticationError", 401);
    });
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
