import * as Joi from 'joi';
import const_data from '../const';

const { AUTH_PROVIDERS, BLOOD_GROUP } = const_data;

const signUpUserValidation = Joi.object({
    phone_number: Joi.number().integer().min(9).max(10).required(),
    email_address: Joi.string().email().required(),
    auth_id: Joi.string(),
    first_name: Joi.string().required(),
    auth_provider: Joi.string().valid(...AUTH_PROVIDERS).required(),
    last_name: Joi.string().required(),
    location: Joi.array().length(2).required(),
    blood_group: Joi.string().valid(...BLOOD_GROUP)
});

export default signUpUserValidation


