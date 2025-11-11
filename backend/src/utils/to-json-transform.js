const defaultTransform = (_doc, ret) => {
  if (ret._id) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
  if (ret.__v !== undefined) {
    delete ret.__v;
  }
  return ret;
};

const applyDefaultToJSON = (schema, { transform } = {}) => {
  const existingToJSON = schema.get('toJSON') || {};
  const userTransform = transform || existingToJSON.transform;

  schema.set('toJSON', {
    virtuals: true,
    ...existingToJSON,
    transform(doc, ret, options) {
      defaultTransform(doc, ret);
      if (typeof userTransform === 'function') {
        return userTransform(doc, ret, options);
      }
      return ret;
    },
  });
};

module.exports = {
  applyDefaultToJSON,
};
