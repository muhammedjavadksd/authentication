
const Joi = require("joi");
const constant_data = require("../const");

let signUpUserValidation = Joi.object({
    phone_number: Joi.number().integer().min(9).max(10).required(),
    email_address: Joi.string().email().required(),
    auth_id: Joi.string(),
    first_name: Joi.string().required(),
    auth_provider: Joi.string().valid(...constant_data.AUTH_PROVIDERS).required(),
    last_name: Joi.string().required(),
    location: Joi.array().length(2).required(),
    blood_group: Joi.string().valid(...constant_data.BLOOD_GROUP)
})


module.exports = {
    signUpUserValidation
}