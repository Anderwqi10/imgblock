const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class TicketModel {
  create = async (data) => {
    const sql = `INSERT INTO ticket (user_id,subject,status) VALUES (?,?,?)`;
    const [result] = await promisePool.query(sql, [data.user_id, data.subject, 'open']);
    return result;
  }

  list = async (data) => {
    const sql = `SELECT id,user_id,subject,status,created_at,updated_at FROM ticket WHERE user_id=? ORDER BY id DESC`;
    const [rows] = await promisePool.query(sql, [data.user_id]);
    return rows;
  }
}

module.exports = new TicketModel();


