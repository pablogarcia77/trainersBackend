const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST
const mysqlConnection = require('../database.js');


// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });




// GET all cursos
router.get('/cursos', (req, res) => {
    mysqlConnection.query('SELECT * FROM cursos', (err, rows, fields) => {
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

// GET all cursos
router.get('/cursos/instructor/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT cu.*, count(i.id_inscripciones) AS "inscriptos"  FROM cursos AS cu LEFT JOIN comisiones AS co ON cu.id_cursos=co.id_cursos LEFT JOIN inscripciones AS i ON i.id_comisiones=co.id_comisiones WHERE cu.id_instructor = ? AND cu.estado_eliminacion = 0 GROUP BY cu.id_cursos;', [id], (err, rows, fields) => {
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
router.get('/cursos/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT * FROM cursos WHERE id_cursos = ?', [id], (err, rows, fields) => {
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
router.get('/cursos/subrubro/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT * FROM cursos WHERE id_subrubros = ?', [id], (err, rows, fields) => {
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
router.delete('/cursos/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('DELETE FROM cursos WHERE id_cursos = ?', [id], (err, rows, fields) => {
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
// Lista todos los cursos con detalle de comision e instructor
router.get('/detallecursos', (req, res) => {

    const { id } = req.params;
    let sql='SELECT CO.id_comisiones, CO.nombre as nombre_comision, CO.descripcion, CO.horario_dias, CO.cupo,' +
        'CU.id_cursos, CU.nombre as nombre_curso, CU.descripcion, CU.publico_destinado, CU.requisitos, CU.url_imagen_presentacion, CU.url_video_presentacion, CU.precio_inscripcion, CU.precio_cuota, CU.cantidad_cuotas, CU.id_subrubros, CU.id_instructor, CU.estado_eliminacion, CU.estado_publicacion, CU.habilita_inscripcion,' +        
        'INS.id_instructor, INS.nombres AS nombre_instructor, INS.apellidos as apellido_instructor, INS.foto_perfil, INS.cv_corto, INS.celular, INS.titulo, INS.dni, INS.mp_public_key, INS.mp_access_token '+
        'FROM comisiones AS CO ' +
        'INNER JOIN cursos AS CU ON CU.id_cursos = CO.id_cursos ' +
        'INNER JOIN instructores AS INS ON INS.id_instructor = CU.id_instructor ';

    console.log(sql);
    mysqlConnection.query(sql, [id], (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let cursos = [];                

                rows.forEach(curso => {
                    if (cursos.filter(item => item.idCurso == curso.id_cursos).length == 0) {
                        cursos.push({                            
                            idCurso: curso.id_cursos,                           
                            nombre: curso.nombre_curso,
                            url_imagen_presentacion: curso.url_imagen_presentacion,
                            precio_inscripcion: curso.precio_inscripcion,
                            precio_cuota: curso.precio_cuota,
                            descripcion: curso.descripcion,
                            requisitos: curso.requisitos,
                            publico_destinado: curso.publico_destinado,
                            estado_publicacion: curso.estado_publicacion,
                            instructor: {
                                idInstructor: curso.id_instructores,
                                nombre: curso.nombre_instructor,
                                apellido: curso.apellido_instructor,
                                foto: curso.foto_perfil,
                                cv: curso.cv_corto,
                                celular: curso.celular,
                                titulo: curso.titulo,
                                dni: curso.dni,
                                mp_public_key: curso.mp_public_key,
                                mp_access_token: curso.mp_access_token
                            },
                            comisiones: []                   
                        })
                    }
                });
                cursos.forEach(curso => {                        
                        let comisiones = rows.filter(comision => curso.idCurso == comision.id_cursos);                        
                        if (comisiones.length > 0) {
                            comisiones.forEach(com => {
                                curso.comisiones.push({
                                    idComision: com.id_comisiones,
                                    nombre: com.nombre_comision,
                                    horario: com.horario_dias,
                                    cupo: com.cupo
                                });    
                            });                            
                        }
                });
                res.json({
                    ok: true,
                    message: 'Cursos con comisiones e instructores',
                    cursos: cursos
                });
            } else
                res.json({
                    ok: false,                    
                    message: 'No hay cursos',
                    cursos: null
                });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});

router.get('/curso/comisiones/instructor/:id', (req, res) => {

    const { id } = req.params;

    // let sql='SELECT CU.id_cursos,CO.id_comisiones, CU.nombre,CO.nombre as nombre_comision, CO.horario_dias, CO.cupo FROM cursos CU, comisiones CO, instructores I WHERE '+
    //         'CU.id_instructor = I.id_instructor AND CU.id_cursos=CO.id_cursos AND I.id_instructor = ? AND CU.estado_eliminacion=0'
    let sql= 'SELECT CU.id_cursos,CO.id_comisiones, CU.nombre,CO.nombre as nombre_comision, CO.horario_dias, CO.cupo, count(i.id_inscripciones) AS "inscriptos" FROM cursos AS CU INNER JOIN comisiones AS co ON CU.id_cursos=co.id_cursos LEFT JOIN inscripciones AS i ON i.id_comisiones=co.id_comisiones WHERE CU.id_instructor = ? AND CU.estado_eliminacion = 0 GROUP BY co.id_comisiones'

    // console.log(sql);
    mysqlConnection.query(sql, [id], (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let cursos = [];                

                rows.forEach(curso => {
                    if (cursos.filter(item => item.idCurso == curso.id_cursos).length == 0) {
                        cursos.push({                            
                            idCurso: curso.id_cursos,                           
                            nombre: curso.nombre,
                            comisiones: []                   
                        })
                    }
                });
                cursos.forEach(curso => {                        
                        let comisiones = rows.filter(comision => curso.idCurso == comision.id_cursos);                        
                        if (comisiones.length > 0) {
                            comisiones.forEach(com => {
                                curso.comisiones.push({
                                    idComision: com.id_comisiones,
                                    nombre: com.nombre_comision,
                                    horario: com.horario_dias,
                                    cupo: com.cupo,
                                    inscriptos: com.inscriptos
                                });    
                            });                            
                        }
                });
                res.json({
                    ok: true,
                    message: 'Cursos con comisiones e instructores',
                    cursos: cursos
                });
            } else
                res.json({
                    ok: false,                    
                    message: 'No hay cursos',
                    cursos: null
                });
        } else {
            res.json({ 
                ok: false,
                error: err
            });
        }
    });
});

// Curso con los detalles de comision e instructor (por id de curso)
router.get('/detallecursos/:id', (req, res) => {
    const { id } = req.params;
    let sql='SELECT CO.id_comisiones, CO.nombre as nombre_comision, CO.descripcion, CO.horario_dias, CO.cupo,' +
        'CU.id_cursos, CU.nombre as nombre_curso, CU.descripcion, CU.publico_destinado, CU.requisitos, CU.url_imagen_presentacion, CU.url_video_presentacion, CU.precio_inscripcion, CU.precio_cuota, CU.cantidad_cuotas, CU.id_subrubros, CU.id_instructor, CU.estado_eliminacion, CU.estado_publicacion, CU.habilita_inscripcion,' +        
        'INS.id_instructor, INS.nombres AS nombre_instructor, INS.apellidos as apellido_instructor, INS.foto_perfil, INS.cv_corto, INS.celular, INS.titulo, INS.dni, INS.mp_public_key, INS.mp_access_token '+
        'FROM comisiones AS CO ' +
        'INNER JOIN cursos AS CU ON CU.id_cursos = CO.id_cursos ' +
        'INNER JOIN instructores AS INS ON INS.id_instructor = CU.id_instructor ' +
        'WHERE CU.id_cursos = ?';

    console.log(sql);
    mysqlConnection.query(sql, [id], (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let cursos = [];                

                rows.forEach(curso => {
                    if (cursos.filter(item => item.idCurso == curso.id_cursos).length == 0) {
                        cursos.push({                            
                            idCurso: curso.id_cursos,                           
                            nombre: curso.nombre_curso,
                            url_imagen_presentacion: curso.url_imagen_presentacion,
                            precio_inscripcion: curso.precio_inscripcion,
                            precio_cuota: curso.precio_cuota,
                            descripcion: curso.descripcion,
                            requisitos: curso.requisitos,
                            publico_destinado: curso.publico_destinado,
                            habilita_inscripcion: curso.habilita_inscripcion,
                            instructor: {
                                idInstructor: curso.id_instructores,
                                nombre: curso.nombre_instructor,
                                apellido: curso.apellido_instructor,
                                foto: curso.foto_perfil,
                                cv: curso.cv_corto,
                                celular: curso.celular,
                                titulo: curso.titulo,
                                dni: curso.dni,
                                mp_public_key: curso.mp_public_key,
                                mp_access_token: curso.mp_access_token
                            },
                            comisiones: []                   
                        })
                    }
                });
                cursos.forEach(curso => {                        
                        let comisiones = rows.filter(comision => curso.idCurso == comision.id_cursos);                        
                        if (comisiones.length > 0) {
                            comisiones.forEach(com => {
                                curso.comisiones.push({
                                    idComision: com.id_comisiones,
                                    nombre: com.nombre_comision,
                                    horario: com.horario_dias,
                                    cupo: com.cupo
                                });    
                            });                            
                        }
                });
                res.json({
                    ok: true,
                    message: 'Cursos con comisiones e instructores',
                    cursos: cursos
                });
            } else
                res.json({
                    ok: false,                    
                    message: 'No hay cursos',
                    cursos: null
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
router.post('/cursos/', urlencodedParser, (req, res) => {
    const { nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros, estado_publicacion, habilita_inscripcion,id_instructor } = req.body;


    let sql = 'INSERT INTO cursos(nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros, estado_publicacion, habilita_inscripcion,id_instructor) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var valores = [nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros, estado_publicacion, habilita_inscripcion,id_instructor];

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
    const { nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros, habilita_inscripcion, estado_publicacion, estado_eliminacion } = req.body;
   
    let sql = 'UPDATE cursos SET nombre=?, descripcion=?, publico_destinado=?, requisitos=?, url_imagen_presentacion=?, url_video_presentacion=?, precio_inscripcion=?, precio_cuota=?, cantidad_cuotas=?, id_subrubros=?, habilita_inscripcion = ?, estado_publicacion = ?, estado_eliminacion = ? WHERE id_cursos=' + id;
    var valores = [nombre, descripcion, publico_destinado, requisitos, url_imagen_presentacion, url_video_presentacion, precio_inscripcion, precio_cuota, cantidad_cuotas, id_subrubros, habilita_inscripcion, estado_publicacion, estado_eliminacion];
    
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