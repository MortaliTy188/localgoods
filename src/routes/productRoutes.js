const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
} = require('../controllers/productController');
const authenticate = require('../middlewares/authenticateJWT');

const router = express.Router();

router.post('/', authenticate([2]), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', authenticate([2]), updateProduct);
router.delete('/:id', authenticate([2]), deleteProduct);
router.get('/category/:category', getProductsByCategory);

module.exports = router;