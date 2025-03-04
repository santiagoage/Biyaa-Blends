// Clase principal para manejar el carrito de compras con funcionalidad offline
class OfflineShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
        this.loadCart();
        this.initializeCart();
        this.setupOfflineListeners();
    }

    // Cargar el carrito desde localStorage
    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const { items, total } = JSON.parse(savedCart);
                this.items = items;
                this.total = total;
            } catch (error) {
                console.error("Error al cargar el carrito:", error);
                localStorage.removeItem('cart');
            }
        }
        
        // Cargar operaciones pendientes si existen
        const pendingOps = localStorage.getItem('pendingCartOperations');
        if (pendingOps) {
            try {
                this.pendingSync = JSON.parse(pendingOps);
            } catch (error) {
                console.error("Error al cargar operaciones pendientes:", error);
                localStorage.removeItem('pendingCartOperations');
            }
        }
    }

    // Guardar el carrito en localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    }
    
    // Configurar listeners para detectar cambios en conexión
    setupOfflineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Conexión restablecida');
            this.syncPendingOperations();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Modo sin conexión activado');
        });
    }
    
    // Sincronizar operaciones pendientes cuando vuelve la conexión
    syncPendingOperations() {
        if (this.pendingSync.length > 0) {
            console.log("Sincronizando operaciones pendientes:", this.pendingSync.length);
            // Aquí implementarías la lógica para enviar datos al servidor
            // Por ejemplo, usando fetch o XMLHttpRequest
            
            // Para este ejemplo, simularemos una sincronización exitosa
            this.showNotification(`${this.pendingSync.length} operaciones sincronizadas`);
            this.pendingSync = [];
            localStorage.removeItem('pendingCartOperations');
        }
    }
    
    // Añadir una operación a la cola de sincronización
    addPendingOperation(operation) {
        this.pendingSync.push({
            ...operation,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pendingCartOperations', JSON.stringify(this.pendingSync));
    }

    // Añadir producto al carrito
    addItem(title, price, image) {
        console.log("Añadiendo producto:", { title, price, image });
        
        // Asegurarnos que price sea un número
        if (typeof price === 'string') {
            price = parseFloat(price.replace('$', '').trim());
        }
        
        // Si price no es un número válido, usar 0
        if (isNaN(price)) {
            console.error("Precio inválido para:", title);
            price = 0;
        }

        const existingItem = this.items.find(item => item.title === title);
        
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            this.items.push({
                title,
                price,
                image,
                quantity: 1,
                subtotal: price
            });
        }
        
        // Guardar operación para sincronizar después
        if (!this.isOnline) {
            this.addPendingOperation({
                type: 'add',
                data: { title, price, image, quantity: 1 }
            });
        }
        
        this.updateTotal();
        this.saveCart();
        this.updateUI();
        this.showNotification(`${title} agregado al carrito${!this.isOnline ? ' (offline)' : ''}`);
    }

    // Remover producto del carrito
    removeItem(title) {
        const index = this.items.findIndex(item => item.title === title);
        if (index !== -1) {
            const removedItem = this.items[index];
            this.items.splice(index, 1);
            
            // Guardar operación para sincronizar después
            if (!this.isOnline) {
                this.addPendingOperation({
                    type: 'remove',
                    data: { title }
                });
            }
            
            this.updateTotal();
            this.saveCart();
            this.updateUI();
            this.showNotification(`${title} eliminado del carrito${!this.isOnline ? ' (offline)' : ''}`);
        }
    }

    // Actualizar cantidad de un producto
    updateQuantity(title, quantity) {
        const item = this.items.find(item => item.title === title);
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = parseInt(quantity);
            item.subtotal = item.quantity * item.price;
            
            if (item.quantity <= 0) {
                this.removeItem(title);
            } else {
                // Guardar operación para sincronizar después
                if (!this.isOnline) {
                    this.addPendingOperation({
                        type: 'update',
                        data: { title, quantity: item.quantity, oldQuantity }
                    });
                }
                
                this.updateTotal();
                this.saveCart();
                this.updateUI();
            }
        }
    }

    // Calcular total
    updateTotal() {
        this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    // Mostrar notificación
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Crear el modal del carrito
    createCartModal() {
        const modal = document.createElement('div');
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2>Carrito de Compras ${!this.isOnline ? '(Offline)' : ''}</h2>
                    <button class="cart-modal-close">&times;</button>
                </div>
                <div class="cart-modal-body">
                    <div class="cart-items"></div>
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="cart-total-amount">$${this.total.toFixed(2)}</span>
                    </div>
                    ${!this.isOnline && this.pendingSync.length > 0 ? 
                      `<div class="cart-sync-pending">
                         <p>Tienes ${this.pendingSync.length} operaciones pendientes de sincronizar</p>
                       </div>` : ''}
                </div>
                <div class="cart-modal-footer">
                    <button class="cart-checkout-btn" ${!this.isOnline ? 'disabled' : ''}>
                        ${!this.isOnline ? 'No disponible offline' : 'Proceder al Pago'}
                    </button>
                    <button class="cart-clear-btn">Vaciar Carrito</button>
                </div>
            </div>
        `;
        return modal;
    }

    // Actualizar UI del carrito
    updateUI() {
        // Actualizar indicador de cantidad
        let cartIndicator = document.querySelector('.cart-indicator');
        if (!cartIndicator) {
            cartIndicator = this.createCartIndicator();
        }
        
        const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartIndicator.textContent = itemCount;
        cartIndicator.style.display = itemCount > 0 ? 'flex' : 'none';
        
        // Actualizar clase para mostrar estado offline
        const cartButton = document.querySelector('.cart-button');
        if (cartButton) {
            if (!this.isOnline) {
                cartButton.classList.add('offline-mode');
            } else {
                cartButton.classList.remove('offline-mode');
            }
        }

        // Actualizar modal si está abierto
        const modalBody = document.querySelector('.cart-items');
        if (modalBody) {
            this.updateCartModal();
        }
    }

    // Crear indicador del carrito
    createCartIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'cart-indicator';
        // Colocar en la esquina superior derecha del botón
        indicator.style.position = 'absolute';
        indicator.style.top = '-8px';
        indicator.style.right = '-8px';
        indicator.style.backgroundColor = '#ff3b3b';
        indicator.style.color = 'white';
        indicator.style.borderRadius = '50%';
        indicator.style.width = '22px';
        indicator.style.height = '22px';
        indicator.style.display = 'flex';
        indicator.style.justifyContent = 'center';
        indicator.style.alignItems = 'center';
        indicator.style.fontSize = '12px';
        indicator.style.fontWeight = 'bold';
        indicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        indicator.style.border = '2px solid white';
        
        const cartButton = document.querySelector('.cart-button');
        if (cartButton) {
            cartButton.appendChild(indicator);
        } else {
            console.error("No se encontró el botón del carrito");
        }
        
        return indicator;
    }

    // Actualizar contenido del modal
    updateCartModal() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total-amount');
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío</p>';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.title}</h3>
                        <p>Precio: $${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-title="${item.title}">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-title="${item.title}">
                            <button class="quantity-btn plus" data-title="${item.title}">+</button>
                        </div>
                        <p>Subtotal: $${item.subtotal.toFixed(2)}</p>
                    </div>
                    <button class="cart-item-remove" data-title="${item.title}">&times;</button>
                </div>
            `).join('');
        }

        cartTotal.textContent = `$${this.total.toFixed(2)}`;
        
        // Actualizar estado del botón de checkout
        const checkoutBtn = document.querySelector('.cart-checkout-btn');
        if (checkoutBtn) {
            if (!this.isOnline) {
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'No disponible offline';
            } else {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceder al Pago';
            }
        }
    }

    // Inicializar el carrito
    initializeCart() {
        // Crear botón del carrito en el nav si no existe
        let cartButton = document.querySelector('.cart-button');
        if (!cartButton) {
            cartButton = document.createElement('button');
            cartButton.className = 'cart-button';
            cartButton.innerHTML = '<i class="bx bx-cart"></i>';
            cartButton.style.position = 'relative';
            cartButton.style.background = 'none';
            cartButton.style.border = 'none';
            cartButton.style.fontSize = '1.5rem';
            cartButton.style.cursor = 'pointer';
            cartButton.style.color = 'inherit';
            cartButton.style.marginLeft = '15px';
            
            // Añadir indicador de offline si es necesario
            if (!this.isOnline) {
                cartButton.classList.add('offline-mode');
            }
            
            document.querySelector('.nav').appendChild(cartButton);
        }

        // Event listeners
        cartButton.addEventListener('click', () => this.openCart());

        // Agregar event listeners a los botones de productos
        const productButtons = document.querySelectorAll('.pdbut');
        console.log(`Encontrados ${productButtons.length} botones de productos`);
        
        productButtons.forEach((button, index) => {
            // Remover listener anterior si existe (para evitar duplicados)
            button.removeEventListener('click', button._clickHandler);
            
            // Crear nuevo handler y guardarlo para poder eliminarlo después si es necesario
            button._clickHandler = (e) => {
                e.preventDefault(); // Prevenir comportamiento por defecto
                e.stopPropagation(); // Evitar burbujas de evento
                
                const productCard = button.closest('.pdcontent');
                if (!productCard) {
                    console.error("No se pudo encontrar el contenedor del producto");
                    return;
                }
                
                const titleElement = productCard.querySelector('.pdtitle');
                const subElement = productCard.querySelector('.pdsub');
                const priceElement = productCard.querySelector('.pdprice');
                const imageElement = productCard.querySelector('.productimg');
                
                if (!titleElement || !priceElement || !imageElement) {
                    console.error("Elementos del producto no encontrados", { 
                        title: titleElement, 
                        price: priceElement, 
                        image: imageElement 
                    });
                    return;
                }
                
                // Crear un título único que incluye la medida (1kg, 1/2kg, etc.)
                const title = titleElement.textContent + ' ' + (subElement ? subElement.textContent.trim() : '');
                const priceText = priceElement.textContent;
                const price = parseFloat(priceText.replace('$', '').trim());
                const image = imageElement.src;
                
                console.log(`Añadiendo producto ${index+1}:`, { title, price, image });
                this.addItem(title, price, image);
            };
            
            // Añadir el nuevo listener
            button.addEventListener('click', button._clickHandler);
            console.log(`Event listener añadido para el botón ${index+1}`);
        });
        
        // Añadir soporte para Service Worker si el navegador lo soporta
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                this.registerServiceWorker();
            });
        }
        
        // Crear el indicador del carrito y actualizarlo
        this.updateUI();
    }
    
    // Registrar el Service Worker para funcionamiento offline
    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });
    }

    // Abrir el carrito
    openCart() {
        const modal = this.createCartModal();
        document.body.appendChild(modal);
        this.updateCartModal();

        // Event listeners del modal
        modal.querySelector('.cart-modal-close').addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-modal')) {
                modal.remove();
            }
        });

        // Event listeners para los botones de cantidad
        modal.addEventListener('click', (e) => {
            const title = e.target.dataset.title;
            if (!title) return;

            if (e.target.classList.contains('minus')) {
                const item = this.items.find(item => item.title === title);
                if (item) this.updateQuantity(title, item.quantity - 1);
            }
            else if (e.target.classList.contains('plus')) {
                const item = this.items.find(item => item.title === title);
                if (item) this.updateQuantity(title, item.quantity + 1);
            }
            else if (e.target.classList.contains('cart-item-remove')) {
                this.removeItem(title);
            }
        });

        // Event listener para inputs de cantidad
        modal.addEventListener('change', (e) => {
            if (e.target.type === 'number') {
                const title = e.target.dataset.title;
                this.updateQuantity(title, e.target.value);
            }
        });

        // Event listener para vaciar carrito
        modal.querySelector('.cart-clear-btn').addEventListener('click', () => {
            if (!this.isOnline) {
                this.addPendingOperation({
                    type: 'clear',
                    data: { items: [...this.items] } // Guardar copia de items para posible restauración
                });
            }
            
            this.items = [];
            this.total = 0;
            this.saveCart();
            this.updateUI();
            modal.remove();
            this.showNotification('Carrito vaciado' + (!this.isOnline ? ' (offline)' : ''));
        });

        // Event listener para checkout
