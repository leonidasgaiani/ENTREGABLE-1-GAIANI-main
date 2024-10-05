let books = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || []; 

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const purchaseForm = document.getElementById('purchase-form');
    const cardDetails = document.getElementById('cardDetails');
    const greetingElement = document.getElementById('greeting');
    const wishlistElement = document.getElementById('wishlist');

    // Cargar carrito y wishlist desde localStorage
    updateCartFromStorage();
    updateWishlistFromStorage();

    // Solicitar nombre al cargar la página
    // Solicitar nombre al cargar la página
    function requestUserName() {
        swal({
            text: "Por favor, ingresa tu nombre:",
            content: "input",
            button: {
                text: "Enviar",
                closeModal: false,
            },
        })
        .then((value) => {
            if (value && value.trim() !== "") {
                greetingElement.innerHTML = `<h2>¡Hola, ${value.trim()}! Bienvenido a nuestra tienda de libros.</h2>`;
                swal.close();
            } else {
                swal("Error", "Por favor, ingresa un nombre válido.", "error").then(() => {
                    requestUserName();  
                });
            }
        });
    }
    
    requestUserName();

    // Cargar libros
    loadBooks();

    // Función para cargar libros desde data.json
    function loadBooks() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) throw new Error('Error en la red: ' + response.status);
                return response.json();
            })
            .then(data => {
                books = data; 
                renderBooks(); 
            })
            .catch(error => {
                showToast('Error al cargar los libros.', 'error');
            });
    }

    // Función para renderizar libros en el DOM
    function renderBooks() {
        const categories = ['ciencia_ficcion', 'policiales', 'terror'];
        categories.forEach(category => {
            const container = document.getElementById(`${category}_container`);
            if (!container) return;
            container.innerHTML = '';

            books.filter(book => book.category === category).forEach((book) => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card">
                        <img src="${book.img}" class="card-img-top" alt="${book.title}">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text">Autor: ${book.author}</p>
                            <p class="card-text">Precio: $${book.price.toFixed(2)}</p>
                            <button class="btn btn-primary add-to-cart" data-title="${book.title}">Agregar al carrito</button>
                            <button class="btn btn-secondary add-to-wishlist" data-title="${book.title}">Añadir a Deseos</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
                card.querySelector('.add-to-cart').addEventListener('click', () => confirmAddToCart(book));
                card.querySelector('.add-to-wishlist').addEventListener('click', () => addToWishlist(book));
            });
        });
    }

    // Confirmar añadir libros al carrito
    function confirmAddToCart(book) {
        Swal.fire({
            title: "¿Quieres añadirlo al carrito?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Añadir",
            denyButtonText: "No añadir",
        }).then((result) => {
            if (result.isConfirmed) {
                addToCart(book);
            } else if (result.isDenied) {
                showToast(`${book.title} no fue añadido al carrito.`, 'info');
            }
        });
    }

    // Función para agregar libros al carrito
    function addToCart(book) {
        const existingBook = cart.find(item => item.title === book.title);
        if (existingBook) {
            existingBook.quantity++;
        } else {
            cart.push({ ...book, quantity: 1 });
        }
        updateCart();
        localStorage.setItem('cart', JSON.stringify(cart));
        showToast(`${book.title} ha sido añadido al carrito.`, 'success');
    }
  
    // Función para agregar libros a la lista de deseos
    function addToWishlist(book) {
        const existingWish = wishlist.find(item => item.title === book.title);
        if (!existingWish) {
            wishlist.push(book);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            showToast(`${book.title} ha sido añadido a tu lista de deseos.`, 'success');
            renderWishlist(); 
        } else {
            showToast(`${book.title} ya está en tu lista de deseos.`, 'info');
        }
    }

    // Función para renderizar la lista de deseos en el DOM
    function renderWishlist() {
        wishlistElement.innerHTML = ''; 
        wishlist.forEach((book, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${book.title}
                <button class="btn btn-success move-to-cart" data-index="${index}">Mover al Carrito</button>
                <button class="btn btn-danger remove-from-wishlist" data-index="${index}">Eliminar</button>
            `;
            wishlistElement.appendChild(li);
            li.querySelector('.move-to-cart').addEventListener('click', () => moveToCart(index));
            li.querySelector('.remove-from-wishlist').addEventListener('click', () => removeFromWishlist(index));
        });
    }

    // Función para mover un libro de la lista de deseos al carrito
    function moveToCart(index) {
        const book = wishlist[index];
        addToCart(book); 
        wishlist.splice(index, 1); 
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Guardar wishlist actualizada
        renderWishlist(); 
        showToast(`${book.title} ha sido movido al carrito.`, 'success');
    }

    // Función para eliminar un libro de la lista de deseos
    function removeFromWishlist(index) {
        const book = wishlist[index];
        wishlist.splice(index, 1); 
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Guardar wishlist actualizada
        renderWishlist();
        showToast(`${book.title} ha sido eliminado de la lista de deseos.`, 'success');
    }

    // Función para actualizar el carrito en el DOM
    function updateCart() {
        cartList.innerHTML = '';
        cart.forEach((book, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${book.title} - ${book.quantity} unidades</span>
                <div>
                    <button class="btn btn-sm btn-primary modify-quantity" data-index="${index}">Agregar Articulos</button>
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}">Eliminar</button>
                </div>
            `;
            cartList.appendChild(li);
            li.querySelector('.remove-item').addEventListener('click', () => removeFromCart(index));
            li.querySelector('.modify-quantity').addEventListener('click', () => modifyQuantity(index));
        });

        cartTotal.textContent = `Total: $${calculateTotal()}`;
        localStorage.setItem('cart', JSON.stringify(cart));
        emptyCartMessage.style.display = cart.length === 0 ? 'block' : 'none'; 
    }

    // Función para modificar la cantidad de un libro en el carrito
    function modifyQuantity(index) {
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = cart[index].quantity;
        quantityInput.min = 1;
        quantityInput.className = 'form-control';

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(quantityInput);

        const modal = new bootstrap.Modal(document.getElementById('modal'));
        modal.show();

        const confirmButton = document.getElementById('confirmModalButton');
        confirmButton.onclick = () => {
            const quantity = parseInt(quantityInput.value, 10);
            if (!isNaN(quantity) && quantity > 0) {
                cart[index].quantity = quantity;  
                updateCart();
                modal.hide();
            } else {
                showToast('La cantidad ingresada no es válida.', 'error');
            }
        };

        const cancelButton = document.getElementById('cancelModalButton');
        cancelButton.onclick = () => {
            modal.hide();
        };
    }

    // Función para eliminar un libro del carrito
    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            updateCart();
            if (cart.length === 0) {
                showToast('El carrito está vacío.', 'success');
            }
        } else {
            showToast('Error al intentar eliminar el libro del carrito.', 'error');
        }
    }

    // Botón para vaciar el carrito
    document.getElementById('emptyCartButton').addEventListener('click', () => {
        cart = [];
        localStorage.removeItem('cart'); // Limpiar localStorage
        updateCart();
        showToast('El carrito ha sido vaciado.', 'success');
    });

     // Botón para guardar la compra
     document.getElementById('savePurchaseButton').addEventListener('click', () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        Swal.fire({
            title: '¿Deseas continuar más tarde o seguir con la compra?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Seguir comprando',
            denyButtonText: 'Continuar más tarde',
        }).then((result) => {
            if (result.isConfirmed) {
                showToast('¡Sigue disfrutando de tu compra!', 'success');
            } else if (result.isDenied) {
                showToast('Tu compra ha sido guardada. Puedes continuar más tarde.', 'info');
            }
        });
    });

    // Botón para finalizar la compra
    document.getElementById('checkoutButton').addEventListener('click', () => {
        if (cart.length > 0) {
            purchaseForm.style.display = 'block'; 
        } else {
            showToast('El carrito está vacío. No puedes finalizar la compra.', 'error');
        }
    });

    // Cambia la visibilidad del formulario de tarjeta
    document.getElementById('paymentMethod').addEventListener('change', function() {
        cardDetails.style.display = this.value === 'tarjeta' ? 'block' : 'none';
    });

    // Botón para confirmar la compra
    document.getElementById('confirmPurchaseButton').addEventListener('click', () => {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardExpiry = document.getElementById('cardExpiry').value.trim();
        const cardCVC = document.getElementById('cardCVC').value.trim();

        if (name && email && (paymentMethod === 'efectivo' || (paymentMethod === 'tarjeta' && cardNumber && cardExpiry && cardCVC))) {
            showToast('¡Gracias por tu compra!', 'success'); 
            cart = []; 
            localStorage.removeItem('cart'); // Limpiar localStorage
            updateCart();
            purchaseForm.style.display = 'none'; 
            document.getElementById('name').value = ''; 
            document.getElementById('email').value = ''; 
            document.getElementById('cardNumber').value = ''; 
            document.getElementById('cardExpiry').value = ''; 
            document.getElementById('cardCVC').value = ''; 
        } else {
            showToast('Por favor, completa todos los campos requeridos.', 'error');
        }
    });

    // Calcular el total del carrito
function calculateTotal() {
    return cart.reduce((total, book) => total + (book.price * book.quantity), 0).toFixed(2); // Retorna el total con dos decimales
}


    // Función para mostrar mensajes usando Toastify
    function showToast(message, type) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: type === 'error' ? 'red' : 'rgb(129, 254, 2)', 
            },
            stopOnFocus: true,
        }).showToast();
    }

    // Función para actualizar carrito desde localStorage
    function updateCartFromStorage() {
        const savedCart = JSON.parse(localStorage.getItem('cart'));
        if (savedCart) {
            cart = savedCart; 
            updateCart(); 
        }
    }

    // Función para actualizar wishlist desde localStorage
    function updateWishlistFromStorage() {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist'));
        if (savedWishlist) {
            wishlist = savedWishlist; 
            renderWishlist(); 
        }
    }
});
