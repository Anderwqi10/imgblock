const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class NotificationModel {
  list = async (data) => {
    const sql = `SELECT id,user_id,type,title,body,is_read,created_at FROM notifications WHERE user_id=? ORDER BY id DESC`;
    const [rows] = await promisePool.query(sql, [data.user_id]);
    return rows;
  }

  markRead = async (data) => {
    const sql = `UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?`;
    const [result] = await promisePool.query(sql, [data.id, data.user_id]);
    return result;
  }
}

module.exports = new NotificationModel();


