// ---------- DATOS ----------
// Productos (puedes mantener/editar este array)
const products = [
  {
    id: 1,
    name: "Camiseta Oversize Essential",
    price: 55000,
    description:
      "Camiseta básica oversize de alta calidad, perfecta para looks casuales.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Camiseta Oversize Urban",
    price: 60000,
    description:
      "Diseño urbano con estampado minimalista, ideal para el día a día.",
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Camiseta Oversize Minimal",
    price: 65000,
    description:
      "Estilo minimalista con detalles en contraste, para los amantes de la simplicidad.",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Camiseta Oversize Premium",
    price: 70000,
    description:
      "Nuestro modelo premium con materiales de la más alta calidad y confort.",
    image:
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80",
  },
];

// ---------- ESTADO ----------
let cart = []; // items: {id, name, price, image, talla, color, quantity}
let cartCount = 0;
let productoActual = null; // objeto producto seleccionado en modal

// ---------- SELECTORES DOM ----------
const productsGrid = document.querySelector(".products-grid");
const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const cartClose = document.querySelector("#cartModal .close");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCountElement = document.querySelector(".cart-count");
const checkoutBtn = document.getElementById("checkoutBtn");
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navList = document.querySelector(".nav-list");

const optionsModal = document.getElementById("optionsModal");
const addToCartWithOptionsBtn = document.getElementById("addToCartWithOptions");

// ---------- FUNCIONES ----------

// Renderiza productos (si en tu HTML ya tienes productos estáticos, puedes ignorar o comentar esta función)
function loadProducts() {
  if (!productsGrid) return;
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">$${product.price.toLocaleString()} COP</p>
        <p class="product-description">${product.description}</p>
        <button class="btn add-to-cart" data-id="${
          product.id
        }">Elegir opciones</button>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });

  // listeners para los botones de cada producto (abre modal de opciones)
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.dataset.id);
      abrirOpciones(id);
    });
  });
}

/**
 * abrirOpciones: flexible para soportar:
 * - abrirOpciones(productId)  -> busca producto en array products
 * - abrirOpciones(nombreString, precioNumber) -> caso cuando tu HTML tiene onclick con nombre y precio
 */
function abrirOpciones(productIdOrName, precioArg) {
  // si es número (id)
  if (typeof productIdOrName === "number") {
    productoActual = products.find((p) => p.id === productIdOrName);
  } else if (!isNaN(Number(productIdOrName))) {
    // por si pasa un string numérico
    productoActual = products.find((p) => p.id === Number(productIdOrName));
  } else {
    // caso: se pasó nombre y precio desde HTML estático:
    const byName = products.find((p) => p.name === productIdOrName);
    if (byName) {
      productoActual = byName;
    } else {
      // crear un objeto temporal mínimo (si el HTML llama con nombre)
      productoActual = {
        id: `tmp-${Date.now()}`,
        name: productIdOrName,
        price: precioArg || 0,
        image: "",
      };
    }
  }

  // mostrar info en modal y abrirlo
  if (productoActual) {
    const nombreEl = document.getElementById("productoSeleccionado");
    if (nombreEl) nombreEl.textContent = productoActual.name;
    // reset selects al valor por defecto (opcional)
    const sizeSel = document.getElementById("sizeSelect");
    const colorSel = document.getElementById("colorSelect");
    if (sizeSel) sizeSel.selectedIndex = 0;
    if (colorSel) colorSel.selectedIndex = 0;

    if (optionsModal) optionsModal.style.display = "flex";
  } else {
    alert("No se encontró el producto seleccionado.");
  }
}

function cerrarOpciones() {
  if (optionsModal) optionsModal.style.display = "none";
}

// Añade producto al carrito con talla y color (y maneja si ya existe la misma combinación)
if (addToCartWithOptionsBtn) {
  addToCartWithOptionsBtn.addEventListener("click", function () {
    const talla = document.getElementById("sizeSelect").value;
    const color = document.getElementById("colorSelect").value;

    if (!productoActual) {
      alert("No se ha seleccionado el producto.");
      cerrarOpciones();
      return;
    }

    // Encontrar si ya existe mismo producto con misma talla y color
    const existing = cart.find(
      (item) =>
        String(item.id) === String(productoActual.id) &&
        item.talla === talla &&
        item.color === color
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      // guardar una copia con talla/color
      cart.push({
        id: productoActual.id,
        name: productoActual.name,
        price: productoActual.price || 0,
        image: productoActual.image || "",
        talla,
        color,
        quantity: 1,
      });
    }

    cartCount += 1;
    updateCartCount();
    cerrarOpciones();
    showNotification(
      `${productoActual.name} (Talla: ${talla}, Color: ${color}) agregado al carrito`
    );
  });
}

