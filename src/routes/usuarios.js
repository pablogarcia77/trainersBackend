const express = require('express');
const router = express.Router();


var jwt = require('jsonwebtoken')
const bodyParser = require('body-parser'); //bodyParser nos permite reicibir parametros por POST
const mysqlConnection = require('../database.js');
// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


router.post('/login/', urlencodedParser, (req, res) => {
  const { usuario, password } = req.body;
  let sql = 'SELECT u.id_usuarios,i.id_instructor,u.usuario,i.nombres,i.apellidos,i.dni,i.titulo,i.celular,i.email,i.foto_perfil,i.cv_corto,i.mp_public_key,i.mp_access_token,i.estado_eliminacion FROM usuarios u, instructores i WHERE u.id_usuarios=i.id_usuarios AND u.usuario = ? AND u.password = ?';
  mysqlConnection.query(sql, [usuario,password], (err, rows, fields) => {
    if(rows.length === 0){
      res.status(401).send({
        error: 'usuario o contraseña inválidos'
      })
    }else{
      var tokenData = {
        usuario: usuario,
        password: password
        // ANY DATA
      }    
      var token = jwt.sign(tokenData, 'Secret Password', {
          expiresIn: 60 * 15 // expires in 15 minutes
      })

      let instructor = rows[0];
      let id_usuarios = rows[0].id_usuarios;
    
      res.send({
        id_usuarios,
        usuario,
        password,
        token,
        instructor: {
          id_instructores: instructor.id_instructor,
          email: instructor.email,
          estado_eliminacion: instructor.estado_eliminacion,
          nombres: instructor.nombres,
          apellidos: instructor.apellidos,
          dni: instructor.dni,
          titulo: instructor.titulo,
          celular: instructor.celular,
          foto_perfil: instructor.foto_perfil,
          cv_corto: instructor.cv_corto,
          mp_public_key: instructor.mp_public_key,
          mp_access_token: instructor.mp_access_token
        }
      })
    }
  });
});

/* GET usuarios: acceso seguro por autenticacion con token */
router.get('/usuarios', (req, res) => {
    var token = req.headers['authorization']
    if(!token){
        res.status(401).send({
          error: "Es necesario el token de autenticación"
        })
        return
    }
    token = token.replace('Bearer ', '')
    jwt.verify(token, 'Secret Password', function(err, user) {
      if (err) {
        res.status(401).send({
          error: 'Token inválido'
        })
      } else {
        mysqlConnection.query('SELECT * FROM usuarios', (err, rows, fields) => {
            if (!err) {                
                res.send({
                    message: 'Usuarios del sistema',
                    usuarios: rows
                })
            } else {                
                console.log(err);
                res.send({
                    message: 'No se pudo consultar en la BD',
                    usuarios: null
                })
            }
        });        
      }
    })    
});
// Update user
router.put('/usuarios/:id', urlencodedParser, (request, response) => {
  const id = request.params.id;
  const { password,activo } = request.body;

  let sql = 'UPDATE usuarios SET password=?,activo=? WHERE id_usuarios= ' + id;
  const valores = [password,activo];

  mysqlConnection.query(sql, valores, (err, rows, fields) => {
      if (!err) {
          response.json(
              { 
                  ok: true
              }
          );
      } else {
          console.log(err);
      }
  });

});

module.exports = router;