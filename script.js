document.addEventListener('DOMContentLoaded', function() {
    // Selecciona todos los elementos de la lista que tienen un submenú
    const menuItems = document.querySelectorAll('.sidebar-nav .has-submenu');

    menuItems.forEach(item => {
        // Selecciona el enlace principal (el que se clickea para desplegar)
        const link = item.querySelector('a');

        link.addEventListener('click', function(event) {
            // Previene que el navegador siga el enlace (href="#")
            event.preventDefault();

            // Cierra otros submenús abiertos para tener solo uno abierto a la vez
            menuItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Alterna la clase 'active' en el elemento <li> clickeado
            item.classList.toggle('active');
        });
    });
});