import {
    getAllCategories,
    getProductsByCategory,
    getReviewsByProduct,
    addReview,
    addToCart
} from '../api/api.js';
import { isLoggedIn, getUserId } from '../auth/auth.js';
import { navigateTo } from '../router.js';

export async function renderCatalog() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Categories</h1>
        </header>
        <main>
            <div id="catalog" class="catalog">
                <div id="category-container" class="category-container">
                    <p>Loading categories...</p>
                </div>
            </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;
    await renderCategories();
}

async function renderCategories() {
    const categoryContainer = document.getElementById('category-container');
    if (!categoryContainer) return;
    categoryContainer.innerHTML = `<p>Loading categories...</p>`;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = 'Categories';

    try {
        const categories = await getAllCategories();
        if (!Array.isArray(categories) || categories.length === 0) {
            categoryContainer.innerHTML = `<p>No categories available.</p>`;
            return;
        }
        categoryContainer.innerHTML = categories.map(category => `
            <div class="category-card" data-category-id="${category.id}" style="cursor: pointer; padding: 20px; border: 1px solid #eee; border-radius: 8px; margin: 10px; text-align: center; background-color: #f9f9f9; transition: box-shadow 0.3s ease;">
                <h3>${category.name}</h3>
            </div>
        `).join('');
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('mouseenter', () => card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)');
            card.addEventListener('mouseleave', () => card.style.boxShadow = 'none');
            card.addEventListener('click', async () => {
                await showProductsByCategory(card.getAttribute('data-category-id'), categories);
            });
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        if (categoryContainer) categoryContainer.innerHTML = `<p>Failed to load categories.</p>`;
    }
}

