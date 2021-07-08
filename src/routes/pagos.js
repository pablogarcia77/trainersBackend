const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST
const mercadopago = require('mercadopago');

const app = express();

const mysqlConnection = require('../database.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// GET all
router.get('/pagos/', (req, res) => {
    mysqlConnection.query('SELECT cu.nombre, SUM(cu.precio_inscripcion) as "total" FROM inscripciones i,comisiones com, cursos cu WHERE cu.id_cursos=com.id_cursos AND com.id_comisiones=i.id_comisiones AND i.estado_pago=1 GROUP BY cu.nombre', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});


module.exports = router;