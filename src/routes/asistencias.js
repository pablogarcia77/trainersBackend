const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST



const mysqlConnection = require('../database.js');


// GET registra una asistencias en la tabla asistencias
router.get('/asistencias/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('INSERT INTO asistencias (identificador) values (?)', [id], (err, rows, fields) => {
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

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });


router.post('/asistencias/', urlencodedParser, (req, res) => {

    const array = req.body;
    // console.log(array);
    var valores = [];
    

    array.forEach(e => {
        val = [e.alumnos_id,e.id_comisiones]
        valores.push(val)
    });

    console.log(valores)

    let sql = 'INSERT INTO asistencias (id_alumno,id_comision) VALUES ?';
    
    console.log(sql)
    
    mysqlConnection.query(sql, [valores], (err, rows, fields) => {
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