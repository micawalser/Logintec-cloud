/**
 * Utilidades para el manejo de fechas con zona horaria de Argentina
 */

/**
 * Formatea una fecha en formato argentino con zona horaria específica
 * @param {string|Date} dateInput - Fecha a formatear
 * @returns {string} Fecha formateada en formato dd/mm/yyyy hh:mm
 */
export const formatDateArgentina = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    let date;
    if (typeof dateInput === 'string') {
        // Manejar diferentes formatos de fecha string
        const isoUtcDateTime = dateInput.replace(' ', 'T') + 'Z';
        date = new Date(isoUtcDateTime);
    } else {
        date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    
    return date.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        hourCycle: 'h23'
    });
};

/**
 * Obtiene la fecha actual en zona horaria de Argentina
 * @returns {Date} Fecha actual en Argentina
 */
export const getCurrentDateArgentina = () => {
    return new Date().toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires'
    });
};

/**
 * Convierte una fecha UTC a zona horaria de Argentina
 * @param {string|Date} utcDate - Fecha UTC
 * @returns {Date} Fecha en zona horaria de Argentina
 */
export const convertUTCToArgentina = (utcDate) => {
    const date = new Date(utcDate);
    return new Date(date.toLocaleString('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires'
    }));
}; 