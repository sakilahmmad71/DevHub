const validator = require('validator');
const isEmpty = require('./is_empty');

const loginFormValidation = (data) => {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

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

module.exports = loginFormValidation;
