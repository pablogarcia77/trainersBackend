const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST

const mysqlConnection = require('../database.js');

// GET all
router.get('/alumnos', (req, res) => {
    mysqlConnection.query('SELECT * FROM alumnos', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

// GET An instructor por Id
router.get('/alumnos/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT * FROM alumnos WHERE alumnos_id = ?', [id], (err, rows, fields) => {
        if (!err) {
            res.json(rows[0]);
        } else {
            res.status(400).json({
                ok: false,
                mensaje: 'Hubo un problema para generar la respuesta'
            });
        }
    });
});
// GET An instructor por dni
router.get('/alumnos/dni/:dni', (req, res) => {
    const { dni } = req.params;
    mysqlConnection.query('SELECT * FROM alumnos WHERE dni = ?', [dni], (err, rows, fields) => {
        if (!err) {
            res.json(rows[0]);
        } else {
            console.log(err);
        }
    });
});

// DELETE An instructor
router.delete('/alumnos/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('DELETE FROM alumnos WHERE id = ?', [id], (err, rows, fields) => {
        if (!err) {
            res.json({ ok: true });
        } else {
            console.log(err);
        }
    });
});
// DELETE An instructor por dni
router.delete('/alumnos/dni/:dni', (req, res) => {
    const { dni } = req.params;
    mysqlConnection.query('DELETE FROM alumnos WHERE dni = ?', [dni], (err, rows, fields) => {
        if (!err) {
            res.json({ ok: true });
        } else {
            console.log(err);
        }
    });
});

// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// INSERT An instructor
router.post('/alumnos/', urlencodedParser, (req, res) => {
    const { nombres, apellidos, dni, celular, mail, direccion_calle, direccion_numero, direccion_barrio, direccion_localidad } = req.body;

    console.log(req.body)

    let sql = 'INSERT INTO alumnos(nombres, apellidos, dni, celular, mail, direccion_calle, direccion_numero, direccion_barrio, direccion_localidad) VALUES (?,?,?,?,?,?,?,?,?)';
    var valores = [nombres, apellidos, dni, celular, mail, direccion_calle, direccion_numero, direccion_barrio, direccion_localidad];

    mysqlConnection.query(sql, valores, (err, rows, fields) => {
        if (!err) {
            res.json({ 
                ok: true,
                id: rows.insertId
            });
        } else {
            console.log(err);
        }
    });
});



// Update un instructor
router.put('/instructores/dni/:dni', urlencodedParser, (request, response) => {
    const dni = request.params.dni;
    const { saldo } = request.body;
    /* response.json({
        dni: dni,
        saldo: saldo
    }); */
    let sql = 'UPDATE instructores SET saldo=' + saldo + ' WHERE dni=' + dni;
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            response.json({ ok: true });
        } else {
            console.log(err);
        }
    });

});

module.exports = router;