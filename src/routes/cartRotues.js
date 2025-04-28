const express = require('express');
const { addToCart, getCartItems, removeFromCart } = require('../controllers/cartController');
const router = express.Router();

router.post('/add', addToCart);
router.get('/:user_id', getCartItems);
router.delete('/remove', removeFromCart);

module.exports = router;