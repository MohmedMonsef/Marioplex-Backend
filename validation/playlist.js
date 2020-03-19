const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function  validatePlaylistInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.name = !isEmpty(data.name) ? data.name : "";
  


  // Password checks
  if (Validator.isEmpty(data.name)) {
    errors.name = "name field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};