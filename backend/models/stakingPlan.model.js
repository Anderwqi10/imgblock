const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class StakingPlanModel {
  list = async () => {
    const sql = `SELECT * FROM staking_period ORDER BY id ASC`;
    const [rows] = await promisePool.query(sql);
    return rows;
  }

  find = async (id) => {
    const sql = `SELECT * FROM staking_period WHERE id=? LIMIT 1`;
    const [rows] = await promisePool.query(sql, [id]);
    return rows;
  }
}

module.exports = new StakingPlanModel();


