import Joi from "joi";

const collectionValidator = {
    getCollectionBySlug: Joi.object({
        slug: Joi.string().required().messages({
            'any.required': 'Slug bộ sưu tập không được để trống.',
        }),
    }).unknown(true),
};

export default collectionValidator;
