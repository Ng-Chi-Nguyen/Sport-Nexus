const validate = (schema) => (req, res, next) => {

    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false
    });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message.replace(/['"]+/g, ''));

        return res.status(400).json({
            success: false,
            message: errorMessages.join('; '),
            errors: errorMessages
        });
    }

    req.body = value;

    next();
};

export { validate };