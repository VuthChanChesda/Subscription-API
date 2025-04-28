import Joi from "joi";

const subscriptionValidationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(200)
        .required()
        .messages({
            "string.empty": "Subscription name is required",
            "string.min": "Subscription name must be at least 3 characters",
            "string.max": "Subscription name must not exceed 200 characters",
        }),

    price: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": "Subscription price must be a number",
            "number.min": "Subscription price must be at least 0",
            "any.required": "Subscription price is required",
        }),

    currency: Joi.string()
        .valid("USD", "EUR", "GBP")
        .default("USD")
        .messages({
            "any.only": "Currency must be one of USD, EUR, or GBP",
        }),

    frequency: Joi.string()
        .valid("daily", "weekly", "monthly", "yearly")
        .default("monthly")
        .messages({
            "any.only": "Frequency must be one of daily, weekly, monthly, or yearly",
        }),

    category: Joi.string()
        .valid("food", "clothing", "electronics", "books", "other")
        .required()
        .messages({
            "any.only": "Category must be one of food, clothing, electronics, books, or other",
            "any.required": "Category is required",
        }),

    paymentMethod: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Payment method is required",
        }),

    status: Joi.string()
        .valid("active", "cancelled", "expired")
        .default("active")
        .messages({
            "any.only": "Status must be one of active, cancelled, or expired",
        }),

    startDate: Joi.date()
        .max("now")
        .required()
        .messages({
            "date.base": "Start date must be a valid date",
            "date.max": "Start date must be in the past",
            "any.required": "Start date is required",
        }),

    renewalDate: Joi.date()
        .greater(Joi.ref("startDate"))
        .messages({
            "date.base": "Renewal date must be a valid date",
            "date.greater": "Renewal date must be after the start date",
        }),

});

export default subscriptionValidationSchema;