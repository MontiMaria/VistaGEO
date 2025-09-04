// Este archivo es la ÚNICA fuente de la verdad para los datos de ejemplo.

document.addEventListener('DOMContentLoaded', () => {
    // Revisa si la lista de RECURSOS existe. Si no, crea TODO el set de datos.
    let allResources = JSON.parse(localStorage.getItem('schoolResources'));
    
    if (!allResources || allResources.length === 0) {
        console.log("DATOS.JS: No se encontraron datos. Creando un set de ejemplo completo y consistente...");

        // Datos de ejemplo para los RECURSOS
        const defaultResources = [
            { id: 1, name: 'Proyector Epson', type: 'electronico', quantity: 5, bloqueosFijos: [] },
            { 
                id: 2, name: 'Aula Magna', type: 'aula', quantity: 1,
                bloqueosFijos: [{ "dia": 5, "horaInicio": "10:00", "horaFin": "11:30" }] // Viernes de 10:00 a 11:30
            },
            { id: 3, name: 'Juego de Sillas', type: 'mobiliario', quantity: 10, bloqueosFijos: [] }
        ];
        localStorage.setItem('schoolResources', JSON.stringify(defaultResources));

        // Datos de ejemplo para las RESERVAS, usando los IDs de arriba
        const DEMO_DATE = '2025-09-05'; // Viernes
        const defaultReservations = [
            { id: 101, resourceId: 2, profesorId: 2, profesor: 'María García', recurso: 'Aula Magna', tipoRecurso: 'aula', fecha: DEMO_DATE, horaInicio: '08:00', horaFin: '09:30', nivel: 'Secundario', curso: 'Acto Escolar', descripcion: 'Acto', estado: 'Confirmada', motivoBaja: null },
            { id: 102, resourceId: 1, profesorId: 1, profesor: 'Juan Pérez', recurso: 'Proyector Epson', tipoRecurso: 'electronico', fecha: DEMO_DATE, horaInicio: '14:00', horaFin: '15:00', nivel: 'Secundario', curso: 'Clase de Historia', descripcion: 'Video', estado: 'Confirmada', motivoBaja: null }
        ];
        localStorage.setItem('schoolReservations', JSON.stringify(defaultReservations));
    }
});