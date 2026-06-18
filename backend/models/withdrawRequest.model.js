const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class WithdrawRequestModel {
  create = async (data) => {
    const sql = `INSERT INTO withdraw_request (user_id,withdrawal_address,token,busd_amount,status) VALUES (?,?,?,?,0)`;
    const [result] = await promisePool.query(sql, [data.user_id, data.withdrawal_address, data.token, data.busd_amount]);
    return result;
  }

  listByUser = async (data) => {
    const sql = `SELECT * FROM withdraw_request WHERE user_id=? ORDER BY id DESC`;
    const [rows] = await promisePool.query(sql, [data.user_id]);
    return rows;
  }
}

module.exports = new WithdrawRequestModel();


