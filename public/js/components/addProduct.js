import { createProduct, uploadProductImage, getAllCategories } from '../api/api.js';
import { getUserRole } from '../auth/auth.js';
import { navigateTo } from '../router.js';

export async function renderAddProductPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <a href="/profile" data-link class="back-to-profile-button" style="display: inline-block; margin-bottom: 10px; padding: 8px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Back to Profile</a>
            <h1>Add New Product</h1>
        </header>
        <main id="add-product-container" style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <form id="add-product-form">
                <div style="margin-bottom: 15px;">
                    <label for="product-title" style="display: block; margin-bottom: 5px; font-weight: bold;">Title:</label>
                    <input type="text" id="product-title" name="title" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="product-description" style="display: block; margin-bottom: 5px; font-weight: bold;">Description:</label>
                    <textarea id="product-description" name="description" rows="4" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"></textarea>
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="product-price" style="display: block; margin-bottom: 5px; font-weight: bold;">Price ($):</label>
                    <input type="number" id="product-price" name="price" step="0.01" min="0" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="product-stock" style="display: block; margin-bottom: 5px; font-weight: bold;">Stock:</label>
                    <input type="number" id="product-stock" name="stock" min="0" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="product-category" style="display: block; margin-bottom: 5px; font-weight: bold;">Category:</label>
                    <select id="product-category" name="category_id" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; background-color: white;">
                        <option value="">Loading categories...</option>
                    </select>
                </div>
                
                <button type="submit" id="submit-product-btn" style="padding: 12px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Add Product</button>
            </form>

            <hr style="margin: 30px 0;">

            <div id="upload-image-section">
                <h2 style="margin-bottom: 15px;">Upload Product Image</h2>
                <p style="font-size: 0.9em; color: #555;">Note: First add the product, then upload its image. You will need the Product ID.</p>
                
                <div style="margin-bottom: 15px;">
                    <label for="image-product-id" style="display: block; margin-bottom: 5px; font-weight: bold;">Product ID (from created product):</label>
                    <input type="number" id="image-product-id" name="productId" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" placeholder="Enter Product ID here">
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="product-image-file" style="display: block; margin-bottom: 5px; font-weight: bold;">Choose Image:</label>
                    <input type="file" id="product-image-file" name="image" accept="image/*" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <button id="upload-image-btn" style="padding: 12px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Upload Image</button>
                <div id="upload-status" style="margin-top: 10px;"></div>
            </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const addProductForm = document.getElementById('add-product-form');
    const categorySelect = document.getElementById('product-category');
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadStatusDiv = document.getElementById('upload-status');
    const imageProductIdInput = document.getElementById('image-product-id');
    const productImageFileInput = document.getElementById('product-image-file');
    const submitProductBtn = document.getElementById('submit-product-btn');


    const userRole = getUserRole();
    if (userRole !== '2') {
        alert('Access Denied: You do not have permission to add products.');
        navigateTo('/profile');
        return;
    }

    async function loadCategories() {
        try {
            const categories = await getAllCategories();
            if (categories && categories.length > 0) {
                categorySelect.innerHTML = '<option value="">-- Select Category --</option>'; // Placeholder
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            } else {
                categorySelect.innerHTML = '<option value="">No categories available</option>';
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            categorySelect.innerHTML = '<option value="">Error loading categories</option>';
        }
    }
    loadCategories();


    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitProductBtn.disabled = true;
        submitProductBtn.textContent = 'Adding...';

        const sellerId = localStorage.getItem('id') || sessionStorage.getItem('id');
        if (!sellerId) {
            alert('Seller ID not found. Please log in again.');
            submitProductBtn.disabled = false;
            submitProductBtn.textContent = 'Add Product';
            return;
        }

        const productData = {
            title: document.getElementById('product-title').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value, 10),
            seller_id: parseInt(sellerId, 10),
            category_id: parseInt(document.getElementById('product-category').value, 10)
        };

        if (!productData.title || !productData.description || isNaN(productData.price) || productData.price < 0 || isNaN(productData.stock) || productData.stock < 0 || isNaN(productData.category_id)) {
            alert('Please fill all fields correctly.');
            submitProductBtn.disabled = false;
            submitProductBtn.textContent = 'Add Product';
            return;
        }

        try {
            const responseData = await createProduct(productData);
            console.log('Response from createProduct API (in component):', responseData);


            if (responseData && responseData.product &&
                typeof responseData.product.title !== 'undefined' &&
                typeof responseData.product.id !== 'undefined') {


                const createdProductDetails = responseData.product;

                alert(`Product "${createdProductDetails.title}" added successfully! Product ID: ${createdProductDetails.id}`);
                addProductForm.reset();
                categorySelect.value = "";
                imageProductIdInput.value = createdProductDetails.id;
                uploadStatusDiv.innerHTML = `<p style="color:green;">${responseData.message || 'Product created.'} You can now upload an image for Product ID: ${createdProductDetails.id}.</p>`;

            } else {
                alert(`Product added, but response data structure is unexpected. Please check console. (Message: ${responseData?.message})`);
                console.error('Unexpected product data structure received:', responseData);
                uploadStatusDiv.innerHTML = `<p style="color:orange;">${responseData?.message || 'Product likely created, but response from server was not as expected.'}</p>`;
                if (responseData && responseData.product && typeof responseData.product.id !== 'undefined') {
                    imageProductIdInput.value = responseData.product.id;
                } else if (responseData && typeof responseData.id !== 'undefined') {
                    imageProductIdInput.value = responseData.id;
                }
            }
        } catch (error) {
            console.error('Failed to add product:', error);
            alert(`Error adding product: ${error.message}`);
            uploadStatusDiv.innerHTML = `<p style="color:red;">Error adding product: ${error.message}</p>`;
        } finally {
            submitProductBtn.disabled = false;
            submitProductBtn.textContent = 'Add Product';
        }
    });

    uploadImageBtn.addEventListener('click', async () => {
        const productId = imageProductIdInput.value;
        const imageFile = productImageFileInput.files[0];

        if (!productId) {
            uploadStatusDiv.innerHTML = '<p style="color: red;">Please enter the Product ID.</p>';
            return;
        }
        if (!imageFile) {
            uploadStatusDiv.innerHTML = '<p style="color: red;">Please select an image file.</p>';
            return;
        }

        uploadImageBtn.disabled = true;
        uploadImageBtn.textContent = 'Uploading...';
        uploadStatusDiv.innerHTML = '<p>Uploading image...</p>';

        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('image', imageFile);

        try {
            const uploadResult = await uploadProductImage(formData);
            uploadStatusDiv.innerHTML = `<p style="color: green;">Image uploaded successfully! ${uploadResult.message || ''}</p>`;
            productImageFileInput.value = '';
        } catch (error) {
            console.error('Failed to upload image:', error);
            uploadStatusDiv.innerHTML = `<p style="color: red;">Image upload failed: ${error.message}</p>`;
        } finally {
            uploadImageBtn.disabled = false;
            uploadImageBtn.textContent = 'Upload Image';
        }
    });
}