async function showProductsByCategory(categoryId, allCategories) {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = `<p>Loading products...</p>`;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle && allCategories) {
        const currentCategory = allCategories.find(c => c.id.toString() === categoryId.toString());
        headerTitle.textContent = currentCategory ? `Products in ${currentCategory.name}` : 'Products';
    }

    const BACKEND_URL = 'http://localhost:3000';

    try {
        const productsResponse = await getProductsByCategory(categoryId);
        const products = productsResponse.products || productsResponse;

        if (!Array.isArray(products) || products.length === 0) {
            categoryContainer.innerHTML = `
                <p>No products available in this category.</p>
                <button id="back-to-categories" class="back-button" style="margin-top:15px; padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Back to Categories</button>
            `;
        } else {
            categoryContainer.innerHTML = `
                <button id="back-to-categories" class="back-button" style="margin-bottom: 15px; padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Back to Categories</button>
                <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                ${products.map(product => {
                let cardStyles = `
                        border: 1px solid #ddd; border-radius: 8px; padding: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; flex-direction: column;
                        justify-content: space-between; min-height: 460px;
                        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    `;
                const defaultImage = '/images/default-product-image.png';
                let productImageSrc = defaultImage; 
                let hasProductImage = false;

                if (product.image) {
                    const imagePath = product.image.startsWith('http') ? product.image : (product.image.startsWith('/') ? `${BACKEND_URL}${product.image}` : `${BACKEND_URL}/${product.image}`);
                    productImageSrc = encodeURI(imagePath);
                    hasProductImage = true;
                }

                if (hasProductImage) { 
                    cardStyles += `
                            background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url('${productImageSrc}');
                            background-size: cover; background-position: center; color: white;
                            text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
                        `;
                } else { 
                    cardStyles += `background-color: #f8f9fa; color: #333;`;
                }

                const quantityInputId = `quantity-product-${product.id}`;
                const totalPriceDisplayId = `total-price-product-${product.id}`;
                const basePrice = parseFloat(product.price) || 0;

                return `
                        <div class="product-card" style="${cardStyles}" data-product-id="${product.id}" data-base-price="${basePrice}" data-product-title="${product.title}">
                            <div>
                                <img src="${productImageSrc}" alt="${product.title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 4px 4px 0 0; margin-bottom: 10px; display: ${hasProductImage ? 'none':'block'};">
                                <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.2em;">${product.title}</h3>
                                <p style="font-size: 0.9em; margin-bottom: 10px; flex-grow: 1;">${product.description.substring(0,100)}${product.description.length > 100 ? '...' : ''}</p>
                            </div>
                            <div style="margin-top: auto;"> 
                                <p style="font-weight: bold; margin-bottom: 5px; font-size: 1.1em;">Price: $${basePrice.toFixed(2)}</p>
                                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                    <label for="${quantityInputId}" style="margin-right: 5px; ${hasProductImage ? '' : 'color: #333;'}">Qty:</label>
                                    <input type="number" id="${quantityInputId}" class="product-quantity-input" name="quantity" value="1" min="1" max="${product.stock || 99}" style="width: 60px; padding: 5px; border: 1px solid #ccc; border-radius: 4px; text-align: center; margin-right: 10px;">
                                </div>
                                <p style="font-weight: bold; margin-bottom: 10px; font-size: 1.1em;">Total: <span id="${totalPriceDisplayId}">$${basePrice.toFixed(2)}</span></p>
                                <button class="add-to-cart-btn" data-product-id="${product.id}" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-bottom: 10px; font-size: 1em;">Add to Cart</button>
                                <button class="view-reviews-btn" data-product-id="${product.id}" style="padding: 10px 15px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-bottom: 10px; font-size: 1em;">View Reviews</button>
                                <button class="leave-review-btn" data-product-id="${product.id}" style="padding: 10px 15px; background-color: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-size: 1em;">Leave a Review</button>
                            </div>
                        </div>
                    `;
            }).join('')}
                </div>

                <div id="reviews-modal" class="modal" style="display:none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(5px);">
                    <div class="modal-content" style="background-color: #fefefe; margin: 10% auto; padding: 25px; border: 1px solid #888; width: 90%; max-width: 650px; border-radius: 10px; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                        <span class="close-reviews-modal" style="color: #aaa; position: absolute; right: 15px; top: 10px; font-size: 30px; font-weight: bold; cursor: pointer; line-height: 1;">×</span>
                        <h2 id="reviews-modal-title" style="margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Reviews</h2>
                        <div id="reviews-list-container" style="max-height: 300px; overflow-y: auto; margin-top: 15px; margin-bottom: 20px;"></div>
                        <div id="add-review-form-placeholder" style="border-top: 1px solid #eee; padding-top: 20px;"></div>
                    </div>
                </div>
            `;
        }

        const backButton = document.getElementById('back-to-categories');
        if (backButton) backButton.addEventListener('click', async () => await renderCategories());

        document.querySelectorAll('.product-quantity-input').forEach(input => {
            input.addEventListener('input', (event) => {
                const productCard = event.target.closest('.product-card');
                if (!productCard) return;
                const productId = productCard.getAttribute('data-product-id');
                const basePrice = parseFloat(productCard.getAttribute('data-base-price'));
                let quantity = parseInt(event.target.value, 10);
                const stock = parseInt(event.target.getAttribute('max'), 10);
                const totalPriceDisplay = productCard.querySelector(`#total-price-product-${productId}`);
                if (isNaN(quantity) || quantity < 1) { event.target.value = 1; quantity = 1; }
                if (quantity > stock) { event.target.value = stock; quantity = stock; alert(`Maximum stock is ${stock}.`);}
                totalPriceDisplay.textContent = `$${(basePrice * quantity).toFixed(2)}`;
            });
            const productCard = input.closest('.product-card');
            if(productCard) {
                const basePrice = parseFloat(productCard.getAttribute('data-base-price'));
                const totalPriceDisplay = productCard.querySelector(`#total-price-product-${productCard.getAttribute('data-product-id')}`);
                if(totalPriceDisplay) totalPriceDisplay.textContent = `$${basePrice.toFixed(2)}`;
            }
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                const productCard = event.target.closest('.product-card');
                if (!productCard) return;
                const productId = productCard.getAttribute('data-product-id');
                const userId = getUserId();
                if (!userId) { alert('Please log in to add items to your cart.'); navigateTo('/login'); return; }
                const quantityInput = productCard.querySelector(`#quantity-product-${productId}`);
                let quantity = 1;
                if (quantityInput) {
                    const parsedQuantity = parseInt(quantityInput.value, 10);
                    if (!isNaN(parsedQuantity) && parsedQuantity > 0) quantity = parsedQuantity;
                    else { alert('Please enter a valid quantity.'); quantityInput.focus(); return; }
                    const maxStock = parseInt(quantityInput.getAttribute('max'), 10);
                    if (!isNaN(maxStock) && quantity > maxStock) {
                        alert(`You can add a maximum of ${maxStock} items for this product.`);
                        quantityInput.value = maxStock; quantity = maxStock;
                    }
                }
                try {
                    button.textContent = 'Adding...'; button.disabled = true;
                    await addToCart({ user_id: parseInt(userId), product_id: parseInt(productId), quantity: quantity });
                    alert(`${productCard.getAttribute('data-product-title') || 'Product'} (Qty: ${quantity}) added to cart!`);
                } catch (error) {
                    alert(`Failed to add product to cart. ${error.message || 'Please try again.'}`);
                } finally {
                    button.textContent = 'Add to Cart'; button.disabled = false;
                }
            });
        });

        const reviewsModal = document.getElementById('reviews-modal');
        const closeReviewsModalBtn = reviewsModal.querySelector('.close-reviews-modal');
        const reviewsListContainer = document.getElementById('reviews-list-container');
        const reviewsModalTitle = document.getElementById('reviews-modal-title');
        const addReviewFormPlaceholder = document.getElementById('add-review-form-placeholder');

        document.querySelectorAll('.view-reviews-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productCard = event.target.closest('.product-card');
                if (!productCard) return;
                const productId = productCard.getAttribute('data-product-id');
                const productTitle = productCard.getAttribute('data-product-title') || 'Product';
                reviewsModalTitle.textContent = `Reviews for ${productTitle}`;
                reviewsListContainer.innerHTML = '<p>Loading reviews...</p>';
                addReviewFormPlaceholder.innerHTML = '';
                reviewsModal.style.display = 'block'; document.body.style.overflow = 'hidden';
                try {
                    const reviews = await getReviewsByProduct(productId);
                    if (!Array.isArray(reviews) || reviews.length === 0) {
                        reviewsListContainer.innerHTML = '<p>No reviews yet for this product.</p>';
                    } else {
                        reviewsListContainer.innerHTML = `<ul style="list-style: none; padding: 0;">${reviews.map(review => `
                            <li style="border-bottom: 1px solid #eee; padding: 12px 0; margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="font-size: 1.05em;">${review.user_first_name || 'User'} ${review.user_last_name || ''}</strong>
                                    <span style="font-size: 1.1em; color: #333;">Rating: ${review.rating || 'N/A'}/5</span>
                                </div>
                                <p style="margin: 0 0 8px 0; font-size: 0.95em; color: #454545; line-height: 1.5;">${review.comment}</p>
                                <p style="margin: 0; font-size: 0.8em; color: #888; text-align: right;">${new Date(review.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </li>`).join('')}</ul>`;
                    }
                    renderAddReviewForm(productId, productTitle);
                } catch (error) {
                    reviewsListContainer.innerHTML = `<p style="color: red;">Failed to load reviews: ${error.message}</p>`;
                }
            });
        });

        document.querySelectorAll('.leave-review-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                if (!isLoggedIn()) {
                    alert("Please log in to leave a review.");
                    navigateTo('/login');
                    return;
                }
                const productCard = event.target.closest('.product-card');
                if (!productCard) return;
                const productId = productCard.getAttribute('data-product-id');
                const productTitle = productCard.getAttribute('data-product-title') || 'Product';
                reviewsModalTitle.textContent = `Leave a Review for ${productTitle}`;
                reviewsListContainer.innerHTML = '';
                addReviewFormPlaceholder.innerHTML = '';
                renderAddReviewForm(productId, productTitle, true);
                reviewsModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });

        closeReviewsModalBtn.onclick = function() {
            reviewsModal.style.display = 'none'; document.body.style.overflow = 'auto';
        }
        window.onclick = function(event) {
            if (event.target == reviewsModal) {
                reviewsModal.style.display = 'none'; document.body.style.overflow = 'auto';
            }
        }

    } catch (error) {
        console.error('Failed to load products:', error);
        if (categoryContainer) categoryContainer.innerHTML = `
            <p>Failed to load products. Error: ${error.message}</p>
            <button id="back-to-categories" class="back-button" style="margin-top:15px; padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Back to Categories</button>
        `;
        const backButtonOnError = document.getElementById('back-to-categories');
        if (backButtonOnError) backButtonOnError.addEventListener('click', async () => await renderCategories());
    }
}

