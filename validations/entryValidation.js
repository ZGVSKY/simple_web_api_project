const Joi = require('joi');

const entrySchema = Joi.object({
    title: Joi.string().min(3).max(100).required().trim().messages({
        'string.min': 'Заголовок має бути не менше 3 символів',
        'any.required': 'Заголовок обов’язковий'
    }),
    content: Joi.string().min(1).required().messages({
        'any.required': 'Контент обов’язковий'
    }),
    tags: Joi.array().items(Joi.string().max(20)),
    date: Joi.date().iso().allow(null, '')
});

const updateEntrySchema = Joi.object({
    title: Joi.string().min(3).max(100).trim(),
    content: Joi.string().min(1),
    tags: Joi.array().items(Joi.string().max(20)),
    date: Joi.date().iso().allow(null, '')
}).min(1);

module.exports = { entrySchema, updateEntrySchema };
