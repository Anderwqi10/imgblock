const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class TicketMessageModel {
  create = async (data) => {
    const sql = `INSERT INTO ticket_message (ticket_id,sender,receiver,message) VALUES (?,?,?,?)`;
    const [result] = await promisePool.query(sql, [data.ticket_id, data.sender_id, data.receiver_id || null, data.message]);
    return result;
  }

  list = async (data) => {
    const sql = `SELECT id,ticket_id,sender,receiver,message,datetime FROM ticket_message WHERE ticket_id=? ORDER BY id ASC`;
    const [rows] = await promisePool.query(sql, [data.ticket_id]);
    return rows;
  }
}

module.exports = new TicketMessageModel();


