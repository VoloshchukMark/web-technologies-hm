document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.item');
    const columns = document.querySelectorAll('.items');

    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            setTimeout(() => {
                item.classList.add('dragging');
            }, 0);
        });

        item.addEventListener('dragend', () => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            column.classList.remove('drag-over');
            if (draggedItem) {
                column.appendChild(draggedItem);
            }
        });
    });
});