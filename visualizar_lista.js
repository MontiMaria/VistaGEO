document.addEventListener('DOMContentLoaded', () => {
    // --- LECTURA DE DATOS ---
    // Asumimos que datos.js ya se encargó de inicializar los datos si era necesario.
    let allReservations = JSON.parse(localStorage.getItem('schoolReservations')) || [];

    // --- LÓGICA DE ROLES ---
    const users = {
        directivo: { role: 'Directivo', id: 0, name: 'Director/a' },
        maestro: { role: 'Maestro', id: 1, name: 'Juan Pérez' }
    };
    let currentUser = users.directivo;

    // --- REFERENCIAS AL DOM ---
    const roleSelector = document.getElementById('role-selector');
    const tabs = document.querySelectorAll('.tab-link');
    const cancelModal = document.getElementById('cancel-reservation-modal');
    const confirmedList = document.getElementById('confirmed-list');
    const historyList = document.getElementById('history-list');

    // --- FUNCIONES PRINCIPALES ---
    const createReservationCardHTML = (res) => {
        const statusClass = `status-${res.estado.toLowerCase()}`;
        const canCancel = currentUser.role === 'Maestro' && res.estado === 'Confirmada';
        return `
            <li class="reservation-item-card" data-id="${res.id}">
                <div class="main-info">
                    <div class="info-block"><span class="label">Recurso</span><strong>${res.recurso}</strong></div>
                    <div class="info-block"><span class="label">Fecha y Hora</span><span>${res.fecha} (${res.horaInicio} - ${res.horaFin})</span></div>
                    <div class="info-block"><span class="label">Profesor</span><span>${res.profesor}</span></div>
                    <div class="info-block"><span class="label">Nivel / Curso</span><span>${res.nivel} - ${res.curso}</span></div>
                    <div class="info-block"><span class="status-badge ${statusClass}">${res.estado}</span></div>
                    ${canCancel ? `<button class="cancel-btn" data-id="${res.id}">Cancelar</button>` : '<div></div>'}
                    ${res.motivoBaja ? `<button class="expand-btn"><i class="fas fa-chevron-down"></i></button>` : '<div></div>'}
                </div>
                ${res.motivoBaja ? `<div class="details-section"><strong>Motivo de Baja:</strong><span>${res.motivoBaja}</span></div>` : ''}
            </li>`;
    };

    const renderLists = () => {
        let reservationsToDisplay = allReservations;
        if (currentUser.role === 'Maestro') {
            reservationsToDisplay = allReservations.filter(res => res.profesorId === currentUser.id);
        }
        const confirmed = reservationsToDisplay.filter(res => res.estado === 'Confirmada').sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const history = reservationsToDisplay.filter(res => ['Finalizada', 'Cancelada'].includes(res.estado)).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        confirmedList.innerHTML = confirmed.map(createReservationCardHTML).join('');
        historyList.innerHTML = history.map(createReservationCardHTML).join('');
    };

    const openCancelModal = (reservationId) => {
        const reservation = allReservations.find(res => res.id === reservationId);
        if (!reservation) return;
        cancelModal.querySelector('#cancel-resource-name').textContent = `${reservation.recurso} de ${reservation.horaInicio} a ${reservation.horaFin}`;
        cancelModal.style.display = 'flex';
        const confirmBtn = cancelModal.querySelector('#confirm-cancel-btn');
        confirmBtn.onclick = () => {
            const reason = cancelModal.querySelector('#cancel-reason-input').value.trim();
            if (!reason) { alert('El motivo de la cancelación es obligatorio.'); return; }
            
            const index = allReservations.findIndex(r => r.id === reservationId);
            if (index !== -1) {
                allReservations[index].estado = 'Cancelada';
                allReservations[index].motivoBaja = `Cancelada por ${currentUser.name}: ${reason}`;
                localStorage.setItem('schoolReservations', JSON.stringify(allReservations));
            }
            
            closeCancelModal();
            renderLists();
        };
    };

    const closeCancelModal = () => {
        cancelModal.querySelector('#cancel-reason-input').value = '';
        cancelModal.style.display = 'none';
        cancelModal.querySelector('#confirm-cancel-btn').onclick = null;
    };

    // --- EVENT LISTENERS ---
    roleSelector.addEventListener('change', (e) => {
        currentUser = e.target.value === 'Maestro' ? users.maestro : users.directivo;
        renderLists();
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.reservation-list').forEach(list => list.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-list`).classList.add('active');
        });
    });

    document.querySelector('.reservations-content').addEventListener('click', (e) => {
        const cancelButton = e.target.closest('.cancel-btn');
        if (cancelButton) {
            openCancelModal(parseInt(cancelButton.dataset.id));
        }
        const expandButton = e.target.closest('.expand-btn');
        if (expandButton) {
            expandButton.closest('.reservation-item-card').classList.toggle('expanded');
        }
    });
    
    cancelModal.querySelector('#close-modal-btn').addEventListener('click', closeCancelModal);
    
    // --- INICIALIZACIÓN ---
    renderLists();
});
