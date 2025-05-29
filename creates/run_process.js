const ZapierSchemaBuilder = require("../lib/zapier-schema");
const { YepCodeApiManager } = require("../lib/yepcode");

const CURRENT_VERSION_TAG_VALUE = "current";

const perform = async (z, bundle) => {
  const api = YepCodeApiManager.getAuthenticatedClient(
    bundle.authData.apiToken,
    bundle.authData.apiHost
  );

  const {
    version,
    process,
    synchronous,
    initiatedBy,
    comment,
    parameters: inputParameters,
  } = bundle.inputData;
  const parameters = inputParameters ? inputParameters[0] : {};

  const options = {
    tag: version === CURRENT_VERSION_TAG_VALUE ? null : version,
    initiatedBy: initiatedBy || null,
    comment: comment || null,
  };

  if (synchronous) {
    const executionResult = await api.executeProcessSync(
      process,
      parameters,
      options
    );
    if (!executionResult) {
      return {};
    }
    if (
      typeof executionResult !== "object" ||
      executionResult === null ||
      Array.isArray(executionResult)
    ) {
      return {
        returnValue: executionResult,
      };
    }
    return executionResult;
  }

  return await api.executeProcessAsync(process, parameters, options);
};

const getProcessInputField = async (z, bundle) => {
  const api = YepCodeApiManager.getAuthenticatedClient(
    bundle.authData.apiToken,
    bundle.authData.apiHost
  );
  const processes = await api.getProcesses();

  const choices = [];
  for (const process of processes.data) {
    choices.push({
      label: process.name,
      value: process.id,
      sample: process.id,
    });
  }

  return [processInputFieldSpec(choices)];
};

const processInputFieldSpec = (choices) => {
  return {
    key: "process",
    label: "YepCode process",
    required: true,
    altersDynamicFields: true,
    choices,
  };
};

const getVersionInputField = async (z, bundle) => {
  const choices = [
    {
      label: "Current version",
      value: CURRENT_VERSION_TAG_VALUE,
      sample: CURRENT_VERSION_TAG_VALUE,
    },
  ];

  if (!bundle.inputData.process) {
    return [versionInputFieldSpec(choices)];
  }

  const ycApi = YepCodeApiManager.getAuthenticatedClient(
    bundle.authData.apiToken,
    bundle.authData.apiHost
  );
  const [processVersionAliases, processVersions] = await Promise.all([
    ycApi.getProcessVersionAliases(bundle.inputData.process),
    ycApi.getProcessVersions(bundle.inputData.process),
  ]);

  processVersionAliases.data.forEach((versionAlias) => {
    choices.push({
      label: `${versionAlias.name} (${versionAlias.versionId})`,
      value: versionAlias.name,
      sample: versionAlias.name,
    });
  });
  processVersions.data.forEach((version) => {
    choices.push({
      label: version.id,
      value: version.id,
      sample: version.id,
    });
  });

  return [versionInputFieldSpec(choices)];
};

const versionInputFieldSpec = (choices) => {
  return {
    key: "version",
    label: "Version tag",
    required: true,
    default: CURRENT_VERSION_TAG_VALUE,
    altersDynamicFields: true,
    choices,
  };
};

const getParametersInputField = async (z, bundle) => {
  if (!bundle.inputData.process) {
    return [];
  }

  const parametersSchema = await getParametersSchema({
    ...bundle.authData,
    processId: bundle.inputData.process,
    versionTag:
      bundle.inputData.version !== null &&
      bundle.inputData.version !== undefined &&
      bundle.inputData.version !== CURRENT_VERSION_TAG_VALUE
        ? bundle.inputData.version
        : null,
  });

  if (!parametersSchema || Object.keys(parametersSchema).length === 0) {
    return [];
  }

  const zapierSchema = new ZapierSchemaBuilder(parametersSchema).build();

  return parametersInputFieldSpec(zapierSchema);
};

const getParametersSchema = async ({
  apiToken,
  apiHost,
  processId,
  versionTag,
}) => {
  const api = YepCodeApiManager.getAuthenticatedClient(apiToken, apiHost);
  let parametersSchema = (await api.getProcess(processId)).parametersSchema;

  if (versionTag) {
    const versionedProcesses = await api.getProcessVersions(processId);
    parametersSchema = versionedProcesses.data.find(
      (versionedProcess) => versionedProcess.id === versionTag
    )?.parametersSchema;
    if (!parametersSchema) {
      const versionedProcessAliases = await api.getProcessVersionAliases(
        processId
      );
      const alias = versionedProcessAliases.data.find(
        (versionedProcessAlias) => versionedProcessAlias.name === versionTag
      );
      parametersSchema = versionedProcesses.data.find(
        (versionedProcess) => versionedProcess.id === alias?.versionId
      )?.parametersSchema;
    }
  }

  return parametersSchema;
};

const parametersInputFieldSpec = (zapierSchema) => {
  return {
    key: "parameters",
    label: "Parameters",
    required: false,
    children: zapierSchema,
  };
};

const advancedSettingsInputFieldSpec = () => {
  return {
    key: "advancedSettings",
    label: "Advanced settings",
    required: false,
    children: [
      asyncInputFieldSpec(),
      initiatedByInputFieldSpec(),
      commentInputFieldSpec(),
    ],
  };
};

const asyncInputFieldSpec = () => {
  return {
    key: "synchronous",
    label: "Synchronous mode",
    type: "boolean",
    default: "true",
    helpText:
      "Whether to wait for the execution to finish or not. If false, the execution result won't be available.",
    choices: ["true", "false"],
    required: false,
  };
};

const initiatedByInputFieldSpec = () => {
  return {
    key: "initiatedBy",
    label: "Initiated by",
    type: "string",
    helpText: "A meta attribute to identify who initiated the execution.",
    required: false,
  };
};

const commentInputFieldSpec = () => {
  return {
    key: "comment",
    label: "Comment",
    type: "string",
    helpText: "A meta attribute to add a comments to the execution.",
    required: false,
  };
};

module.exports = {
  key: "run_process",
  noun: "Process",
  display: {
    label: "Run Process",
    description:
      "Move your complex business logic into YepCode processes and trigger them from your workflows using dynamic input parameters. It's the most flexible way to connect with your APIs and services — using real code, with zero DevOps overhead.",
    hidden: false,
  },
  operation: {
    inputFields: [
      getProcessInputField,
      getVersionInputField,
      getParametersInputField,
      advancedSettingsInputFieldSpec(),
    ],
    perform: perform,
    sample: { yourReturnedAttributeName: "yourReturnedValue" },
  },
};
