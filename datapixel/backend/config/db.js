const mysql = require('mysql2');

const conexion =
mysql.createConnection({
    host: 'db-datapixel.chcm4o2y0007.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'WYa8oz9H7PhtRBKIA6NR',
    database: 'datastock'
});

conexion.connect((err) => {
    if (err) {
        console.log("Error de conexion", err);
        return;
    }

    console.log("Base de datos conectada");
});

module.exports = conexion;