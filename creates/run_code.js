const { YepCodeRunManager } = require("../lib/yepcode");

const perform = async (z, bundle) => {
  const ycRunner = YepCodeRunManager.getAuthenticatedClient(
    bundle.authData.apiToken,
    bundle.authData.apiHost
  );
  const { code, ...options } = bundle.inputData;

  const execution = await ycRunner.run(code, options);
  await execution.waitForDone();

  return {
    executionId: execution.id,
    processId: execution.processId,
    status: execution.status,
    returnValue: execution.returnValue,
    error: execution.error,
    logs: execution.logs,
    timeline: execution.timeline,
    comment: execution.comment,
  };
};

const codeInputFieldSpec = () => {
  return {
    key: "code",
    label: "Source code",
    type: "code",
    default:
      'const isOdd = require("is-odd");\nconst number = yepcode.context.parameters?.number || 3;\nconst result = isOdd(number);\nreturn { message: `${number} is ${result ? "odd" : "even"}` };',
    required: true,
    helpText:
      "The source's code to execute. It can be a JavaScript or Python code, and it will be executed in the YepCode environment. You can import any NPM or PyPI package and it will be installed automatically (see [docs](https://yepcode.io/docs/processes/source-code) for more details).",
  };
};

const advancedSettingsInputFieldSpec = () => {
  return {
    key: "advancedSettings",
    label: "Advanced settings",
    required: false,
    children: [
      languageInputFieldSpec(),
      removeOnDoneInputFieldSpec(),
      initiatedByInputFieldSpec(),
      commentInputFieldSpec(),
    ],
  };
};

const languageInputFieldSpec = () => {
  return {
    key: "language",
    label: "Language",
    required: false,
    helpText:
      "The source's code language. Optional as we'll try to detect it automatically.",
    choices: [
      { label: "JavaScript", value: "JAVASCRIPT", sample: "JAVASCRIPT" },
      { label: "Python", value: "PYTHON", sample: "PYTHON" },
    ],
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

const removeOnDoneInputFieldSpec = () => {
  return {
    key: "removeOnDone",
    label: "Remove on done",
    type: "boolean",
    default: "true",
    helpText: "Whether to remove the source code after execution or keep it.",
    required: false,
  };
};

module.exports = {
  key: "run_code",
  noun: "Code",
  display: {
    label: "Run Code",
    description:
      "Execute JavaScript or Python code on demand — directly from your workflows or AI agents. It runs in secure cloud sandboxes with full support for NPM and PyPI dependencies (https://yepcode.io/docs/dependencies), access to secrets, APIs, and databases. Perfect for quick scripts, dynamic logic, or AI-generated code.",
    hidden: false,
  },
  operation: {
    inputFields: [codeInputFieldSpec(), advancedSettingsInputFieldSpec()],
    perform: perform,
    sample: { yourReturnedAttributeName: "yourReturnedValue" },
  },
};
