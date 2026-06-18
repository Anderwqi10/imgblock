const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class StakingModel {
  listByUser = async (data) => {
    const sql = `SELECT * FROM staking WHERE user_id=? ORDER BY id DESC`;
    const [rows] = await promisePool.query(sql, [data.user_id]);
    return rows;
  }
}

module.exports = new StakingModel();


