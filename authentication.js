const graphqlQueries = require("./lib/graphql_queries");
const graphqlClient = require("./lib/graphql_client");

const testAuth = async (z, bundle) => {
  return graphqlClient.graphqlQuery(z, {
    accessToken: bundle.authData.accessToken,
    query: graphqlQueries.getTeams(),
    responseCb: (response) => {
      return response.json.data;
    },
  });
};

module.exports = {
  type: "session",
  test: testAuth,
  fields: [
    {
      computed: false,
      key: "email",
      required: true,
      label: "email",
      type: "string",
      helpText: "[YepCode account](https://cloud.yepcode.io/) email",
    },
    {
      computed: false,
      key: "password",
      required: true,
      label: "password",
      type: "password",
      helpText: "YepCode account password",
    },
    {
      computed: false,
      key: "team",
      required: true,
      label: "team",
      type: "string",
      helpText: "[YepCode account](https://cloud.yepcode.io/) team identifier",
      inputFormat: "https://cloud.yepcode.io/{{input}}",
    },
  ],
  connectionLabel: "{{email}} at {{team}}",
  sessionConfig: {
    perform: {
      source:
        "const options = {\n  url: 'https://cloud.yepcode.io/auth/realms/yepcode/protocol/openid-connect/token',\n  method: 'POST',\n  headers: {\n    'content-type': 'application/x-www-form-urlencoded',\n    'accept': 'application/json'\n  },\n  params: {\n\n  },\n  body: {\n    'client_id': 'web-client',\n\t\t'grant_type': 'password',\n    'username': bundle.authData.email,\n    'password': bundle.authData.password\n  }\n}\n\nreturn z.request(options)\n  .then((response) => {\n    response.throwForStatus();\n    const results = response.json;\n\n    // You can do any parsing you need for results here before returning them\n\n    return {\n      'accessToken': results.access_token\n    };\n  });",
    },
  },
};