function renderAddReviewForm(productId, productTitle, isDirectLeaveReview = false) {
    const addReviewFormPlaceholder = document.getElementById('add-review-form-placeholder');
    if (!addReviewFormPlaceholder) return;

    if (!isLoggedIn()) {
        addReviewFormPlaceholder.innerHTML = `<p>Please <a href="/login" data-link>log in</a> to leave a review.</p>`;
        addReviewFormPlaceholder.querySelector('a[data-link]')?.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/login');
            document.getElementById('reviews-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        return;
    }

    addReviewFormPlaceholder.innerHTML = `
        <h3 style="margin-top: ${isDirectLeaveReview ? '0' : '20px'}; margin-bottom: 15px;">${isDirectLeaveReview ? '' : 'Leave your review for ' + productTitle}</h3>
        <form id="add-review-form" data-product-id="${productId}">
            <div style="margin-bottom: 10px;">
                <label for="review-rating" style="display: block; margin-bottom: 5px;">Rating (1-5):</label>
                <select id="review-rating" name="rating" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                    <option value="">Select a rating</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                </select>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="review-comment" style="display: block; margin-bottom: 5px;">Comment:</label>
                <textarea id="review-comment" name="comment" rows="4" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"></textarea>
            </div>
            <button type="submit" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit Review</button>
        </form>
    `;

    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = reviewForm.elements.rating.value;
            const comment = reviewForm.elements.comment.value.trim();
            const currentProductId = reviewForm.dataset.productId;
            const userId = getUserId();

            if (!rating) { alert('Please select a rating.'); return; }
            if (!comment) { alert('Please enter your comment.'); return; }
            if (!userId) { alert('User not identified. Please log in again.'); return; }

            const reviewData = {
                user_id: parseInt(userId),
                product_id: parseInt(currentProductId),
                rating: parseInt(rating),
                comment: comment
            };

            const submitButton = reviewForm.querySelector('button[type="submit"]');

            try {
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                await addReview(reviewData);
                alert('Review submitted successfully!');
                addReviewFormPlaceholder.innerHTML = '<p style="color: green;">Thank you for your review!</p>';

                if (!isDirectLeaveReview) {
                    const reviewsListContainer = document.getElementById('reviews-list-container');
                    reviewsListContainer.innerHTML = '<p>Loading updated reviews...</p>';
                    const updatedReviews = await getReviewsByProduct(currentProductId);
                    if (!Array.isArray(updatedReviews) || updatedReviews.length === 0) {
                        reviewsListContainer.innerHTML = '<p>No reviews yet for this product.</p>';
                    } else {
                        reviewsListContainer.innerHTML = `<ul style="list-style: none; padding: 0;">${updatedReviews.map(rev => `
                            <li style="border-bottom: 1px solid #eee; padding: 12px 0; margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="font-size: 1.05em;">${rev.user_first_name || 'User'} ${rev.user_last_name || ''}</strong>
                                    <span style="font-size: 1.1em; color: #333;">Rating: ${rev.rating || 'N/A'}/5</span>
                                </div>
                                <p style="margin: 0 0 8px 0; font-size: 0.95em; color: #454545; line-height: 1.5;">${rev.comment}</p>
                                <p style="margin: 0; font-size: 0.8em; color: #888; text-align: right;">${new Date(rev.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </li>`).join('')}</ul>`;
                    }
                } else {
                    setTimeout(() => {
                        document.getElementById('reviews-modal').style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }, 1500);
                }
            } catch (error) {
                alert(`Failed to submit review: ${error.message}`);
            } finally {
                submitButton.textContent = 'Submit Review';
                submitButton.disabled = false;
            }
        });
    }
}
