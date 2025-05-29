class Transformer {
  static transformAllOf(fieldSchema, prop, generator) {
    const key = prop.key ? prop.key : fieldSchema.key;
    const schemas = prop.allOf
      .map((allOfElement) => generator.getFieldSchema(allOfElement, key))
      .filter((schema) => schema != null);
    if (schemas.length === 0) {
      return null;
    }
    return schemas.reduce((acc, current) => {
      acc.children.push(...current.children);
      return acc;
    }, schemas.pop());
  }

  static transformAnyOf(fieldSchema, prop, generator) {
    const key = prop.key ? prop.key : fieldSchema.key;

    if (!key) {
      throw new Error(`Invalid state needs key ${JSON.stringify(prop)}`);
    }

    let typeToParse = prop.anyOf.filter(
      (item) => item.type !== null && item.type !== "null"
    );

    if (typeToParse.length > 1) {
      typeToParse = typeToParse.filter(
        (item) => item.type !== "string" || item.format
      );
    }
    if (typeToParse.length === 0) {
      return null;
    }
    if (typeToParse.length > 1) {
      return null;
    }
    return generator.getFieldSchema(
      typeToParse.pop(),
      fieldSchema.key || "unknown"
    );
  }

  static transformDate(fieldSchema, prop, generator) {
    fieldSchema.type = "datetime";
  }

  static transformDefault(fieldSchema, prop, generator) {
    fieldSchema.type = prop.type;
    return null;
  }

  static transformItems(fieldSchema, prop, generator) {
    const itemsType = prop.items;
    if (!fieldSchema.key) {
      throw new Error(`Key must be set! ${JSON.stringify(fieldSchema)}`);
    }
    const listType = generator.getFieldSchema(itemsType, fieldSchema.key);

    if (listType) {
      return { ...listType, list: true };
    }
    return null;
  }

  static transformObject(fieldSchema, prop, generator) {
    const children = Object.entries(prop.properties || {}).map(([key, value]) =>
      generator.getFieldSchema(value, key, fieldSchema.key)
    );
    return {
      ...fieldSchema,
      children,
    };
  }
}

module.exports = Transformer;
