const Validator = require("validator");
const isEmpty = require("is-empty");

function validateState(state) {
    state = !isEmpty(state) ? state : "";
    if (Validator.isEmpty(state)) return 0;
    else if (!(state == true || state == false || state == "true" || state == "false")) return 0;
    return 1;
}
module.exports = validateState;