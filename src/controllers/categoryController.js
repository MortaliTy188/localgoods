const Category = require('../models/categoryModel');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        res.status(500).json({ message: 'Не удалось получить список категорий' });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Имя категории обязательно' });
        }
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        console.error('Ошибка при добавлении категории:', error);
        res.status(500).json({ message: 'Не удалось добавить категорию' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Имя категории обязательно' });
        }
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Категория не найдена' });
        }
        category.name = name;
        await category.save();
        res.status(200).json(category);
    } catch (error) {
        console.error('Ошибка при обновлении категории:', error);
        res.status(500).json({ message: 'Не удалось обновить категорию' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Категория не найдена' });
        }
        await category.destroy();
        res.status(200).json({ message: 'Категория удалена' });
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        res.status(500).json({ message: 'Не удалось удалить категорию' });
    }
};
