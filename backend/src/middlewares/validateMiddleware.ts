import type { Request, Response, NextFunction } from 'express'
import joi from "joi";

//generic validation middleware factory

export const validationMiddleware = (schema: joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req[property], { abortEarly: false, allowUnknown: true });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(", ");
            console.log("Validation Error:", errorMessages);
            return res.status(400).json({ message: errorMessages, errors: error.details.map(detail => detail.message) });
        }
        next();
    }
}

export const validate = validationMiddleware;

