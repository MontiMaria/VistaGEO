document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS Y VARIABLES GLOBALES ---
    let resources = JSON.parse(localStorage.getItem('schoolResources')) || [];
    let nextId = resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1;
    let editingResourceId = null;

    // --- REFERENCIAS AL DOM ---
    const form = document.getElementById('create-resource-form');
    const resourceList = document.getElementById('resource-list');
    const deleteModal = document.getElementById('delete-confirm-modal');
    const addBlockModal = document.getElementById('add-block-modal');
    const filterType = document.getElementById('filter-type');
    const addBlockBtn = document.getElementById('add-block-btn');
    const fixedBlocksContainer = document.getElementById('fixed-blocks-container');
    
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    const renderResources = () => {
        const filterValue = filterType.value;
        const resourcesToDisplay = (filterValue === 'all') ? resources : resources.filter(res => res.type === filterValue);

        resourceList.innerHTML = '';
        if (resourcesToDisplay.length === 0) {
            resourceList.innerHTML = '<li style="padding: 20px; text-align: center; color: #777;">No hay recursos.</li>';
            return;
        }

        resourcesToDisplay.forEach(res => {
            const li = document.createElement('li');
            const isInEditMode = res.id === editingResourceId;
            li.className = `resource-item-interactive ${isInEditMode ? 'is-editing' : ''}`;
            li.dataset.resourceId = res.id;

            // --- LÓGICA DEL DESPLEGABLE DE HORARIOS FIJOS ---
            let blocksInfoHTML = '';
            if (res.bloqueosFijos && res.bloqueosFijos.length > 0) {
                const blockListItems = res.bloqueosFijos.map((b, index) => 
                    `<li><span><strong>${diasSemana[b.dia]}:</strong> ${b.horaInicio} - ${b.horaFin}</span><button class="delete-fixed-block-btn" data-block-index="${index}" title="Eliminar este bloqueo">×</button></li>`
                ).join('');
                blocksInfoHTML = `
                    <div class="blocks-info is-clickable"><i class="fas fa-lock"></i> ${res.bloqueosFijos.length} bloqueo(s) fijo(s) <i class="fas fa-chevron-down"></i></div>
                    <div class="fixed-blocks-details"><ul>${blockListItems}</ul><button class="add-fixed-block-btn btn-secondary">+ Añadir otro</button></div>`;
            } else {
                 blocksInfoHTML = `<button class="add-fixed-block-btn btn-secondary" style="padding:5px; margin-top:5px;">+ Añadir Horario Fijo</button>`;
            }

            const quantityDisplayHTML = `<div class="quantity-container"><span class="quantity-display-text">Cantidad: <strong>${res.quantity}</strong></span><div class="quantity-editor"><button class="quantity-btn" data-action="decrease">-</button><span class="quantity-value">${res.quantity}</span><button class="quantity-btn" data-action="increase">+</button></div></div>`;
            const actionsHTML = `<div class="resource-item-actions"><span class="default-actions"><button class="edit-btn" title="Editar Cantidad"><i class="fas fa-pencil-alt"></i></button><button class="delete-btn-x" title="Eliminar Recurso">×</button></span><span class="edit-mode-actions"><button class="save-btn" title="Guardar Cambios"><i class="fas fa-check"></i></button><button class="cancel-edit-btn" title="Cancelar Edición">×</button></span></div>`;

            li.innerHTML = `<div class="resource-item-info"><strong>${res.name}</strong><span class="type-tag">${res.type}</span>${blocksInfoHTML}</div>${quantityDisplayHTML}${actionsHTML}`;
            resourceList.appendChild(li);
        });
    };

    const handleCreateResource = (e) => {
        e.preventDefault();
        const newResource = {
            id: nextId++,
            name: document.getElementById('resource-name').value,
            quantity: parseInt(document.getElementById('resource-quantity').value),
            type: document.getElementById('resource-type').value,
            bloqueosFijos: []
        };
        const blockItems = fixedBlocksContainer.querySelectorAll('.fixed-block-item');
        blockItems.forEach(item => {
            const dia = item.querySelector('.fixed-day').value;
            const horaInicio = item.querySelector('.fixed-start-time').value;
            const horaFin = item.querySelector('.fixed-end-time').value;
            if (dia && horaInicio && horaFin && horaFin > horaInicio) {
                newResource.bloqueosFijos.push({ dia: parseInt(dia), horaInicio: horaInicio, horaFin: horaFin });
            }
        });
        resources.push(newResource);
        localStorage.setItem('schoolResources', JSON.stringify(resources));
        alert(`Recurso "${newResource.name}" creado con éxito.`);
        form.reset();
        fixedBlocksContainer.innerHTML = '';
        renderResources();
    };

    const handleDeleteResource = (resourceId) => {
        const resourceToDelete = resources.find(r => r.id === resourceId);
        if (!resourceToDelete) return;
        deleteModal.style.display = 'flex';
        deleteModal.querySelector('#delete-resource-name').textContent = resourceToDelete.name;
        deleteModal.querySelector('#confirm-delete-btn').onclick = () => {
            const reason = deleteModal.querySelector('#delete-reason-input').value.trim();
            if (!reason) { alert('El motivo de la baja es obligatorio.'); return; }
            resources = resources.filter(r => r.id !== resourceId);
            localStorage.setItem('schoolResources', JSON.stringify(resources));
            closeDeleteModal();
            renderResources();
        };
    };
    
    const closeDeleteModal = () => {
        deleteModal.querySelector('#delete-reason-input').value = '';
        deleteModal.style.display = 'none';
    };

    const openAddBlockModal = (resourceId) => {
        const resource = resources.find(r => r.id === resourceId);
        if (!resource) return;
        addBlockModal.querySelector('#add-block-resource-name').textContent = resource.name;
        addBlockModal.style.display = 'flex';
        const confirmBtn = addBlockModal.querySelector('#confirm-add-block-btn');
        confirmBtn.onclick = () => {
            const dia = parseInt(addBlockModal.querySelector('#add-block-day').value);
            const horaInicio = addBlockModal.querySelector('#add-block-start-time').value;
            const horaFin = addBlockModal.querySelector('#add-block-end-time').value;
            if (!horaInicio || !horaFin || horaFin <= horaInicio) {
                alert('Por favor, ingrese un rango de horas válido.');
                return;
            }
            if (!resource.bloqueosFijos) resource.bloqueosFijos = [];
            resource.bloqueosFijos.push({ dia, horaInicio, horaFin });
            localStorage.setItem('schoolResources', JSON.stringify(resources));
            closeAddBlockModal();
            renderResources();
        };
    };
    const closeAddBlockModal = () => { addBlockModal.style.display = 'none'; };

    // --- EVENT LISTENERS ---
    form.addEventListener('submit', handleCreateResource);
    filterType.addEventListener('change', renderResources);
    
    addBlockBtn.addEventListener('click', () => {
        const newBlock = document.createElement('div');
        newBlock.className = 'form-group-inline fixed-block-item';
        newBlock.style.marginBottom = '10px';
        newBlock.innerHTML = `
            <select class="fixed-day" style="flex:2; padding:8px; border:1px solid #ccc; border-radius:4px;">
                <option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option>
                <option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option><option value="0">Domingo</option>
            </select>
            <input type="time" class="fixed-start-time" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" required>
            <input type="time" class="fixed-end-time" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" required>
            <button type="button" class="remove-block-btn" style="background:#e74c3c; color:white; border:none; border-radius:4px; padding:5px 10px; cursor:pointer;">X</button>`;
        fixedBlocksContainer.appendChild(newBlock);
    });

    fixedBlocksContainer.addEventListener('click', (e) => { if (e.target.classList.contains('remove-block-btn')) e.target.parentElement.remove(); });

    resourceList.addEventListener('click', (e) => {
        const item = e.target.closest('.resource-item-interactive');
        if (!item) return;
        const resourceId = parseInt(item.dataset.resourceId);
        const resource = resources.find(r => r.id === resourceId);

        if (e.target.closest('.edit-btn')) { editingResourceId = resourceId; renderResources(); }
        else if (e.target.closest('.save-btn')) {
            resource.quantity = parseInt(item.querySelector('.quantity-value').textContent);
            localStorage.setItem('schoolResources', JSON.stringify(resources));
            editingResourceId = null;
            renderResources();
        }
        else if (e.target.closest('.cancel-edit-btn')) { editingResourceId = null; renderResources(); }
        else if (e.target.closest('.quantity-btn')) {
            const action = e.target.closest('.quantity-btn').dataset.action;
            const valueSpan = item.querySelector('.quantity-value');
            let currentValue = parseInt(valueSpan.textContent);
            if (action === 'increase') currentValue++;
            else if (action === 'decrease' && currentValue > 0) currentValue--;
            valueSpan.textContent = currentValue;
        }
        else if (e.target.closest('.delete-btn-x')) { handleDeleteResource(resourceId); }
        else if (e.target.closest('.blocks-info.is-clickable')) { item.classList.toggle('blocks-expanded'); }
        else if (e.target.closest('.add-fixed-block-btn')) { openAddBlockModal(resourceId); }
        else if (e.target.closest('.delete-fixed-block-btn')) {
            const blockIndex = parseInt(e.target.closest('.delete-fixed-block-btn').dataset.blockIndex);
            resource.bloqueosFijos.splice(blockIndex, 1);
            localStorage.setItem('schoolResources', JSON.stringify(resources));
            renderResources();
        }
    });

    deleteModal.querySelector('#cancel-delete-btn').addEventListener('click', closeDeleteModal);
    addBlockModal.querySelector('#cancel-add-block-btn').addEventListener('click', closeAddBlockModal);
    
    renderResources();
});