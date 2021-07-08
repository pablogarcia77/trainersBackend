const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST
const mercadopago = require('mercadopago');

const app = express();

const mysqlConnection = require('../database.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// GET all
router.get('/inscripciones/', (req, res) => {
    mysqlConnection.query('SELECT cu.nombre, COUNT(i.id_alumnos) as "inscriptos" FROM inscripciones i,comisiones com, cursos cu WHERE cu.id_cursos=com.id_cursos AND com.id_comisiones=i.id_comisiones GROUP BY cu.nombre;', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

router.get('/inscripciones/fechas/', (req, res) => {
    mysqlConnection.query('SELECT cu.nombre,count(i.id_alumnos) as "cantidad",i.fecha FROM inscripciones i,comisiones com, cursos cu WHERE cu.id_cursos=com.id_cursos AND com.id_comisiones=i.id_comisiones GROUP BY DAY(i.fecha), cu.nombre ORDER BY DAY(i.fecha) AND MONTH(i.fecha) ASC', (err, rows, fields) => {
    // mysqlConnection.query('SELECT cu.nombre,count(i.id_alumnos) as "cantidad",i.fecha FROM inscripciones i,comisiones com, cursos cu WHERE cu.id_cursos=com.id_cursos AND com.id_comisiones=i.id_comisiones GROUP BY DAY(i.fecha) ORDER BY DAY(i.fecha) AND MONTH(i.fecha) ASC', (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let cursos = [];                

                rows.forEach(curso => {
                    if (cursos.filter(item => item.nombre == curso.nombre).length == 0) {
                        cursos.push({                            
                            nombre: curso.nombre,      
                            inscripciones: []                   
                        })
                    }
                });
                cursos.forEach(curso => {                        
                        let inscripciones = rows.filter(comision => curso.nombre == comision.nombre);                        
                        if (inscripciones.length > 0) {
                            inscripciones.forEach(com => {
                                curso.inscripciones.push({
                                    fecha: com.fecha,
                                    cantidad: com.cantidad,
                                });    
                            });                            
                        }
                });
                res.json(cursos);
            }
            // res.json(rows);
        } else {
            console.log(err);
        }
    });
});


router.get('/inscripciones/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT a.alumnos_id,a.nombres,a.apellidos,a.dni,a.celular,a.mail,a.direccion_calle,a.direccion_numero,a.direccion_barrio,a.direccion_localidad,i.fecha,i.estado_pago FROM inscripciones i, alumnos a WHERE a.alumnos_id = i.id_alumnos AND i.id_comisiones = ?', [id], (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});


router.post("/mercadopago", (req, res) => {

    console.log(req.body)

    mercadopago.configure({
        access_token: req.body.access_token
    });

	let preference = {
		items: [{
			title: req.body.description,
			unit_price: Number(req.body.price),
			quantity: Number(req.body.quantity),
		}],
		back_urls: {
			"success": "http://localhost/fullTrainer/pagoaprobado",
			"failure": "http://localhost/fullTrainer/pagorechazado",
			"pending": "http://localhost/fullTrainer/pagopendiente"
		},
		auto_return: 'approved',
        notification_url: 'https://hookb.in/PxxrLbDMYXtpKPrrKMGk',
        redirect_urls: {
            "success": "http://localhost/fullTrainer/pagoaprobado",
			"failure": "http://localhost/fullTrainer/pagorechazado",
			"pending": "http://localhost/fullTrainer/pagopendiente"
        }
	};

	mercadopago.preferences.create(preference)
		.then(function (response) {
			res.json({body :response.body})
            // res.redirect(response.body.init_point)
		}).catch(function (error) {
			console.log(error);
		});

        // const res= await mercadopago.preferences.create(preference)

});

router.get('/feedback', function(request, response) {
    response.json({
       Payment: request.query.payment_id,
       Status: request.query.status,
       MerchantOrder: request.query.merchant_order_id
   })
});

// POST registra una inscripcion
router.post('/inscripciones', (req, res) => {
    const { id_comisiones, id_alumnos, id_pago } = req.body;


    let sql = 'INSERT INTO inscripciones (id_comisiones, id_alumnos, id_pago) VALUES (?,?,?)';
    var valores = [id_comisiones, id_alumnos, id_pago];

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

router.put('/inscripcion/pago/:preference_id', urlencodedParser, (request, response) => {
    const id = request.params.preference_id;

    console.log(id);

    let sql = 'UPDATE inscripciones SET estado_pago=1 WHERE id_pago = "' + id + '"';

    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            response.json(
                { 
                    ok: true,
                    instructor: rows
                }
            );
        } else {
            console.log(err);
        }
    });

});



module.exports = router;