const validator = require('validator');
const isEmpty = require('./is_empty');

const registerFormValidation = (data) => {
    let errors = {};

    if (!data.name) {
        errors.name = 'Name field is required.';
    } else if (!validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 to 30 charecter.';
    }

    if (!data.email) {
        errors.email = 'Email field is required.';
    } else if (!validator.isEmail(data.email)) {
        errors.email = 'Invalid email, Provide a valid email.';
    }

    if (!data.password) {
        errors.password = 'Password field is required.';
    } else if (validator.isLength(data.password, { max: 6 })) {
        errors.password = 'Password must be minimum 6 charecter.';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};

module.exports = registerFormValidation;
