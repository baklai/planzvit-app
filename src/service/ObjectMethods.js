export const getObjField = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  for (let i = 0; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (obj === undefined || obj === null) return defaultValue;
  }
  return obj;
};
