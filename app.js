import express from 'express'
import session from 'express-session'

const app = express();

//Configuracion del middleware de sesiones
app.use(
    session({
        secret: 'p3-LDSE#FrankCastle-sesionespersistentes',// Cambia esto por una clave
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }//1 dia
    })
);

//Ruta para inicializar la sesion
app.get('/iniciar-sesion', (req, res) => {
    if (!req.session.inicio){
        req.session.inicio = new Date();
        req.session.ultimoAcceso = new Date();
        res.send('Sesion Iniciada')
    } else {
        res.send('La Sesion ya esta Activa.');
    }
});

//Ruta para actualizar la fecha de ultima consulta
app.get('/actualizar', (req, res) => {
    if (req.session.inicio){
        req.session.ultimoAcceso = new Date();
        res.send('Fecha de ultima consulta actualizada.');
    } else {
        req.send('No hay una sesion activa.');
    }
});


//Ruta para ver el estado de la sesion
app.get('/estado-sesion', (req, res) => {
    if (req.session.inicio) {
        const inicio = req.session.inicio;
        const ultimoAcceso = req.session.ultimoAcceso;
        const ahora = new Date();

        //Clalcular la antiguedad de la sesion
        const antiguedadMs = ahora - inicio;
        const horas = Math.floor(antiguedadMs / (1000 * 60 *60));
        const minutos = Math.floor((antiguedadMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((antiguedadMs % (1000 * 60)) / 1000);

        //Convertimos las fechas al uso horario deCDMX
        const inicioCDMX = moment(inicio).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm.ss')
        const ultimoAccesoCDMX = moment(ultimoAcceso).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm.ss')


        res.json({
            mensaje: 'Estado de Sesion',
            sesionID: req.sessionID,
            inicio: inicioCDMX,
            ultimoAccesoCDMX,
            antiguedad: `${horas} horas, ${minutos} minutos, ${segundos} segundos`
        })
    } else {
        res.send('No hay una sesion Activa')
    }
})

//Ruta para cerrar la sesion
app.get('7cerrar-sesion', (req, res)=>{
    if (req.session){
        req.session.destroy((err)=> {
            if(err){
                return res.status(500).send('Error al inicar la sesion')
            }
            res.send('Sesion cerrada correctamente')
        });
    }else {
        res.semd('No hay una sesion activa para cerrar.')
    }
})

//Inicializar el Servidor
const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`)
})