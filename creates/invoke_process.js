const graphqlQueries = require("../lib/graphql_queries");
const graphqlClient = require("../lib/graphql_client");

const CURRENT_VERSION_TAG_VALUE = "current";

const perform = async (z, bundle) => {
  const versionTag = bundle.inputData.version;
  const token = bundle.inputData.webhookauthtoken;
  const async = bundle.inputData.async;
  const payload = bundle.inputData.payload;

  const options = {
    url: `https://cloud.yepcode.io/api/${bundle.authData.team}/webhooks/${bundle.inputData.process}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
      ...(versionTag && versionTag !== CURRENT_VERSION_TAG_VALUE
        ? { "yep-version-tag": versionTag }
        : {}),
      ...(async && (async === true || async === "true")
        ? { "yep-async": true }
        : {}),
    },
    ...(payload ? { body: payload } : {}),
  };

  return z.request(options).then((response) => {
    response.throwForStatus();
    const result = response.json;
    if (Array.isArray(result)) {
      return {
        results: result,
      };
    }
    if (!result || Object.keys(result).length === 0) {
      return {
        message: "Execution finished without any result",
      };
    }
    return result;
  });
};

const processInputFieldSpec = (choices) => {
  return {
    key: "process",
    label: "YepCode process",
    helpText:
      "Pick the process to invoke. Only processes with [enabled webhooks](https://yepcode.io/docs/executions/webhooks) will be available.",
    required: true,
    altersDynamicFields: true,
    choices,
  };
};

const webhookAuthInputFieldSpec = (token) => {
  return {
    computed: true,
    key: "webhookauthtoken",
    label: "Webhook auth token",
    helpText: "The webhook auth token to be used.",
    default: token,
  };
};

const versionInputFieldSpec = (choices) => {
  return {
    key: "version",
    label: "Process version tag",
    helpText:
      "Pick the [process version](https://yepcode.io/docs/processes/process-versioning) to be used.",
    required: true,
    default: CURRENT_VERSION_TAG_VALUE,
    choices,
  };
};

const asyncInputFieldSpec = () => {
  return {
    key: "async",
    label: "Asynchronous mode",
    type: "boolean",
    default: "false",
    helpText:
      "Choose to run the webhook synchronously or asynchronously. Sync executions will wait the process to finish before returning the response, while async executions will respond instantly with 201 http code and a JSON informing about execution id.",
    choices: ["false", "true"],
  };
};

const payloadInputFieldSpec = () => {
  return {
    key: "payload",
    label: "Execution parameters payload",
    dict: true,
    helpText:
      "The [input parameters](https://yepcode.io/docs/processes/input-params) JSON provided to process execution.",
  };
};

const getProcessInputField = async (z, bundle) => {
  return graphqlClient.graphqlQuery(z, {
    team: bundle.authData.team,
    accessToken: bundle.authData.accessToken,
    query: graphqlQueries.getProcesses(),
    variables: {
      first: 100,
    },
    responseCb: (response) => {
      const results = response.json.data;

      const choices = [];
      for (const { node: process } of results.processes.edges) {
        if (process.triggers?.webhook?.enabled) {
          choices.push({
            label: process.name,
            value: process.id,
          });
        }
      }
      return [processInputFieldSpec(choices)];
    },
  });
};

const getWebhookAuthInputField = async (z, bundle) => {
  if (!bundle.inputData.process) {
    return [webhookAuthInputFieldSpec()];
  }
  return graphqlClient.graphqlQuery(z, {
    team: bundle.authData.team,
    accessToken: bundle.authData.accessToken,
    query: graphqlQueries.getProcess(),
    variables: {
      id: bundle.inputData.process,
    },
    responseCb: (response) => {
      const process = response.json.data.process;
      if (!process) {
        throw new Error(`Process not found for id ${bundle.inputData.process}`);
      }

      const auth = process.triggers?.webhook?.auth?.basicAuth;
      const token = auth
        ? Buffer.from(`${auth.username}:${auth.password}`).toString("base64")
        : "";

      return [webhookAuthInputFieldSpec(token)];
    },
  });
};

const getVersionInputField = async (z, bundle) => {
  if (!bundle.inputData.process) {
    return [versionInputFieldSpec([])];
  }
  return graphqlClient.graphqlQuery(z, {
    team: bundle.authData.team,
    accessToken: bundle.authData.accessToken,
    query: graphqlQueries.getProcessVersions(),
    variables: {
      processId: bundle.inputData.process,
    },
    responseCb: (response) => {
      const results = response.json.data;

      const choices = [
        {
          label: "Current version",
          value: "current",
        },
      ];
      for (const version of results.allVersionedProcesses) {
        choices.push({
          label: version.tag,
          value: version.tag,
        });
      }
      return [versionInputFieldSpec(choices)];
    },
  });
};

module.exports = {
  key: "invoke_process",
  noun: "Process",
  display: {
    label: "Invoke Process",
    description:
      "It starts a YepCode process execution, allowing to provide a JSON as [input parameters](https://yepcode.io/docs/processes/input-params) and returning the [JSON execution result](https://yepcode.io/docs/processes/source-code#return-value).",
    hidden: false,
    important: true,
  },
  operation: {
    inputFields: [
      getProcessInputField,
      getWebhookAuthInputField,
      getVersionInputField,
      asyncInputFieldSpec(),
      payloadInputFieldSpec(),
    ],
    perform: perform,
    sample: { yourReturnedAttributeName: "yourReturnedValue" },
  },
};
