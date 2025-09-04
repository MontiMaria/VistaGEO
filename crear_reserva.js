document.addEventListener('DOMContentLoaded', () => {
    let allResources = JSON.parse(localStorage.getItem('schoolResources'));
    let allReservations = JSON.parse(localStorage.getItem('schoolReservations'));
    const DEMO_DATE = '2025-09-05';

    if (!allResources || allResources.length === 0) {
        console.log("CREAR_RESERVA: No se encontraron recursos. Creando un set de datos de ejemplo completo...");
        allResources = [
            { id: 1, name: 'Proyector Epson', type: 'electronico', bloqueosFijos: [] },
            { id: 2, name: 'Aula Magna', type: 'aula', bloqueosFijos: [{ "dia": 5, "horaInicio": "10:00", "horaFin": "11:30" }] },
            { id: 3, name: 'Juego de Sillas', type: 'mobiliario', bloqueosFijos: [] }
        ];
        localStorage.setItem('schoolResources', JSON.stringify(allResources));
        allReservations = [
            { id: 102, resourceId: 1, fecha: DEMO_DATE, horaInicio: '14:00', horaFin: '15:00', estado: 'Confirmada' }
        ];
        localStorage.setItem('schoolReservations', JSON.stringify(allReservations));
    }
    
    const resourceSelect = document.getElementById('resource-select');
    const dateInput = document.getElementById('reservation-date');
    const startTimeSelect = document.getElementById('start-time-select');
    const endTimeSelect = document.getElementById('end-time-select');
    const steps = {
        date: document.getElementById('step-date'),
        time: document.getElementById('step-time'),
        details: document.getElementById('step-details'),
        submit: document.getElementById('step-submit')
    };
    
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
    
    const updateAvailability = () => {
        steps.time.classList.remove('active');
        steps.details.classList.remove('active');
        steps.submit.classList.remove('active');
        
        const resourceId = parseInt(resourceSelect.value);
        const selectedDate = dateInput.value;
        if (!resourceId || !selectedDate) return;

        let reservationsForDay = allReservations.filter(r => r.resourceId === resourceId && r.fecha === selectedDate && r.estado !== 'Cancelada');

        const selectedResource = allResources.find(r => r.id === resourceId);
        if (selectedResource && selectedResource.bloqueosFijos) {
            const dayOfWeek = new Date(selectedDate + 'T12:00:00Z').getUTCDay();
            selectedResource.bloqueosFijos.forEach(bloqueo => {
                if (bloqueo.dia === dayOfWeek) {
                    reservationsForDay.push({ horaInicio: bloqueo.horaInicio, horaFin: bloqueo.horaFin });
                }
            });
        }

        const daySchedule = [];
        for (let h = 8; h < 21; h++) {
            ['00', '30'].forEach(m => daySchedule.push({ time: `${String(h).padStart(2, '0')}:${m}`, status: 'free' }));
        }

        reservationsForDay.forEach(res => {
            const start = timeToMinutes(res.horaInicio);
            const end = timeToMinutes(res.horaFin);
            daySchedule.forEach(slot => {
                const slotTime = timeToMinutes(slot.time);
                if (slotTime >= start && slotTime < end) slot.status = 'taken';
            });
        });

        startTimeSelect.innerHTML = '<option value="" disabled selected>-- hh:mm --</option>';
        daySchedule.forEach(slot => {
            const option = new Option(slot.status === 'taken' ? `${slot.time} (Ocupado)` : slot.time, slot.time);
            option.disabled = slot.status === 'taken';
            startTimeSelect.add(option);
        });

        steps.time.classList.add('active');
    };
    
    const updateEndTimeOptions = () => {
        const selectedStartTime = startTimeSelect.value;
        if (!selectedStartTime) return;
        const startMinutes = timeToMinutes(selectedStartTime);
        const resourceId = parseInt(resourceSelect.value);
        const selectedDate = dateInput.value;
        let reservationsForDay = allReservations.filter(r => r.resourceId === resourceId && r.fecha === selectedDate && r.estado !== 'Cancelada');
        
        const selectedResource = allResources.find(r => r.id === resourceId);
        if (selectedResource && selectedResource.bloqueosFijos) {
            const dayOfWeek = new Date(selectedDate + 'T12:00:00Z').getUTCDay();
            selectedResource.bloqueosFijos.forEach(bloqueo => {
                if (bloqueo.dia === dayOfWeek) reservationsForDay.push(bloqueo);
            });
        }

        let nextReservationStart = Infinity;
        reservationsForDay.forEach(res => {
            const resStartMinutes = timeToMinutes(res.horaInicio);
            if (resStartMinutes > startMinutes && resStartMinutes < nextReservationStart) {
                nextReservationStart = resStartMinutes;
            }
        });

        endTimeSelect.innerHTML = '';
        const timeSlots = [];
        for (let hour = 8; hour <= 21; hour++) {
            for (let minute of (hour < 21 ? ['00', '30'] : ['00'])) {
                 if (hour === 8 && minute === '00') continue;
                 timeSlots.push(`${String(hour).padStart(2, '0')}:${minute}`);
            }
        }
        timeSlots.forEach(time => endTimeSelect.add(new Option(time, time)));
        for (let option of endTimeSelect.options) {
            const optionMinutes = timeToMinutes(option.value);
            option.disabled = (optionMinutes <= startMinutes || optionMinutes > nextReservationStart);
        }
    };
    
    // --- EVENT LISTENERS ---

    resourceSelect.addEventListener('change', () => {
        steps.date.classList.add('active');
        dateInput.value = '';
        steps.time.classList.remove('active');
        steps.details.classList.remove('active');
        steps.submit.classList.remove('active');
    });
    
    dateInput.addEventListener('change', updateAvailability);
    
    startTimeSelect.addEventListener('change', updateEndTimeOptions);

    endTimeSelect.addEventListener('change', () => { 
        if (endTimeSelect.value) {
            steps.details.classList.add('active');
        }
    });

    // --- BLOQUE DE CÓDIGO FALTANTE AÑADIDO AQUÍ ---
    // Este listener se encarga de revisar la sección de detalles y mostrar el botón de envío.
    document.getElementById('step-details').addEventListener('input', () => {
        const allRequiredFields = document.querySelectorAll('#step-details [required]');
        const allFilled = [...allRequiredFields].every(field => field.value.trim() !== '');
        
        const submitButton = document.querySelector('#step-submit button');

        if (allFilled) {
            steps.submit.classList.add('active');
            submitButton.disabled = false;
        } else {
            steps.submit.classList.remove('active');
            submitButton.disabled = true;
        }
    });
    // --- FIN DEL BLOQUE AÑADIDO ---

    // --- INICIALIZACIÓN ---
    allResources.forEach(res => resourceSelect.add(new Option(`${res.name} (${res.type})`, res.id)));
    dateInput.min = new Date().toISOString().split("T")[0];
});
