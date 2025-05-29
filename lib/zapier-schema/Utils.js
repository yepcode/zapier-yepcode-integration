class Utils {
  static getZapierReference(key) {
    return key.replace(/\./g, "__");
  }
  static getDotNotationnReference(key) {
    return key.replace(/__/g, ".");
  }

  static getNestedObject(obj) {
    const newObj = {};
    Object.entries(obj).map(([key, value]) => {
      this.set(newObj, Utils.getDotNotationnReference(key), value);
    });
    return newObj;
  }
  static flatten(arr) {
    return arr.reduce((flat, toFlatten) => {
      return flat.concat(
        Array.isArray(toFlatten) ? Utils.flatten(toFlatten) : toFlatten
      );
    }, []);
  }
  static set(obj, path, value) {
    if (Object(obj) !== obj) return obj;
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
    path
      .slice(0, -1)
      .reduce(
        (a, c, i) =>
          Object(a[c]) === a[c]
            ? a[c]
            : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
        obj
      )[path[path.length - 1]] = value;
    return obj;
  }
}

module.exports = Utils;
