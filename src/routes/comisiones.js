const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST
const mysqlConnection = require('../database.js');


// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });




// GET all cursos
router.get('/comisiones', (req, res) => {
    mysqlConnection.query('SELECT * FROM comisiones', (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true,
                rows: rows
            });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});

// GET An curso por Id
router.get('/comisiones/curso/:id', (req, res) => {
    const { id } = req.params;
    // test = 'SELECT co.*, count(i.id_inscripciones) AS "inscriptos" FROM comisiones AS co LEFT JOIN inscripciones AS i ON i.id_comisiones=co.id_comisiones WHERE co.id_cursos=6 GROUP BY co.id_comisiones'
    mysqlConnection.query('SELECT * FROM comisiones WHERE id_cursos = ?', [id], (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true,
                rows: rows
            });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});
// GET An curso por id de subrubro
router.get('/comisiones/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT * FROM comisiones WHERE id_comisiones = ?', [id], (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true,
                rows: rows
            });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});

// DELETE An curso por id
router.delete('/comisiones/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('DELETE FROM comisiones WHERE id_comisiones = ?', [id], (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true 
            });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});

// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// INSERT An curso
router.post('/comisiones/', urlencodedParser, (req, res) => {
    const { nombre, descripcion, horario_dias, cupo, id_cursos } = req.body;


    let sql = 'INSERT INTO comisiones(nombre, descripcion, horario_dias, cupo, id_cursos) VALUES (?,?,?,?,?)';
    var valores = [nombre, descripcion, horario_dias, cupo, id_cursos];

    mysqlConnection.query(sql, valores, (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true 
            });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});



// Update un curso
router.put('/cursos/:id', urlencodedParser, (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros } = req.body;
   
    let sql = 'UPDATE cursos SET nombre=?, descripcion=?, publico_destinado=?, requisitos=?, url_imagen_presentacion=?, url_video_presentacion=?, precio_inscripcion=?, precio_cuota=?, cantidad_cuotas=?, id_subrubros=? WHERE id_cursos=' + id;
    var valores = [nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros];
    
    mysqlConnection.query(sql, valores, (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true 
            });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });

});









module.exports = router;