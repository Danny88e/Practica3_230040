import express from 'express';
import session from 'express-session';
import moment from 'moment-timezone';

const app = express();

// Configuración del middleware de sesiones
app.use(
    session({
        secret: 'p3-LDSE#FrankCastle-sesionespersistentes', // Cambia esto por una clave segura
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 día
    })
);

// Ruta para inicializar la sesión
app.get('/iniciar-sesion', (req, res) => {
    if (!req.session.inicio) {
        req.session.inicio = new Date().toISOString(); // Guardar como cadena ISO
        req.session.ultimoAcceso = new Date().toISOString(); // Guardar como cadena ISO
        res.send('Sesión Iniciada');
    } else {
        res.send('La sesión ya está activa.');
    }
});

// Ruta para actualizar la fecha de última consulta
app.get('/actualizar', (req, res) => {
    if (req.session.inicio) {
        req.session.ultimoAcceso = new Date().toISOString(); // Actualizar como cadena ISO
        res.send('Fecha de última consulta actualizada.');
    } else {
        res.send('No hay una sesión activa.');
    }
});

// Ruta para ver el estado de la sesión
app.get('/estado-sesion', (req, res) => {
    if (req.session.inicio) {
        const inicio = new Date(req.session.inicio); // Convertir a Date
        const ultimoAcceso = new Date(req.session.ultimoAcceso); // Convertir a Date
        const ahora = new Date();

        // Verificar si las fechas son válidas
        if (isNaN(inicio) || isNaN(ultimoAcceso)) {
            return res.status(500).send('Error: las fechas de la sesión no son válidas.');
        }

        // Calcular la antigüedad de la sesión
        const antiguedadMs = ahora - inicio;
        const horas = Math.floor(antiguedadMs / (1000 * 60 * 60));
        const minutos = Math.floor((antiguedadMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((antiguedadMs % (1000 * 60)) / 1000);

        // Convertimos las fechas al uso horario de CDMX
        const inicioCDMX = moment(inicio).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const ultimoAccesoCDMX = moment(ultimoAcceso).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            mensaje: 'Estado de Sesión',
            sesionID: req.sessionID,
            inicio: inicioCDMX,
            ultimoAcceso: ultimoAccesoCDMX,
            antiguedad: `${horas} horas, ${minutos} minutos, ${segundos} segundos`,
        });
    } else {
        res.send('No hay una sesión activa');
    }
});

// Ruta para cerrar la sesión
app.get('/cerrar-sesion', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error al cerrar la sesión');
            }
            res.send('Sesión cerrada correctamente');
        });
    } else {
        res.send('No hay una sesión activa para cerrar.');
    }
});

// Inicializar el Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});