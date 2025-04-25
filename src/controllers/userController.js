require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Регистрация пользователя
 */
exports.registerUser = async (req, res) => {
    const { first_name, last_name, email, password, role_id } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role_id: role_id || 1, // Роль по умолчанию
        });

        return res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: { id: newUser.id, email: newUser.email }
        });
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Авторизация пользователя
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Авторизация успешна',
            token,
            user: { id: user.id, email: user.email, role_id: user.role_id },
        });
    } catch (error) {
        console.error('Ошибка при авторизации пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить всех пользователей
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', 'role_id',],
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить информацию о конкретном пользователе
 */
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'role_id',],
        });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Редактировать пользователя
 */
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, password, role_id } = req.body;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        let updatedPassword = user.password;
        if (password) {
            updatedPassword = await bcrypt.hash(password, 10);
        }

        await user.update({
            first_name: first_name || user.first_name,
            last_name: last_name || user.last_name,
            email: email || user.email,
            password: updatedPassword,
            role_id: role_id || user.role_id,
        });

        return res.status(200).json({ message: 'Пользователь успешно обновлен', user });
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Удалить пользователя
 */
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        await user.destroy();

        return res.status(200).json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};