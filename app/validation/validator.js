const Joi = require("joi");

const validator = (source, schema) => async (req, res, next) => {
    try {
      await schema.validateAsync(req[source]);
      return next();
    } catch (err) {
      console.log(err)
      return res.status(400).json({ error: err.details[0].message });
    }
  };
module.exports = validator
