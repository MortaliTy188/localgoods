const Product = require('../models/productModel');

/**
 * Создать продукт
 */
exports.createProduct = async (req, res) => {
    const { title, description, price, stock, seller_id, category } = req.body;

    try {
        const newProduct = await Product.create({
            title,
            description,
            price,
            stock,
            seller_id,
            category,
        });

        return res.status(201).json({
            message: 'Продукт успешно создан',
            product: newProduct,
        });
    } catch (error) {
        console.error('Ошибка при создании продукта:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить все продукты
 */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        return res.status(200).json(products);
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить продукт по ID
 */
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error('Ошибка при получении продукта:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Обновить продукт
 */
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, stock, seller_id, category } = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        await product.update({
            title: title || product.title,
            description: description || product.description,
            price: price || product.price,
            stock: stock || product.stock,
            seller_id: seller_id || product.seller_id,
            category: category || product.category,
        });

        return res.status(200).json({
            message: 'Продукт успешно обновлен',
            product,
        });
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Удалить продукт
 */
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        await product.destroy();
        return res.status(200).json({ message: 'Продукт успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getProductsByCategory = async (req, res) => {
    const {category} = req.params; // Получаем категорию из параметров маршрута

    try {
        const products = await Product.findAll({
            where: {category}, // Фильтруем по полю категории
        });

        if (products.length === 0) {
            return res.status(404).json({message: 'Продукты в данной категории не найдены'});
        }

        return res.status(200).json(products);
    } catch (error) {
        console.error('Ошибка при получении продуктов по категории:', error);
        return res.status(500).json({message: 'Ошибка сервера'});
    }
}