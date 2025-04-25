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

router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/all', authenticate([2]), getAllUsers);
router.get('/:id', authenticate([2]), getUserById);
router.delete('/:id', authenticate([2]), deleteUser);

router.put('/:id', authenticate([1, 2]), updateUser);

module.exports = router;