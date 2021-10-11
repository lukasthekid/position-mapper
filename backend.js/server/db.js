const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    password:"projekt21",
    host:"localhost",
    port:"5433",
    database:"zugradar"

});

module.exports = pool;