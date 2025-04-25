const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const authenticate = require('../middlewares/authenticateJWT');

const router = express.Router();

// Открытые маршруты (не требуют авторизации)
router.post('/register', registerUser);
router.post('/login', loginUser);


// Только для роли 2 (доступ ко всем пользователям)
router.get('/all', authenticate([2]), getAllUsers);
router.get('/:id', authenticate([2]), getUserById);
router.delete('/:id', authenticate([2]), deleteUser);

// Доступ для ролей 1 и 2 (редактирование профиля)
router.put('/:id', authenticate([1, 2]), updateUser);

module.exports = router;