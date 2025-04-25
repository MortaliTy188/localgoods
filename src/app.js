require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/api/v1/users', userRoutes);
app.use("/api/v1/products", productRoutes);

app.use((req, res, next) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Документация доступна на http://localhost:${PORT}/api-docs`);
});

module.exports = app;