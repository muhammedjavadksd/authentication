import * as Joi from 'joi';
import const_data from '../const';

const { AUTH_PROVIDERS, BLOOD_GROUP } = const_data;

const signUpUserValidation = Joi.object({
    phone_number: Joi.string().length(10).required(),
    email_address: Joi.string().email().required(),
    first_name: Joi.string().required(),
    auth_provider: Joi.string().valid(...AUTH_PROVIDERS).required(),
    last_name: Joi.string().required(),
    location: Joi.required(),
    blood_group: Joi.string().valid(...BLOOD_GROUP)
});

export default signUpUserValidation


