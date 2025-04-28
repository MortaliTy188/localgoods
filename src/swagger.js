const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "Документация проекта",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
        components: {
            // Здесь определяются схемы, которые можно использовать в аннотациях
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            description: "ID пользователя",
                        },
                        first_name: {
                            type: "string",
                            description: "Имя пользователя",
                        },
                        last_name: {
                            type: "string",
                            description: "Фамилия пользователя",
                        },
                        email: {
                            type: "string",
                            description: "Email пользователя",
                        },
                        role_id: {
                            type: "integer",
                            description: "Роль пользователя (1 - пользователь, 2 - администратор)",
                        },
                    },
                },
                Product: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            description: "Уникальный идентификатор продукта",
                        },
                        title: {
                            type: "string",
                            description: "Название продукта",
                        },
                        description: {
                            type: "string",
                            description: "Описание продукта",
                        },
                        price: {
                            type: "number",
                            description: "Цена продукта",
                        },
                        stock: {
                            type: "integer",
                            description: "Количество на складе",
                        },
                        category: {
                            type: "string",
                            description: "Категория продукта",
                        },
                        image: {
                            type: "string",
                            description: "Путь к изображению продукта",
                        },
                    },
                },
                Review: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            description: "ID отзыва",
                        },
                        user_id: {
                            type: "integer",
                            description: "ID пользователя, который оставил отзыв",
                        },
                        product_id: {
                            type: "integer",
                            description: "ID продукта, к которому относится отзыв",
                        },
                        rating: {
                            type: "number",
                            description: "Рейтинг продукта (1-5)",
                        },
                        comment: {
                            type: "string",
                            description: "Комментарий пользователя",
                        },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;