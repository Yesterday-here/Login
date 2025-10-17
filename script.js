// Data dan State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Fungsi untuk inisialisasi aplikasi
function initApp() {
  console.log('Initializing app...');
  updateCartCount();
  checkLoginStatus();
  
  // Hanya load products jika di halaman yang membutuhkan
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname === '/' || 
      window.location.pathname.endsWith('/')) {
    loadProducts();
  }
}

// Fungsi untuk memuat produk
async function loadProducts() {
  try {
    console.log('Loading products...');
    const response = await fetch('products.json');
    if (!response.ok) {
      throw new Error('Products file not found');
    }
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback data jika file tidak ditemukan
    const fallbackProducts = [
      {
        id: 1,
        title: "Pemrograman JavaScript",
        author: "John Doe",
        price: 120000,
        stock: 15,
        image: "https://via.placeholder.com/300x400/111154/ffffff?text=JavaScript",
        category: "Pemrograman"
      },
      {
        id: 2,
        title: "Desain UI/UX Modern", 
        author: "Jane Smith",
        price: 95000,
        stock: 8,
        image: "https://via.placeholder.com/300x400/111154/ffffff?text=UI/UX",
        category: "Desain"
      }
    ];
    displayProducts(fallbackProducts);
  }
}

// Fungsi untuk menampilkan produk
function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) {
    console.log('Products grid not found');
    return;
  }

  console.log('Displaying products:', products.length);
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
  console.log('Adding to cart:', productId);
  
  // Cek status login
  if (!currentUser) {
    alert('Silakan login terlebih dahulu untuk menambah produk ke keranjang');
    window.location.href = 'login.html';
    return;
  }

  // Gunakan data fallback jika perlu
  const fallbackProducts = [
    {
      id: 1,
      title: "Pemrograman JavaScript",
      author: "John Doe", 
      price: 120000,
      stock: 15,
      image: "https://via.placeholder.com/300x400/111154/ffffff?text=JavaScript",
      category: "Pemrograman"
    },
    {
      id: 2,
      title: "Desain UI/UX Modern",
      author: "Jane Smith",
      price: 95000, 
      stock: 8,
      image: "https://via.placeholder.com/300x400/111154/ffffff?text=UI/UX",
      category: "Desain"
    }
  ];

  let products = fallbackProducts;
  
  // Coba load dari file, jika gagal gunakan fallback
  fetch('products.json')
    .then(response => {
      if (response.ok) return response.json();
      throw new Error('File not found');
    })
    .then(productsData => {
      products = productsData;
    })
    .catch(error => {
      console.log('Using fallback products data');
      products = fallbackProducts;
    })
    .finally(() => {
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error('Product not found:', productId);
        return;
      }

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
    if (element) {
      element.textContent = totalItems;
      element.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  });
}

// Fungsi untuk cek status login
function checkLoginStatus() {
  const loginBtn = document.getElementById('loginBtn');
  const userInfo = document.getElementById('userInfo');
  
  if (currentUser && loginBtn && userInfo) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = currentUser.name || currentUser.email;
    }
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
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  // Untuk testing, jika tidak ada role, set sebagai admin
  if (!currentUser.role) {
    currentUser.role = 'admin';
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  if (currentUser.role !== 'admin') {
    alert('Anda tidak memiliki akses ke halaman admin');
    window.location.href = 'index.html';
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
    // Fallback data
    const fallbackProducts = [
      {
        id: 1,
        title: "Pemrograman JavaScript",
        author: "John Doe",
        price: 120000,
        stock: 15,
        category: "Pemrograman"
      },
      {
        id: 2,
        title: "Desain UI/UX Modern",
        author: "Jane Smith", 
        price: 95000,
        stock: 8,
        category: "Desain"
      }
    ];
    displayAdminProducts(fallbackProducts);
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
  console.log('DOM loaded, current page:', window.location.pathname);
  
  // Inisialisasi berdasarkan halaman
  if (window.location.pathname.includes('admin.html')) {
    initAdmin();
  } else if (window.location.pathname.includes('cart.html')) {
    initCart();
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

// Fungsi untuk inisialisasi keranjang
function initCart() {
  checkLoginStatus();
  updateCartCount();
  loadCart();
}

// Fungsi untuk memuat keranjang
function loadCart() {
  const cartItems = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const emptyCart = document.getElementById('emptyCart');
  
  if (!cartItems || !cartSummary || !emptyCart) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartSummary.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }
  
  emptyCart.style.display = 'none';
  cartSummary.style.display = 'block';
  
  let html = '';
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    html += `
      <div class="cart-item fade-in">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.title}</h3>
          <p class="cart-item-author">Oleh: ${item.author}</p>
          <p class="cart-item-price">Rp ${item.price.toLocaleString()}</p>
          
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          
          <button class="remove-btn" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 600; font-size: 1.1rem;">Rp ${itemTotal.toLocaleString()}</p>
        </div>
      </div>
    `;
  });
  
  cartItems.innerHTML = html;
  
  // Update summary
  document.getElementById('subtotal').textContent = `Rp ${subtotal.toLocaleString()}`;
  document.getElementById('total').textContent = `Rp ${(subtotal + 15000).toLocaleString()}`;
}

// Fungsi untuk update quantity
function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(productId);
    return;
  }
  
  const item = cart.find(item => item.id === productId);
  if (item && newQuantity <= item.stock) {
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
  } else {
    alert('Stok tidak mencukupi');
  }
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  loadCart();
}

// Fungsi checkout
function checkout() {
  if (!currentUser) {
    alert('Silakan login terlebih dahulu untuk checkout');
    window.location.href = 'login.html';
    return;
  }
  
  // Simulasi proses checkout
  alert('Checkout berhasil! Pesanan Anda sedang diproses.');
  
  // Kosongkan keranjang
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  loadCart();
}

// Export fungsi untuk digunakan di HTML
window.addToCart = addToCart;
window.logout = logout;
window.editProduct = editProduct;
window.updateStock = updateStock;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.initCart = initCart;
window.loadCart = loadCart;
