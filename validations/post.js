const validator = require('validator');
const isEmpty = require('./is_empty');

const postFormValidation = (data) => {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';

    if (!data.text) {
        errors.text = 'Text field is required.';
    } else if (validator.isLength(data.text, { max: 10 })) {
        errors.text = 'Text must be minimum 10 charecter.';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};

module.exports = postFormValidation;
