// Data dan State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Fungsi untuk inisialisasi aplikasi
function initApp() {
  updateCartCount();
  checkLoginStatus();
  loadProducts();
}

// Fungsi untuk memuat produk
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Fungsi untuk menampilkan produk
function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  productsGrid.innerHTML = '';
  
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card fade-in';
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-author">Oleh: ${product.author}</p>
        <p class="product-price">Rp ${product.price.toLocaleString()}</p>
        <p class="product-stock">Stok: ${product.stock}</p>
        <button class="btn btn-block" onclick="addToCart(${product.id})">
          Tambah ke Keranjang
        </button>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });
}

// Fungsi untuk menambah produk ke keranjang
function addToCart(productId) {
  // Cek status login
  if (!currentUser) {
    alert('Silakan login terlebih dahulu untuk menambah produk ke keranjang');
    window.location.href = 'login.html';
    return;
  }

  // Cari produk
  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Cek apakah produk sudah ada di keranjang
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
        } else {
          alert('Stok tidak mencukupi');
          return;
        }
      } else {
        cart.push({
          ...product,
          quantity: 1
        });
      }

      // Simpan ke localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      
      // Animasi feedback
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = '✓ Ditambahkan';
      button.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 1500);
    });
}

// Fungsi untuk update jumlah keranjang
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElements.forEach(element => {
    element.textContent = totalItems;
    element.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

// Fungsi untuk cek status login
function checkLoginStatus() {
  const loginBtn = document.getElementById('loginBtn');
  const userInfo = document.getElementById('userInfo');
  
  if (currentUser && loginBtn && userInfo) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name || currentUser.email;
  }
}

// Fungsi logout
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  cart = [];
  currentUser = null;
  updateCartCount();
  window.location.href = 'index.html';
}

// Fungsi untuk inisialisasi halaman admin
function initAdmin() {
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }
  
  loadAdminData();
}

// Fungsi untuk memuat data admin
async function loadAdminData() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    displayAdminProducts(products);
  } catch (error) {
    console.error('Error loading admin data:', error);
  }
}

// Fungsi untuk menampilkan produk di admin
function displayAdminProducts(products) {
  const productsTable = document.getElementById('productsTable');
  if (!productsTable) return;

  let html = '';
  products.forEach(product => {
    html += `
      <tr>
        <td>${product.id}</td>
        <td>${product.title}</td>
        <td>${product.author}</td>
        <td>${product.category}</td>
        <td>${product.stock}</td>
        <td>Rp ${product.price.toLocaleString()}</td>
        <td>
          <button class="btn" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn" onclick="updateStock(${product.id})">Update Stok</button>
        </td>
      </tr>
    `;
  });
  
  productsTable.innerHTML = html;
}

// Fungsi untuk edit produk
function editProduct(productId) {
  alert(`Edit produk dengan ID: ${productId}`);
  // Implementasi edit produk
}

// Fungsi untuk update stok
function updateStock(productId) {
  const newStock = prompt('Masukkan jumlah stok baru:');
  if (newStock && !isNaN(newStock)) {
    alert(`Stok produk ID: ${productId} diupdate menjadi: ${newStock}`);
    // Implementasi update stok
  }
}

// Event Listeners untuk navigasi
document.addEventListener('DOMContentLoaded', function() {
  // Inisialisasi berdasarkan halaman
  if (window.location.pathname.includes('admin.html')) {
    initAdmin();
  } else {
    initApp();
  }

  // Animasi untuk icon buttons
  const iconButtons = document.querySelectorAll('.icon-button');
  iconButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.backgroundColor = 'rgba(17, 17, 84, 0.1)';
    });
    
    button.addEventListener('mouseleave', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = '';
      }
    });
    
    button.addEventListener('click', function() {
      iconButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Smooth scroll untuk anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Export fungsi untuk digunakan di HTML
window.addToCart = addToCart;
window.logout = logout;
window.editProduct = editProduct;
window.updateStock = updateStock;
