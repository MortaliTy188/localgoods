const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    uploadProductImage
} = require('../controllers/productController');
const authenticate = require('../middlewares/authenticateJWT');
const upload = require('../config/multer');

const router = express.Router();

router.post('/', authenticate([2]), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', authenticate([2]), updateProduct);
router.delete('/:id', authenticate([2]), deleteProduct);
router.get('/category/:category_id', getProductsByCategory);
router.post('/upload-image', upload.single('image'), uploadProductImage);

module.exports = router;