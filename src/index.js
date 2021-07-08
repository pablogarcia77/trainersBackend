const express = require('express');
const app = express();
var cors = require('cors');

// Settings
app.set('port', process.env.PORT || 3004);

// Middlewares
app.use(express.json());


// Control CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, HEAD, POST, OPTIONS, PUT, DELETE');

    next();
});


// Routes
app.use(require('./routes/instructores'));
app.use(require('./routes/cursos'));
app.use(require('./routes/asistencias'));
app.use(require('./routes/alumnos'));
app.use(require('./routes/usuarios'));
app.use(require('./routes/comisiones'));
app.use(require('./routes/inscripciones'));
app.use(require('./routes/subrubros'));
app.use(require('./routes/pagos'));

// Starting the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
})