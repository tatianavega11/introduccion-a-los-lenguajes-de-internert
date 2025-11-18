const PRODUCTS_API = 'https://fakestoreapi.com/products';

// Convertir precio USD a COP
function formatPriceCOP(num) {
  const precioCOP = num * 5000;
  return '$' + precioCOP.toLocaleString('es-CO');
}

// Descripción personalizada
function generateDescription(product) {
  return ¡Descubre "${product.title}"! Perfecto para quienes buscan ${product.category}.;
}

// Carrito
const carrito = {
  items: [],
  agregarItem(product) {
    const found = this.items.find(i => i.id === product.id);
    if (found) found.qty += 1;
    else this.items.push({ ...product, qty: 1 });
  },
  quitarItem(id) {
    this.items = this.items.filter(i => i.id !== id);
  },
  cambiarQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) this.quitarItem(id);
  },
  calcularTotal() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },
  renderizarCarrito() {
    const cont = document.getElementById('cart-items');
    cont.innerHTML = '';
    if (this.items.length === 0) {
      cont.innerHTML = '<p style="color:#6b7280">El carrito está vacío.</p>';
    } else {
      this.items.forEach(it => {
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
          <img src="${it.image}" alt="${it.title}">
          <div class="meta">
            <strong>${it.title}</strong>
            <small>${it.description}</small>
          </div>
          <div>
            <div class="qty-controls">
              <button data-action="dec" data-id="${it.id}">-</button>
              <div>${it.qty}</div>
              <button data-action="inc" data-id="${it.id}">+</button>
            </div>
            <div>${formatPriceCOP(it.price * it.qty)}</div>
          </div>`;
        cont.appendChild(row);
      });
    }
    document.getElementById('cart-total').textContent =
      'Total: ' + formatPriceCOP(this.calcularTotal());
  }
};

// Botones y cantidades
document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'inc') {
    carrito.cambiarQty(id, carrito.items.find(i => i.id === id).qty + 1);
    carrito.renderizarCarrito();
  } else if (action === 'dec') {
    carrito.cambiarQty(id, carrito.items.find(i => i.id === id).qty - 1);
    carrito.renderizarCarrito();
  }
});

// Cargar productos desde API
async function cargarProductos() {
  try {
    const res = await fetch(PRODUCTS_API);
    const productos = await res.json();

    const cont = document.getElementById('catalogo-productos');
    cont.innerHTML = '';

    productos.forEach(p => {
      const desc = generateDescription(p);
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${desc}</p>
        <div class="price">${formatPriceCOP(p.price)}</div>
        <footer>
          <small>Categoría: ${p.category}</small>
          <button class="btn" data-id="${p.id}" data-description="${desc}">Añadir al carrito</button>
        </footer>`;
      cont.appendChild(card);
    });
  } catch {
    document.getElementById('catalogo-productos').innerHTML =
      '<p style="color:#e53e3e">Error al cargar productos.</p>';
  }
}

// Añadir al carrito
document.getElementById('catalogo-productos').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const card = btn.closest('.card');
  const title = card.querySelector('h3').textContent;
  const price = Number(card.querySelector('.price').textContent.replace('$','').replace(/\./g,'')) / 5000;
  const image = card.querySelector('img').src;
  const description = btn.dataset.description;

  carrito.agregarItem({ id, title, price, image, description });
  carrito.renderizarCarrito();
});

// Vaciar carrito
document.getElementById('btn-clear').addEventListener('click', () => {
  carrito.items = [];
  carrito.renderizarCarrito();
});

// Checkout
document.getElementById('btn-checkout').addEventListener('click', () => {
  if (carrito.items.length === 0) {
    alert('El carrito está vacío.');
    return;
  }
  const resumen = carrito.items.map(i => ${i.qty}x ${i.title}).join('\n');
  alert('Resumen de compra:\n' + resumen);
  carrito.items = [];
  carrito.renderizarCarrito();
});

// Login simulado
const btnLogin = document.getElementById('btn-login');
const modal = document.getElementById('modal');
const btnCancel = document.getElementById('btn-cancel');
const userBadge = document.getElementById('user-badge');
const userNameSpan = document.getElementById('user-name');

btnLogin.addEventListener('click', () => modal.style.display = 'flex');
btnCancel.addEventListener('click', () => modal.style.display = 'none');

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  localStorage.setItem('token', 'fakeToken123');
  localStorage.setItem('userEmail', email);
  userBadge.style.display = 'inline-block';
  userNameSpan.textContent = email;
  modal.style.display = 'none';
  alert('Login exitoso (simulado).');
});

// Iniciar
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  if (token && email) {
    userBadge.style.display = 'inline-block';
    userNameSpan.textContent = email;
  }
  cargarProductos();
  carrito.renderizarCarrito();
});