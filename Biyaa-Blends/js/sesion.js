// Esta función se ejecutará cuando el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de sesión cargado");
    
    // Obtener el usuario actual de localStorage
    const currentUser = localStorage.getItem('currentUser');
    console.log("Usuario actual:", currentUser);
    
    // Obtener el enlace de login
    const loginLink = document.getElementById('loginLink');
    console.log("Elemento loginLink encontrado:", loginLink);
    
    if (currentUser && loginLink) {
        console.log("Cambiando 'Login' por el nombre de usuario:", currentUser);
        // Cambiar el texto de "Login" por el nombre del usuario
        loginLink.textContent = currentUser;
        
        // Crear elemento para el enlace de cerrar sesión
        const navList = document.querySelector('.navList');
        console.log("Lista de navegación encontrada:", navList);
        
        if (navList) {
            // Crear nuevo elemento de lista para "Cerrar sesión"
            const logoutItem = document.createElement('li');
            logoutItem.className = 'navItem';
            
            // Crear el enlace
            const logoutLink = document.createElement('a');
            logoutLink.href = "#";
            logoutLink.className = 'navLink'; // O 'nav__link' si ese es el estilo correcto
            logoutLink.textContent = 'Cerrar sesión';
            
            // Función para cerrar sesión
            logoutLink.onclick = function(e) {
                e.preventDefault();
                console.log("Cerrando sesión...");
                localStorage.removeItem('currentUser');
                window.location.reload();
            };
            
            // Agregar el enlace al elemento de lista
            logoutItem.appendChild(logoutLink);
            
            // Agregar el elemento de lista al menú
            navList.appendChild(logoutItem);
            console.log("Enlace de cierre de sesión agregado");
        } else {
            console.log("¡No se encontró la lista de navegación!");
        }
    } else {
        console.log("No hay usuario conectado o no se encontró el elemento loginLink");
    }
});

// Verificar si hay una compra pendiente después del inicio de sesión
if (currentUser && localStorage.getItem('pendingCheckout')) {
    // Eliminar la marca de compra pendiente
    localStorage.removeItem('pendingCheckout');
    
    // Si estamos en la página de inicio, redirigir al usuario a la página principal con el carrito
    if (window.location.pathname.includes('inicio.html')) {
        console.log("Redirección post-login para finalizar compra");
        window.location.href = 'index.html#product';
        
        // Opcional: Mostrar el carrito automáticamente después de la redirección
        // Esto requerirá un parámetro adicional en la URL o localStorage 
        // para que index.html sepa que debe abrir el carrito
    }
}