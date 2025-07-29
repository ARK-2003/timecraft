// Shopping Cart System
let cart = [];
let cartTotal = 0;

// Cart functionality
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`${productName} added to cart!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    cartTotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        cartTotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${index}, -1)" class="quantity-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)" class="quantity-btn">+</button>
                <button onclick="removeFromCart(${index})" class="remove-btn">×</button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    if (cartTotalElement) {
        cartTotalElement.textContent = `₹${cartTotal.toLocaleString()}`;
    }
    
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.toggle('active');
    }
}

function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.remove('active');
    }
}

function openBilling() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const billingModal = document.getElementById('billing-modal');
    if (billingModal) {
        billingModal.classList.add('active');
        closeCart();
        updateBillingSummary();
    }
}

function closeBilling() {
    const billingModal = document.getElementById('billing-modal');
    if (billingModal) {
        billingModal.classList.remove('active');
    }
}

function updateBillingSummary() {
    const billingItems = document.getElementById('billing-items');
    const billingSubtotal = document.getElementById('billing-subtotal');
    const billingTax = document.getElementById('billing-tax');
    const billingTotal = document.getElementById('billing-total');
    
    if (!billingItems) return;
    
    billingItems.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>₹${itemTotal.toLocaleString()}</span>
        `;
        billingItems.appendChild(orderItem);
    });
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    if (billingSubtotal) billingSubtotal.textContent = `₹${subtotal.toLocaleString()}`;
    if (billingTax) billingTax.textContent = `₹${tax.toLocaleString()}`;
    if (billingTotal) billingTotal.textContent = `₹${total.toLocaleString()}`;
}

function processOrder() {
    const billingForm = document.getElementById('billing-form');
    const formData = new FormData(billingForm);
    
    // Validate form
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'pincode'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fill all required fields!');
        return;
    }
    
    // Generate order summary
    const orderSummary = generateOrderSummary();
    
    // Show order confirmation
    showOrderConfirmation(orderSummary);
    
    // Clear cart
    cart = [];
    updateCartDisplay();
    closeBilling();
}

function generateOrderSummary() {
    const orderNumber = 'CHRONOX-' + Date.now();
    const orderDate = new Date().toLocaleDateString();
    
    return {
        orderNumber: orderNumber,
        orderDate: orderDate,
        items: [...cart],
        subtotal: cartTotal,
        tax: cartTotal * 0.18, // 18% GST
        shipping: 0,
        total: cartTotal * 1.18
    };
}

function showOrderConfirmation(orderSummary) {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'modal confirmation-modal';
    confirmationModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Order Confirmed!</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">×</button>
            </div>
            <div class="modal-body">
                <div class="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Order Number:</strong> ${orderSummary.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${orderSummary.orderDate}</p>
                    
                    <h4>Items:</h4>
                    <div class="order-items">
                        ${orderSummary.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>₹${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-totals">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>₹${orderSummary.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>Tax (18% GST):</span>
                            <span>₹${orderSummary.tax.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div class="total-row total">
                            <span>Total:</span>
                            <span>₹${orderSummary.total.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <p class="thank-you">Thank you for your order! You will receive a confirmation email shortly.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmationModal);
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    
    // Add event listeners to all "Add to Cart" buttons
    const cartButtons = document.querySelectorAll('.cart-btn');
    cartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const priceText = this.parentElement.querySelector('.price').textContent;
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            addToCart(productName, price);
        });
    });
});