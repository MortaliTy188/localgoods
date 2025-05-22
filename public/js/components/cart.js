import { getCartItems, removeFromCart, createOrder, getProductById } from '../api/api.js';
import { navigateTo } from '../router.js';

const BACKEND_URL = 'http://localhost:3000';

let currentUserIdForCheckout = null;

async function renderCartPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <a href="/general" data-link class="back-to-home-button" style="display: inline-block; margin-bottom: 10px; padding: 8px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Back to Shop</a>
            <h1>Your Shopping Cart</h1>
        </header>
        
        <main>
        <div class="container">
        <div id="cart-container" class="cart-container">
                <p>Loading cart items...</p>
            </div>
            <div id="cart-summary" class="cart-summary" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            </div>
        </div>
            
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    await loadCartItems();
}

async function loadCartItems() {
    const cartContainer = document.getElementById('cart-container');
    const cartSummaryContainer = document.getElementById('cart-summary');

    cartContainer.innerHTML = `<p>Loading cart items...</p>`;
    cartSummaryContainer.innerHTML = '';

    const userId = localStorage.getItem('id') || sessionStorage.getItem('id');
    currentUserIdForCheckout = userId;

    if (!userId) {
        cartContainer.innerHTML = `<p>You need to be logged in to view your cart. <a href="/" data-link>Login here</a>.</p>`;
        currentUserIdForCheckout = null;
        return;
    }

    try {
        const cartItemsResult = await getCartItems(userId);

        let rawCartItems = [];
        if (cartItemsResult && cartItemsResult.items) {
            rawCartItems = cartItemsResult.items;
        } else if (Array.isArray(cartItemsResult)) {
            rawCartItems = cartItemsResult;
        }

        if (rawCartItems.length === 0) {
            cartContainer.innerHTML = `<p>Your cart is empty.</p>`;
            cartSummaryContainer.innerHTML = '';
            return;
        }

        let displayedTotalAmount = 0;
        const itemsHtml = rawCartItems.map(item => {
            const product = item.product || item;
            const itemPrice = parseFloat(product.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemTotal = itemPrice * itemQuantity;
            displayedTotalAmount += itemTotal;

            let imageUrl = product.image ? `${BACKEND_URL}${product.image.startsWith('/') ? product.image : '/' + product.image}` : 'https://via.placeholder.com/100?text=No+Image';
            imageUrl = encodeURI(imageUrl);

            return `
                <div class="cart-item" data-product-id="${product.id}" style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <img src="${imageUrl}" alt="${product.title || 'Product Image'}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
                    <div style="flex-grow: 1;">
                        <h4 style="margin: 0 0 5px 0;">${product.title || 'Unnamed Product'}</h4>
                        <p style="margin: 0 0 5px 0;">Price: $${itemPrice.toFixed(2)}</p>
                        <p style="margin: 0;">Quantity: ${itemQuantity}</p>
                    </div>
                    <button class="remove-from-cart-btn" data-product-id="${product.id}" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
                </div>
            `;
        }).join('');

        cartContainer.innerHTML = itemsHtml;
        cartSummaryContainer.innerHTML = `
            <h3>Total (approx.): $${displayedTotalAmount.toFixed(2)}</h3>
            <button id="checkout-btn" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Proceed to Checkout</button>
        `;

        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.getAttribute('data-product-id');
                if (!productId || !currentUserIdForCheckout) return;

                try {
                    const dataToRemove = {
                        user_id: parseInt(currentUserIdForCheckout),
                        product_id: parseInt(productId)
                    };
                    await removeFromCart(dataToRemove);
                    await loadCartItems();
                } catch (error) {
                    console.error('Failed to remove item from cart:', error);
                    alert('Failed to remove item. Please try again.');
                }
            });
        });

        const checkoutButton = document.getElementById('checkout-btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', async () => {
                if (!currentUserIdForCheckout) {
                    alert('User session expired or you are not logged in. Please log in again.');
                    navigateTo('/');
                    return;
                }

                const cartItemsDivs = cartContainer.querySelectorAll('.cart-item');
                if (cartItemsDivs.length === 0) {
                    alert('Your cart is empty. Please add items before checking out.');
                    return;
                }

                const orderData = {
                    user_id: parseInt(currentUserIdForCheckout)
                };

                console.log('Submitting order with user_id:', orderData);

                try {
                    checkoutButton.textContent = 'Processing...';
                    checkoutButton.disabled = true;

                    const orderResult = await createOrder(orderData);

                    alert("Ваш заказ успешно создан");

                    await loadCartItems();


                } catch (error) {
                    console.error('Failed to create order:', error);
                    alert(`Failed to place order. ${error.message || 'Please try again.'}`);
                } finally {
                    checkoutButton.textContent = 'Proceed to Checkout';
                    checkoutButton.disabled = false;
                }
            });
        }

    } catch (error) {
        console.error('Failed to load cart items:', error);
        cartContainer.innerHTML = `<p>Failed to load cart items. Please try again later. Error: ${error.message}</p>`;
        currentUserIdForCheckout = null;
    }
}

export { renderCartPage as renderCart };