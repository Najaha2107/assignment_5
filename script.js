
// Get HTML Elements
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");

let products = [];
let activeCategory = "All";
let searchTerm = "";

// Restore cart from localStorage
let cart = JSON.parse(
    localStorage.getItem("shopnest-cart") || "[]"
);


// 1. FETCH PRODUCTS USING ASYNC/AWAIT
async function loadProducts() {

    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        products = await response.json();

        // Remove cart products that are no longer available
        cart = cart.filter(item =>
            products.some(product => product.id === item.id)
        );

        saveCart();

        displayProducts();
        displayCart();

    } catch (error) {

        console.error("Error:", error);

        document.getElementById("loadError").hidden = false;
    }
}


// 2. DISPLAY PRODUCTS DYNAMICALLY
function displayProducts() {

    // Search and category filtering together
    const filteredProducts = products.filter(product => {

        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            activeCategory === "All" ||
            product.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    // Clear previous products
    productGrid.innerHTML = "";

    // Show no products message
    document.getElementById("emptyMessage").hidden =
        filteredProducts.length !== 0;

    filteredProducts.forEach(product => {

        // Create product card
        const card = document.createElement("div");
        card.className = "product-card";

        // Product Image
        const image = document.createElement("img");
        image.src = product.imageUrl;
        image.alt = product.name;
        image.className = "product-image";

        // Category
        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        // Product Name
        const name = document.createElement("h3");
        name.className = "product-name";
        name.textContent = product.name;

        // Rating
        const rating = document.createElement("p");
        rating.className = "rating";
        rating.textContent = "★ " + product.rating + " / 5";

        // Price
        const priceRow = document.createElement("p");
        priceRow.className = "price-row";

        const price = document.createElement("span");
        price.className = "price";
        price.textContent = "₹" + product.price;

        const originalPrice = document.createElement("span");
        originalPrice.className = "original-price";
        originalPrice.textContent = "₹" + product.originalPrice;

        priceRow.append(price, originalPrice);

        // Add to Cart Button
        const button = document.createElement("button");
        button.className = "add-button";
        button.textContent = "Add to Cart";

        button.addEventListener("click", () => {
            addToCart(product.id);
        });

        // Append all elements
        card.append(
            image,
            category,
            name,
            rating,
            priceRow,
            button
        );

        productGrid.appendChild(card);
    });
}


// 3. LIVE SEARCH
searchInput.addEventListener("input", function(event) {

    searchTerm = event.target.value.toLowerCase().trim();

    displayProducts();
});


// 4. CATEGORY FILTER
categoryFilters.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;

    // Update active button
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    displayProducts();
});


// 5. SAVE CART TO LOCALSTORAGE
function saveCart() {

    localStorage.setItem(
        "shopnest-cart",
        JSON.stringify(cart)
    );
}


// 6. ADD TO CART
function addToCart(productId) {

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
}


// 7. INCREASE OR DECREASE QUANTITY
function changeQuantity(productId, amount) {

    const item = cart.find(
        item => item.id === productId
    );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        removeFromCart(productId);
        return;
    }

    saveCart();
    displayCart();
}


// 8. REMOVE PRODUCT FROM CART
function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    saveCart();
    displayCart();
}


// 9. DISPLAY CART AND CALCULATE TOTAL
function displayCart() {

    const cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(item => {

        const product = products.find(
            p => p.id === item.id
        );

        if (!product) return;

        total += product.price * item.quantity;
        count += item.quantity;

        // Cart item container
        const row = document.createElement("div");
        row.className = "cart-item";

        // Product image
        const image = document.createElement("img");
        image.src = product.imageUrl;
        image.alt = product.name;

        // Product details
        const details = document.createElement("div");

        const name = document.createElement("p");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = "₹" + product.price;

        // Quantity controls
        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.textContent = "−";

        minus.addEventListener("click", () => {
            changeQuantity(product.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.textContent = "+";

        plus.addEventListener("click", () => {
            changeQuantity(product.id, 1);
        });

        controls.append(minus, quantity, plus);

        // Remove button
        const remove = document.createElement("button");
        remove.className = "remove-button";
        remove.textContent = "Remove";

        remove.addEventListener("click", () => {
            removeFromCart(product.id);
        });

        details.append(name, price, controls, remove);

        row.append(image, details);

        cartItems.appendChild(row);
    });

    // Empty cart message
    if (cart.length === 0) {

        const message = document.createElement("p");
        message.className = "cart-empty";
        message.textContent = "Your cart is empty!";

        cartItems.appendChild(message);
    }

    // Update cart count
    document.getElementById("cartCount").textContent = count;

    // Update total price
    document.getElementById("cartTotal").textContent =
        "₹" + total.toFixed(2);
}


// 10. OPEN AND CLOSE CART
const cartDrawer = document.getElementById("cartDrawer");
const backdrop = document.getElementById("cartBackdrop");

document.getElementById("cartToggle")
    .addEventListener("click", () => {

        cartDrawer.classList.add("open");
        backdrop.hidden = false;
    });


function closeCart() {

    cartDrawer.classList.remove("open");
    backdrop.hidden = true;
}

document.getElementById("closeCart")
    .addEventListener("click", closeCart);

backdrop.addEventListener("click", closeCart);


// 11. CHECKOUT BUTTON
document.getElementById("checkoutButton")
    .addEventListener("click", () => {

        if (cart.length === 0) {
            alert("Your cart is empty!");
        } else {
            alert("Thank you for shopping with ShopNest!");
        }
    });


// 12. START APPLICATION
loadProducts();
