const PRODUCTS_API = 'https://fakestoreapi.com/products';
const LOGIN_API = 'https://reqres.in/api/login';

function formatPrice(num) {
  return '$' + Number(num).toFixed(2);
}

function generateDescription(product) {
  return Descubre el "${product.title}" — ideal si estas buscando ${product.category}. Producto destacado por su calidad y precio.;
}

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
      cont.innerHTML = '<p style="color:#6b7280">El carrito esta vacio.</p>';
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
            <div>${formatPrice(it.price * it.qty)}</div>
          </div>`;
        cont.appendChild(row);
      });
    }
    document.getElementById('cart-total').textContent =
      'Total: ' + formatPrice(this.calcularTotal());
  }
};

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

async function cargarProductos() {
  try {
    const res = await fetch(PRODUCTS_API);
    const productos = await res.json();
    
    const cont = document.getElementById('catalogo-productos');
    cont.innerHTML = '';

    productos.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      const desc = generateDescription(p);
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${desc}</p>
        <div class="price">${formatPrice(p.price)}</div>
        <footer>
          <small>Categoria: ${p.category}</small>
          <button class="btn" data-id="${p.id}" data-description="${desc}">Anadir al carrito</button>
        </footer>`;
      cont.appendChild(card);
    });
  } catch {
    document.getElementById('catalogo-productos').innerHTML =
      '<p style="color:#e53e3e">Error al cargar productos.</p>';
  }
}

document.getElementById('catalogo-productos').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const card = btn.closest('.card');
  const title = card.querySelector('h3').textContent;
  const price = Number(card.querySelector('.price').textContent.replace('$', ''));
  const image = card.querySelector('img').src;
  const description = btn.dataset.description;

  carrito.agregarItem({ id, title, price, image, description });
  carrito.renderizarCarrito();
});

document.getElementById('btn-clear').addEventListener('click', () => {
  carrito.items = [];
  carrito.renderizarCarrito();
});

document.getElementById('btn-checkout').addEventListener('click', () => {
  if (carrito.items.length === 0) {
    alert('El carrito esta vacio.');
    return;
  }
  const resumen = carrito.items.map(i => ${i.qty}x ${i.title}).join('\n');
  alert('Resumen de compra:\n' + resumen);
  carrito.items = [];
  carrito.renderizarCarrito();
});

const btnLogin = document.getElementById('btn-login');
const modal = document.getElementById('modal');
const btnCancel = document.getElementById('btn-cancel');
const userBadge = document.getElementById('user-badge');
const userNameSpan = document.getElementById('user-name');

btnLogin.addEventListener('click', () => (modal.style.display = 'flex'));
btnCancel.addEventListener('click', () => (modal.style.display = 'none'));

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(LOGIN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en login');
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', email);
    userBadge.style.display = 'inline-block';
    userNameSpan.textContent = email;
    modal.style.display = 'none';
    alert('Login exitoso.');
  } catch (error) {
    alert('Fallo el inicio de sesion: ' + error.message);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  if (token && email) {
    userBadge.style.display = 'inline-block';
    userNameSpan.textContent = email;
  }
  await cargarProductos();
  carrito.renderizarCarrito();
});
