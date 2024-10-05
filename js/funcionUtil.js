// Mostrar mensajes usando Toastify
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

    // Búsqueda de libros
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        books.forEach(book => {
            const container = document.getElementById(`${book.category}_container`);
            const bookCards = container.querySelectorAll('.card');
            bookCards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                card.style.display = title.includes(searchTerm) ? '' : 'none';
            });
        });
    });

    // Filtrado de libros
    document.getElementById('filterCategory').addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        books.forEach(book => {
            const container = document.getElementById(`${book.category}_container`);
            container.style.display = book.category === selectedCategory || selectedCategory === '' ? '' : 'none';
        });
    });

    // Ordenamiento de libros
    document.getElementById('sortOrder').addEventListener('change', (e) => {
        const sortOrder = e.target.value;
        books.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
        renderBooks();
    });