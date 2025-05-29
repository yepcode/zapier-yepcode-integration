const ZapierSchemaGenerator = require("./ZapierSchemaGenerator");
const Utils = require("./Utils");

class ZapierSchemaBuilder {
  includes = [];

  excludes = [];

  excludeAll = false;

  registry;

  overrides = new Map();

  constructor(jsonSchema) {
    this.jsonSchema = jsonSchema;
  }

  addInclude(key) {
    if (typeof key === "function") {
      this.includes.push(key);
    } else {
      this.includes.push(Utils.getZapierReference(key));
    }
    return this;
  }

  addExclude(key) {
    if (typeof key === "function") {
      this.excludes.push(key);
    } else {
      this.excludes.push(Utils.getZapierReference(key));
    }
    return this;
  }

  setExcludeAll(value) {
    this.excludeAll = value;
    return this;
  }

  setRegistry(value) {
    this.registry = value;
    return this;
  }

  addOverride(key, value) {
    this.overrides.set(key, value);
    return this;
  }

  build() {
    return new ZapierSchemaGenerator().getZapierSchema(this.jsonSchema, {
      excludeAll: this.excludeAll,
      excludes: this.excludes,
      includes: this.includes,
      registry: this.registry,
      overrides: this.overrides,
    });
  }
}

module.exports = ZapierSchemaBuilder;