// Renderizar carrito
function showCart() {
  if (!cartItems) return;
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío</p>';
  } else {
    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";

      cartItem.innerHTML = `
        <div class="cart-item-info">
          <img src="${item.image || "https://via.placeholder.com/60"}" alt="${
        item.name
      }" class="cart-item-image">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p class="cart-item-price">$${item.price.toLocaleString()} COP</p>
            <p>Talla: ${item.talla || "-"}</p>
            <p>Color: ${item.color || "-"}</p>
          </div>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease" data-id="${
            item.id
          }" data-talla="${item.talla}" data-color="${item.color}">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn increase" data-id="${
            item.id
          }" data-talla="${item.talla}" data-color="${item.color}">+</button>
          <button class="remove-btn" data-id="${item.id}" data-talla="${
        item.talla
      }" data-color="${item.color}">&times;</button>
        </div>
      `;

      cartItems.appendChild(cartItem);
    });

    // listeners (cantidad / eliminar) — usamos dataset para identificar combinación
    document.querySelectorAll(".decrease").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const talla = e.currentTarget.dataset.talla;
        const color = e.currentTarget.dataset.color;
        updateQuantity(id, -1, talla, color);
      });
    });

    document.querySelectorAll(".increase").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const talla = e.currentTarget.dataset.talla;
        const color = e.currentTarget.dataset.color;
        updateQuantity(id, 1, talla, color);
      });
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const talla = e.currentTarget.dataset.talla;
        const color = e.currentTarget.dataset.color;
        removeFromCart(id, talla, color);
      });
    });
  }

  updateCartTotal();
  if (cartModal) cartModal.style.display = "flex";
}

// Actualizar cantidad
function updateQuantity(productId, change, talla, color) {
  const item = cart.find(
    (i) =>
      String(i.id) === String(productId) &&
      i.talla === talla &&
      i.color === color
  );

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId, talla, color);
    } else {
      cartCount += change;
      updateCartCount();
      showCart();
    }
  }
}

// Eliminar
function removeFromCart(productId, talla, color) {
  const index = cart.findIndex(
    (i) =>
      String(i.id) === String(productId) &&
      i.talla === talla &&
      i.color === color
  );
  if (index !== -1) {
    const item = cart[index];
    cartCount -= item.quantity;
    cart.splice(index, 1);
    updateCartCount();
    showCart();
  }
}

// Total
function updateCartTotal() {
  const total = cart.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  if (cartTotal) cartTotal.textContent = `$${total.toLocaleString()} COP`;
}

// Notificación pequeña
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--color-accent);
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    z-index: 2002;
    box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2800);
}

// Contador en la UI
function updateCartCount() {
  if (cartCountElement) cartCountElement.textContent = cartCount;
}

// Checkout (simple)
function checkout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }
  const total = cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  alert(
    `¡Gracias por tu compra! Total: $${total.toLocaleString()} COP\n(Esto es una simulación)`
  );
  cart = [];
  cartCount = 0;
  updateCartCount();
  if (cartModal) cartModal.style.display = "none";
}

// Smooth scroll (opcional, si tienes enlaces)
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        navList && navList.classList.remove("active");
      }
    });
  });
}

// ---------- INICIALIZACIÓN ----------
function init() {
  // render productos (si quieres mantener HTML estático, puedes comentar la siguiente línea)
  loadProducts();

  updateCartCount();

  // abrir/mostrar carrito
  cartButton && cartButton.addEventListener("click", showCart);
  cartClose &&
    cartClose.addEventListener(
      "click",
      () => (cartModal.style.display = "none")
    );

  // cerrar clic fuera
  window.addEventListener("click", (e) => {
    if (e.target === cartModal) cartModal.style.display = "none";
    if (e.target === optionsModal) cerrarOpciones();
  });

  checkoutBtn && checkoutBtn.addEventListener("click", checkout);

  mobileMenuBtn &&
    mobileMenuBtn.addEventListener("click", () => {
      navList && navList.classList.toggle("active");
    });

  setupSmoothScrolling();
}

// iniciar cuando DOM listo
document.addEventListener("DOMContentLoaded", init);
document.getElementById("addToCartWithOptions").addEventListener("click", function () {
  const talla = document.getElementById("sizeSelect").value;
  const color = document.getElementById("colorSelect").value;
  const cantidad = parseInt(document.getElementById("quantityInput").value);

  alert(`Agregado al carrito: ${productoActual} | Talla: ${talla} | Color: ${color} | Cantidad: ${cantidad} | Precio: $${precioActual * cantidad}`);

  cerrarOpciones();
});

// --- TOGGLE MENU ---
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
// --- FIN TOGGLE MENU ---