// Dentro de la función openCart() en cart.js
// Modifica el event listener del botón de checkout

// Event listener para checkout
const checkoutBtn = modal.querySelector('.cart-checkout-btn');
if (checkoutBtn && !checkoutBtn.disabled) {
    checkoutBtn.addEventListener('click', () => {
        if (this.items.length > 0) {
            if (this.isOnline) {
                // Verificar si hay un usuario con sesión iniciada
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    // El usuario tiene sesión iniciada, proceder con la compra
                    alert('¡Gracias por tu compra, ' + currentUser + '! Total: $' + this.total.toFixed(2));
                    this.items = [];
                    this.total = 0;
                    this.saveCart();
                    this.updateUI();
                    modal.remove();
                } else {
                    // No hay sesión iniciada, redirigir a la página de login
                    alert('Debes iniciar sesión para completar la compra');
                    // Guardar el estado del carrito para mantenerlo después del login
                    localStorage.setItem('pendingCheckout', 'true');
                    // Redirigir a la página de login
                    window.location.href = 'inicio.html';
                }
            } else {
                alert('No se puede completar la compra sin conexión a internet');
            }
        } else {
            alert('El carrito está vacío');
        }
    });
}
    }
}

// Para asegurar que no haya problemas de inicialización múltiple
if (window.cart) {
    console.log("Reinicializando el carrito...");
}

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, inicializando carrito...");
    window.cart = new OfflineShoppingCart();
    
    // Para los casos donde el DOM ya está cargado cuando se ejecuta el script
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log("DOM ya estaba cargado, asegurando inicialización...");
        setTimeout(() => {
            if (!window.cart || window.cart.items === undefined) {
                window.cart = new OfflineShoppingCart();
            }
        }, 100);
    }
});